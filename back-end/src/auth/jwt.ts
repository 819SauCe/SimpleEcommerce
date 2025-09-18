import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { jwt_access_secret, jwt_refresh_secret, jwt_access_expires, jwt_refresh_expires } from "../config";

export type JwtSubject = string;
export type AccessPayload  = { sub: JwtSubject; role?: string };
export type RefreshPayload = { sub: JwtSubject };

type ExpiresIn = NonNullable<SignOptions["expiresIn"]>;
function asExpiresIn(v: string | number): ExpiresIn {
  return (typeof v === "number" ? v : (v as unknown as ExpiresIn));
}

const baseOptions: Omit<SignOptions, "expiresIn"> = {
  algorithm: "HS256",
};

export function signAccessToken(payload: AccessPayload, opts?: SignOptions): string {
  return jwt.sign(payload, jwt_access_secret, {
    ...baseOptions,
    expiresIn: asExpiresIn(jwt_access_expires),
    ...opts,
  });
}

export function signRefreshToken(payload: RefreshPayload, opts?: SignOptions): string {
  return jwt.sign(payload, jwt_refresh_secret, {
    ...baseOptions,
    expiresIn: asExpiresIn(jwt_refresh_expires),
    ...opts,
  });
}

export function verifyAccessToken(token: string): AccessPayload & JwtPayload {
  return jwt.verify(token, jwt_access_secret, { algorithms: ["HS256"] }) as AccessPayload & JwtPayload;
}

export function verifyRefreshToken(token: string): RefreshPayload & JwtPayload {
  return jwt.verify(token, jwt_refresh_secret, { algorithms: ["HS256"] }) as RefreshPayload & JwtPayload;
}

export function getBearerToken(auth?: string): string | null {
  if (!auth || !auth.startsWith("Bearer ")) return null;
  return auth.slice(7).trim();
}
