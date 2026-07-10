import { UserRole } from './db';

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; role: UserRole };
    }
  }
}

export {};
