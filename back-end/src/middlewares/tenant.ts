import type { RequestHandler } from 'express';
import { findStoreByHost } from '../Repositorys/StoresRepository';

export const resolveTenant: RequestHandler = async (req, _res, next) => {
  const headerTenant = req.header('X-Store-Id');
  if (headerTenant) {
    (req as any).tenantId = Number(headerTenant);
    return next();
  }
  const store = await findStoreByHost(req.hostname);
  (req as any).tenantId = store?.id ?? undefined;
  next();
};