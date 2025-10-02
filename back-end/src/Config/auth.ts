export const JWT_SESSION_SECRET = process.env.JWT_SESSION_SECRET || 'dev-session-secret';
export const COOKIE_NAME = 'sid';
export const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;

export const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: THIRTY_DAYS,
  path: '/',
};
