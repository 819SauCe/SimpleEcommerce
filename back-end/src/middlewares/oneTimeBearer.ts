import { Request, Response, NextFunction } from 'express';
import { consumeOneTimeToken } from '../oneTime/store';

export function requireOneTimeBearer(req: Request, res: Response, next: NextFunction) {
  const auth = req.header('authorization') || '';
  const [scheme, token] = auth.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return res.status(401).json({ error: 'Missing Bearer token' });
  }

  const result = consumeOneTimeToken(token);
  if (!result.ok) {
    const map = {
      not_found: 'Token not found',
      used: 'Token already used',
      expired: 'Token expired',
    } as const;
    return res.status(401).json({ error: map[result.reason] });
  }

  (req as any).oneTimeUserId = result.userId;
  return next();
}
