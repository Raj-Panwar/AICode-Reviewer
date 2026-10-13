import { IncomingMessage, ServerResponse } from 'http';
import { AuthService, TokenPayload } from '../services/authService.js';
import { db, User } from '../database/db.js';

export interface AuthenticatedRequest extends IncomingMessage {
  user?: User;
  tokenPayload?: TokenPayload;
  body?: any;
}

export function parseJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      // 10MB limit guard
      if (raw.length > 10 * 1024 * 1024) {
        reject(new Error('Payload Too Large'));
      }
    });
    req.on('end', () => {
      if (!raw.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(new Error('Invalid JSON format'));
      }
    });
    req.on('error', (err) => reject(err));
  });
}

export function extractAuthUser(req: AuthenticatedRequest): User | undefined {
  const authHeader = req.headers['authorization'];
  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers['cookie']) {
    const match = req.headers['cookie'].match(/token=([^;]+)/);
    if (match) token = match[1];
  }

  if (token) {
    const payload = AuthService.verifyToken(token);
    if (payload) {
      req.tokenPayload = payload;
      const user = db.findUserById(payload.userId);
      if (user) {
        req.user = user;
        return user;
      }
    }
  }

  // Fallback to default user for seamless unauthenticated browsing
  const defaultUser = db.findUserById('usr_default');
  req.user = defaultUser;
  return defaultUser;
}

export function sendJson(res: ServerResponse, statusCode: number, data: any) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

export function sendError(res: ServerResponse, statusCode: number, code: string, message: string) {
  sendJson(res, statusCode, {
    ok: false,
    success: false,
    error: {
      code,
      message
    }
  });
}
