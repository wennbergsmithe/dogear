import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../auth/jwt';

export const AUTH_COOKIE_NAME = 'dogear_token';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  next();
}
