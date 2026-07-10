import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { verifyPassword } from '../auth/password';
import { signToken } from '../auth/jwt';
import { AUTH_COOKIE_NAME, requireAuth } from '../middleware/auth';

const router = Router();

const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await db
      .selectFrom('users')
      .select(['id', 'email', 'password_hash', 'role'])
      .where('email', '=', email)
      .executeTakeFirst();

    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken({ sub: user.id, role: user.role });
    res.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE_MS,
    });
    res.json({ id: user.id, email: user.email, role: user.role });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie(AUTH_COOKIE_NAME);
  res.status(204).send();
});

router.get('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await db
      .selectFrom('users')
      .select(['id', 'email', 'role'])
      .where('id', '=', req.user!.id)
      .executeTakeFirst();
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

export default router;
