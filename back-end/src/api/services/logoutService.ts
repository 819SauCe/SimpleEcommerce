import { Request, Response } from 'express';
import { verifyHashPassword } from '../../utils/verifyHashPassword';
import { satinizeEmail } from '../../utils/satinizeEmail';
import { getUserByEmail } from '../repository/getUserByEmail';
import { signAccessToken, signRefreshToken } from '../../auth/jwt';
import { jwt_refresh_expires, development } from '../../config';
import '../../config';

export async function logout(req: Request, res: Response) {
    try {
        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: development !== 'dev',
            sameSite: 'strict',
            path: '/auth/refresh',
        });
        res.status(204).end();
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json("Internal server error");
    }
}