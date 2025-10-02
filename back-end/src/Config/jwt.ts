import jwt from 'jsonwebtoken';
import { JWT_SESSION_SECRET } from './auth';

type SessionPayload = { sub: string; email: string; };

export function signSession(payload: SessionPayload) {
  return jwt.sign(payload, JWT_SESSION_SECRET, { expiresIn: '30d' });
}

export function verifySession(token: string): SessionPayload {
  return jwt.verify(token, JWT_SESSION_SECRET) as SessionPayload;
}
