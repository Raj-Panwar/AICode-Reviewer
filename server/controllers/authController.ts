import { ServerResponse } from 'http';
import { AuthenticatedRequest, sendJson, sendError } from '../middleware/authMiddleware.js';
import { AuthService } from '../services/authService.js';
import { db } from '../database/db.js';

export class AuthController {
  public static async register(req: AuthenticatedRequest, res: ServerResponse) {
    const { name, email, password, role, organization } = req.body || {};
    if (!name || !email || !password) {
      return sendError(res, 400, 'INVALID_REQUEST', 'Name, email, and password are required.');
    }
    if (password.length < 6) {
      return sendError(res, 400, 'INVALID_REQUEST', 'Password must be at least 6 characters.');
    }
    try {
      const result = AuthService.register({ name, email, password, role, organization });
      return sendJson(res, 201, { success: true, ...result });
    } catch (err: any) {
      return sendError(res, 400, 'USER_EXISTS', err.message);
    }
  }

  public static async login(req: AuthenticatedRequest, res: ServerResponse) {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return sendError(res, 400, 'INVALID_REQUEST', 'Email and password are required.');
    }
    try {
      const result = AuthService.login(email, password);
      return sendJson(res, 200, { success: true, ...result });
    } catch (err: any) {
      return sendError(res, 401, 'INVALID_CREDENTIALS', err.message);
    }
  }

  public static async me(req: AuthenticatedRequest, res: ServerResponse) {
    if (!req.user) {
      return sendError(res, 401, 'UNAUTHORIZED', 'Not authenticated');
    }
    const { passwordHash, ...safeUser } = req.user;
    return sendJson(res, 200, { success: true, user: safeUser });
  }

  public static async logout(_req: AuthenticatedRequest, res: ServerResponse) {
    return sendJson(res, 200, { success: true, message: 'Logged out successfully.' });
  }
}
