import { Request, Response } from 'express';
import { verifyHashPassword } from '../../utils/verifyHashPassword';
import { satinizeEmail } from '../../utils/satinizeEmail';
import { getUserByEmail } from '../repository/getUserByEmail';
import { signAccessToken, signRefreshToken } from '../../auth/jwt';
import { jwt_refresh_expires, development } from '../../config';
import { verifyAccessToken } from '../../auth/jwt';
import '../../config';

const jwt_expire_refresh = typeof jwt_refresh_expires === 'string' ? Number.parseInt(jwt_refresh_expires, 10) : jwt_refresh_expires;
if (!Number.isFinite(jwt_expire_refresh)) throw new Error('Invalid jwt_refresh_expires value');

export async function refresh(req: Request, res: Response) {
  try {
    if(!req.cookies?.refresh_token) return res.status(401).json({ error: "Invalid token or expired" });
    const refreshToken = req.cookies.refresh_token;
    const decoded = verifyAccessToken(refreshToken);
    const email = satinizeEmail(decoded.email);
    const user = await getUserByEmail(email);
    const password = req.body.password;
    const passwordIsValid = await verifyHashPassword(password, user.password);
    if (passwordIsValid === false) throw new Error('Invalid password');
    const accessToken = signAccessToken({ sub: String(user.id), role: user.role });
    const newRefreshToken = signRefreshToken({ sub: String(user.id) });
    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: development !== 'dev',
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: jwt_expire_refresh,
    });
    res.status(200).json({ sucess: true, token: accessToken, expireIn: Date.now() + jwt_expire_refresh });
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json("Internal server error");
  }
}