import { Request, Response } from 'express';
import { verifyHashPassword } from '../../utils/verifyHashPassword';
import { satinizeEmail } from '../../utils/satinizeEmail';
import { getUserByEmail } from '../repository/getUserByEmail';
import { signAccessToken, signRefreshToken } from '../../auth/jwt';
import { jwt_refresh_expires, development } from '../../config';
import { verifyCaptchaToken } from '../../utils/captcha';
import '../../config';

const jwt_expire_refresh = typeof jwt_refresh_expires === 'string' ? Number.parseInt(jwt_refresh_expires, 10) : jwt_refresh_expires;
if (!Number.isFinite(jwt_expire_refresh)) throw new Error('Invalid jwt_refresh_expires value');

export async function login(req: Request, res: Response) {
    if (!req.body) return res.status(400).json("Error on login: request body is empty");
    if (!req.body.email) return res.status(400).json("Error on login: email is empty");
    if (!req.body.password) return res.status(400).json("Error on login: password is empty");
    
    const { captchaAnswer, captchaToken } = req.body;
    if (!verifyCaptchaToken(captchaToken, captchaAnswer)) {
        return res.status(400).json({ error: true, message: "Captcha inválido ou expirado" });
    }
    
    try {
        const email = satinizeEmail(req.body.email);
        const user = await getUserByEmail(email);
        const password = String(req.body.password);
        const passwordIsValid = await verifyHashPassword(password, user.password);
        if (!passwordIsValid) throw new Error('Invalid credentials');
        const accessToken = signAccessToken({ sub: String(user.id), role: user.role });
        const refreshToken = signRefreshToken({ sub: String(user.id) });

        res.cookie('refresh_token', refreshToken, {
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