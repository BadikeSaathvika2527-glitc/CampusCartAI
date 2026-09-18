import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import type { User, UserRole } from '../src/types.ts';
import { db } from './db.ts';

const SESSION_SECRET = process.env.SESSION_SECRET || 'campuscart-jwt-secure-session-key-2026-prod';
const TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Extend Express Request type with user
declare global {
  namespace Express {
    interface Request {
      user?: User;
      authToken?: string;
    }
  }
}

/**
 * Securely hashes password using PBKDF2 with unique cryptographic salt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifies a plain text password against a stored salt:hash string using timingSafeEqual
 */
export function verifyPassword(password: string, storedHash?: string): boolean {
  if (!storedHash || !storedHash.includes(':')) return false;
  try {
    const [salt, originalHash] = storedHash.split(':');
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(originalHash, 'hex'));
  } catch (e) {
    return false;
  }
}

/**
 * Creates a signed stateless bearer token containing userId, role, and expiration
 */
export function createToken(user: User): string {
  const payload = {
    userId: user.id,
    email: user.email.toLowerCase(),
    role: user.role,
    exp: Date.now() + TOKEN_EXPIRY_MS
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encodedPayload)
    .digest('base64url');

  return `${encodedPayload}.${signature}`;
}

/**
 * Verifies token signature and checks expiry
 */
export function verifyToken(token: string): { userId: string; role: UserRole; email: string } | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encodedPayload, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encodedPayload)
    .digest('base64url');

  try {
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8'));
    if (!payload.exp || Date.now() > payload.exp) {
      return null; // Expired
    }

    return {
      userId: payload.userId,
      role: payload.role as UserRole,
      email: payload.email
    };
  } catch (e) {
    return null;
  }
}

/**
 * Strips sensitive fields like passwordHash from User object before sending to client
 */
export function sanitizeUser(user: User): User {
  const copy = { ...user };
  delete copy.passwordHash;
  return copy;
}

/**
 * Express middleware to identify authenticated user from Authorization header
 */
export function authenticateUser(req: Request, _res: Response, next: NextFunction) {
  let token = '';
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers['x-auth-token']) {
    token = String(req.headers['x-auth-token']).trim();
  }

  if (token) {
    const verified = verifyToken(token);
    if (verified) {
      const user = db.getUserById(verified.userId);
      if (user) {
        // Ensure role hasn't changed in DB
        req.user = user;
        req.authToken = token;
      }
    }
  }

  next();
}

/**
 * Express middleware: rejects unauthenticated requests with HTTP 401
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required. Please sign in to proceed.',
      code: 'UNAUTHENTICATED'
    });
  }
  next();
}

/**
 * Express middleware: enforces specific role(s) on endpoint with HTTP 403 Forbidden
 */
export function requireRole(allowedRoles: UserRole | UserRole[]) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required. Please sign in.',
        code: 'UNAUTHENTICATED'
      });
    }

    // Normalize comparison (handles 'student' or 'STUDENT')
    const userRole = (req.user.role || '').toLowerCase() as UserRole;
    const isAllowed = roles.map(r => r.toLowerCase()).includes(userRole);

    if (!isAllowed) {
      console.warn(`[CampusCart RBAC] Access Denied: User ${req.user.id} (${userRole}) attempted to access ${req.originalUrl || req.url} requiring [${roles.join(', ')}]`);
      return res.status(403).json({
        error: `Access Denied: ${roles.join(' or ').toUpperCase()} privileges required. Your account role (${userRole.toUpperCase()}) does not have permission.`,
        code: 'FORBIDDEN',
        requiredRoles: roles,
        userRole: req.user.role
      });
    }

    next();
  };
}

/**
 * Initial startup routine:
 * - Safely migrates all existing seed users to have hashed passwords without losing any data.
 * - Seeds or verifies the initial ADMIN account based on env or defaults.
 */
export function migrateUsersAndSeedAdmin() {
  const users = db.getUsers();
  let updated = false;

  // 1. Ensure initial admin account exists
  const adminEmail = (process.env.ADMIN_EMAIL || 'campus.admin@campuscart.ai').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@CampusCart2026';

  let adminUser = users.find(u => u.email.toLowerCase() === adminEmail || u.role === 'admin');
  if (!adminUser) {
    console.log('[CampusCart Auth] Provisioning initial secure Admin account...');
    adminUser = db.createUser({
      id: 'admin-1',
      name: 'CampusCart Admin',
      email: adminEmail,
      phone: '+91 99999 88888',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      passwordHash: hashPassword(adminPassword),
      createdAt: new Date().toISOString()
    });
    updated = true;
  } else if (!adminUser.passwordHash) {
    adminUser.passwordHash = hashPassword(adminPassword);
    db.updateUser(adminUser.id, { passwordHash: adminUser.passwordHash });
    updated = true;
  }

  // 2. Ensure all other seeded users have passwordHash
  for (const u of users) {
    if (!u.passwordHash) {
      if (u.role === 'seller') {
        u.passwordHash = hashPassword('Seller@123');
      } else if (u.role === 'student') {
        u.passwordHash = hashPassword('Student@123');
      } else if (u.role === 'admin') {
        u.passwordHash = hashPassword(adminPassword);
      }
      db.updateUser(u.id, { passwordHash: u.passwordHash });
      updated = true;
    }
  }

  if (updated) {
    console.log('[CampusCart Auth] Users safely migrated with secure password hashes.');
  }
}
