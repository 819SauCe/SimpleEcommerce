// middlewares/csrfGuard.ts
import { Request, Response, NextFunction } from 'express';

export function csrfGuard(req: Request, res: Response, next: NextFunction) {
  // O token do cookie
  const csrfCookie = req.cookies['csrf'];
  // O token enviado pelo cliente no header
  const csrfHeader = req.header('x-csrf');

  // Validar ambos
  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return res.status(403).json({ error: 'CSRF validation failed' });
  }

  return next();
}
