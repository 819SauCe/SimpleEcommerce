import { Request, Response } from 'express';
import { createOneTimeToken } from '../oneTime/store';

export function IssueOneTimeToken(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const token = createOneTimeToken(userId, 300);
  return res.status(200).json({ token, expires_in: 300 });
}
