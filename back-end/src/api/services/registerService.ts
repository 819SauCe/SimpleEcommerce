import e, { Request, Response } from 'express';
import { hashPassword } from '../../utils/hashPassword';
import { satinizePassword } from '../../utils/satinizePassword';
import { satinizeName } from '../../utils/satinizeNames';
import { satinizeEmail } from '../../utils/satinizeEmail';
import { getUserByEmail } from '../repository/getUserByEmail';
import { signAccessToken, signRefreshToken } from '../../auth/jwt';
import { jwt_refresh_expires, development } from '../../config';
import { db } from '../../config';
import '../../config';

const jwt_expire_refresh = typeof jwt_refresh_expires === 'string' ? Number.parseInt(jwt_refresh_expires, 10) : jwt_refresh_expires;
if (!Number.isFinite(jwt_expire_refresh)) throw new Error('Invalid jwt_refresh_expires value');

export async function register(req: Request, res: Response) {
    if (!req.body) return res.status(400).json("Error on register: request body is empty");
    if (!req.body.firstName) return res.status(400).json("Error on register: name is empty");
    if (!req.body.lastName) return res.status(400).json("Error on register: last name is empty");
    if (!req.body.email) return res.status(400).json("Error on register: email is empty");
    if (!req.body.password) return res.status(400).json("Error on register: password is empty");
    try {
        const email = satinizeEmail(req.body.email);
        const alreadyExists = await getUserByEmail(email);
        if (alreadyExists) throw new Error('Email already exists');
        const firstName = satinizeName(req.body.firstName);
        const lastName = satinizeName(req.body.lastName);
        const password = satinizePassword(req.body.password);
        const hashedPassword = await hashPassword(password);
        const user = await db.query('INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING *', [firstName, lastName, email, hashedPassword]);
        const accessToken = signAccessToken({ sub: String(user.rows[0].id), role: user.rows[0].role });
        const refreshToken = signRefreshToken({ sub: String(user.rows[0].id) });
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