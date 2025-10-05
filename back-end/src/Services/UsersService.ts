import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { validateEmail } from '../Utils/validateEmail';
import { validatePassword } from '../Utils/validatePassword';
import { COOKIE_NAME, cookieOpts } from '../Config/auth';
import { signSession } from '../Config/jwt';
import { validateFirstName, validateLastName } from '../Utils/validateNames';
import {
  searchUserByEmail,
  searchUserById,
  createUser,
  searchRoleByName,
  createUserRole,
  searchUsers,
  getRoleByUserId
} from '../Repositorys/UsersRepository';

// Vamos colocar no futuro uma verificação para saber se o email pertence ao usuário
// utilizaremos resend e token para enviar um email de verificação
// além disso vamos integrar captcha para evitar bots
export async function UserRegister(req: Request, res: Response) {
  try {
    const email = validateEmail(req.body.email);
    const alreadyExists = await searchUserByEmail(email);
    if (alreadyExists) return res.status(409).json({ error: 'Email already exists' });
    const firstName = validateFirstName(req.body.firstName);
    const lastName = validateLastName(req.body.lastName);
    const password = validatePassword(req.body.password);
    const KeepMeLoggedIn = req.body.keepMeLoggedIn;
    await createUser({ email, firstName, lastName, password });
    const clientRole = await searchRoleByName('client');
    const user = await searchUserByEmail(email);
    await createUserRole(user.id, clientRole.id, "1");


    if (KeepMeLoggedIn) {
      const sessionToken = signSession({ sub: String(user.id), email: user.email });
      res.cookie(COOKIE_NAME, sessionToken, cookieOpts);
    }

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error: any) {
    console.log(error.message);
    if (error.code === "23505") return res.status(409).json({ error: "Internal server error" });
    if (error.code === "23503") return res.status(400).json({ error: "Internal server error" });
    if (error.code === "22P02") return res.status(400).json({ error: "Internal server error" });
    return res.status(500).json({ error: error.message });
  }
}

export async function UserLogin(req: Request, res: Response) {
  try {
    const email = validateEmail(req.body.email);
    const password = validatePassword(req.body.password);
    const KeepMeLoggedIn = req.body.keepMeLoggedIn;
    const user = await searchUserByEmail(email);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: 'Invalid password' });

    if (!KeepMeLoggedIn) {
      const sessionToken = signSession({ sub: String(user.id), email: user.email });
      res.cookie(COOKIE_NAME, sessionToken, cookieOpts);
    }

    return res.status(200).json({ message: 'Logged in successfully' });
  } catch (error: any) {
    if (error.code === "23505") return res.status(409).json({ error: "Internal server error" });
    if (error.code === "23503") return res.status(400).json({ error: "Internal server error" });
    if (error.code === "22P02") return res.status(400).json({ error: "Internal server error" });
    return res.status(500).json({ error: error.message });
  }
}

export async function UserMe(req: Request, res: Response) {
  try {
    const { id } = req.user!;
    const user = await searchUserById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.status(200).json({ user });
  } catch (error: any) {
    if (error.code === "23505") return res.status(409).json({ error: "Internal server error" });
    if (error.code === "23503") return res.status(400).json({ error: "Internal server error" });
    if (error.code === "22P02") return res.status(400).json({ error: "Internal server error" });
    return res.status(500).json({ error: error.message });
  }
}

export function Logout(_req: Request, res: Response) {
  res.clearCookie(COOKIE_NAME, { path: '/' });
  return res.status(200).json({ message: 'Logged out' });
}

export async function getUsers(req: Request, res: Response) {
  try {
    const { id } = req.user!;
    const isAdmin = await getRoleByUserId(id);
    if (isAdmin.project_id === 1) {
      const users = await searchUsers();
      return res.status(200).json({ users });
    }
    return res.status(403).json({ error: 'Forbidden' });
  } catch (error: any) {
    if (error.code === "23505") return res.status(409).json({ error: "Internal server error" });
    if (error.code === "23503") return res.status(400).json({ error: "Internal server error" });
    if (error.code === "22P02") return res.status(400).json({ error: "Internal server error" });
    return res.status(500).json({ error: error.message });
  }
}

export async function genUser(req: Request, res: Response) {
  try {
    const { id } = req.user!;
    const isAdmin = await getRoleByUserId(id);
    if (isAdmin.project_id !== 1) return res.status(403).json({ error: 'Forbidden' });
    const { firstName, lastName, email, password } = req.body;
    await createUser({ email, firstName, lastName, password });
    const clientRole = await searchRoleByName('client');
    const user = await searchUserByEmail(email);
    await createUserRole(user.id, clientRole.id, "1");

  } catch (error: any) {
    if (error.code === "23505") return res.status(409).json({ error: "Internal server error" });
    if (error.code === "23503") return res.status(400).json({ error: "Internal server error" });
    if (error.code === "22P02") return res.status(400).json({ error: "Internal server error" });
    return res.status(500).json({ error: error.message });
  }
}