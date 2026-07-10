import jwt from 'jsonwebtoken';
import { UserRole } from '../types/db';

export interface TokenPayload {
  sub: number;
  role: UserRole;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET must be set');
  return secret;
}

export function signToken(payload: TokenPayload): string {
  const expiresIn = (process.env.JWT_EXPIRES_IN ?? '7d') as jwt.SignOptions['expiresIn'];
  return jwt.sign(payload, getSecret(), { expiresIn });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, getSecret()) as unknown as TokenPayload;
}
