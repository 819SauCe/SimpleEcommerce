import { Request, Response } from 'express';
import { satinizeEmail } from '../../utils/satinizeEmail';
import { getUserByEmail } from '../repository/getUserByEmail';
import { signAccessToken } from '../../auth/jwt';
import { hashPassword } from '../../utils/hashPassword';
import { db, resendApiKey } from '../../config';
import '../../config';
import { Resend } from 'resend';

const resend = new Resend(resendApiKey);

export async function resetPassword(req: Request, res: Response) {
  if (!req.body) return res.status(400).json('Error on reset password: request body is empty');
  if (!req.body.email) return res.status(400).json('Error on reset password: email is empty');

  try {
    const email = satinizeEmail(req.body.email);
    const user = await getUserByEmail(email);
    if (!user) return res.status(200).json({ success: true });

    const accessToken = signAccessToken({ sub: String(user.id), role: user.role });
    const url = `http://localhost:3000/auth/reset-password/${accessToken}`;

    await db.query('INSERT INTO reset_passwords (user_id, token) VALUES ($1, $2)', [user.id, accessToken]);

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Reset your password',
      html: `<p>Click <a href="${url}">here</a> to reset your password</p>`,
    });

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error(error?.message || error);
    return res.status(500).json('Internal server error');
  }
}

export async function resetPasswordConfirm(req: Request, res: Response) {
  if (!req.body) return res.status(400).json('Error on reset password confirm: request body is empty');
  if (!req.body.token) return res.status(400).json('Error on reset password confirm: token is empty');
  if (!req.body.password) return res.status(400).json('Error on reset password confirm: password is empty');

  try {
    const token: string = req.body.token;
    const password: string = req.body.password;

    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json('Error on reset password confirm: password must be at least 8 characters');
    }

    const { rows: resetRows } = await db.query(
      'SELECT user_id FROM reset_passwords WHERE token = $1',
      [token]
    );
    if (resetRows.length === 0) {
      return res.status(400).json('Error on reset password confirm: token is invalid');
    }

    const userId = resetRows[0].user_id;
    const { rows: userRows } = await db.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userRows.length === 0) {
      return res.status(400).json('Error on reset password confirm: user not found');
    }

    const hashedPassword = await hashPassword(password);

    await db.query('BEGIN');
    await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);
    await db.query('DELETE FROM reset_passwords WHERE user_id = $1', [userId]);
    await db.query('COMMIT');

    return res.status(200).json({ success: true });
  } catch (error: any) {
    try { await db.query('ROLLBACK'); } catch { }
    console.error(error?.message || error);
    return res.status(500).json('Internal server error');
  }
}
