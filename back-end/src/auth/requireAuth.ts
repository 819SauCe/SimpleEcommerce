import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, getBearerToken } from "./jwt";

export interface AuthedRequest extends Request {
    user?: ReturnType<typeof verifyAccessToken>;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
    try {
        const token = getBearerToken(req.headers.authorization) || (req as any).cookies?.access_token;
        if (!token) return res.status(401).json({ error: "Invalid token or expired" });
        const decoded = verifyAccessToken(token);
        req.user = decoded;
        return next();
    } catch (err) {
        return res.status(401).json({ error: "Token inválido ou expirado" });
    }
}
