export {};

declare global {
  namespace Express {
    interface Request {
      tenantId?: number;
      user?: { id: number; email?: string };
    }
  }
}
