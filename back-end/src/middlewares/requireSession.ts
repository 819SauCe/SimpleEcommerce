import { Request, Response, NextFunction } from 'express';
import { COOKIE_NAME } from '../Config/auth';
import { verifySession } from '../Config/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string; role?: string };
    }
  }
}

export function requireSession(req: Request, res: Response, next: NextFunction) {
  const raw = req.cookies?.[COOKIE_NAME];
  if (!raw) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const payload = verifySession(raw);
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}
