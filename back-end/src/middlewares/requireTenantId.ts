import type { RequestHandler } from 'express';

export const requireTenantId: RequestHandler = (req, res, next) => {
  const fromHeader = req.header('X-Store-Id');
  const id = Number((req as any).tenantId ?? fromHeader);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'missing tenantId' });
  (req as any).tenantId = id;
  next();
};
