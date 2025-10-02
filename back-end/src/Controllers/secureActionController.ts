import { Request, Response } from 'express';

export function DoSensitiveAction(req: Request, res: Response) {
  const userId = (req as any).oneTimeUserId as string;
  return res.status(200).json({ message: 'Action executed', by: userId });
}
