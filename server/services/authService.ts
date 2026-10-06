import crypto from 'crypto';
import { db, User } from '../database/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'ai-code-reviewer-super-secret-key-prod-2026';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  exp: number;
}

export class AuthService {
  /**
   * Secure salted PBKDF2 password hashing
   */
  public static hashPassword(password: string): string {
    const salt = 'ai-code-reviewer-salt-v1';
    return crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha256').toString('hex');
  }

  public static verifyPassword(password: string, storedHash: string): boolean {
    const hash = this.hashPassword(password);
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(storedHash));
  }

  /**
   * Generate lightweight stateless HMAC-SHA256 JWT
   */
  public static generateToken(user: User): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 // 7 days
    };
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');
    return `${header}.${body}.${signature}`;
  }

  /**
   * Verify and decode HMAC-SHA256 JWT
   */
  public static verifyToken(token: string): TokenPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const [header, body, signature] = parts;
      const expectedSig = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${header}.${body}`)
        .digest('base64url');
      if (signature !== expectedSig) return null;

      const payload: TokenPayload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return null; // Expired
      }
      return payload;
    } catch {
      return null;
    }
  }

  /**
   * Register a new user
   */
  public static register(data: { name: string; email: string; password: string; role?: string; organization?: string }): { user: Omit<User, 'passwordHash'>; token: string } {
    const existing = db.findUserByEmail(data.email);
    if (existing) {
      throw new Error('User already exists with this email address');
    }
    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: data.name,
      email: data.email,
      passwordHash: this.hashPassword(data.password),
      role: data.role || 'Software Engineer',
      organization: data.organization || 'Engineering Team',
      createdAt: new Date().toISOString()
    };
    db.createUser(newUser);
    const token = this.generateToken(newUser);
    const { passwordHash, ...safeUser } = newUser;
    return { user: safeUser, token };
  }

  /**
   * Login user with credentials
   */
  public static login(email: string, password: string): { user: Omit<User, 'passwordHash'>; token: string } {
    const user = db.findUserByEmail(email);
    if (!user || !this.verifyPassword(password, user.passwordHash)) {
      throw new Error('Invalid email or password');
    }
    const token = this.generateToken(user);
    const { passwordHash, ...safeUser } = user;
    return { user: safeUser, token };
  }
}
