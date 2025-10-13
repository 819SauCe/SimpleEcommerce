import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { validateEmail } from '../Utils/validateEmail';
import { validatePassword } from '../Utils/validatePassword';
import { COOKIE_NAME, cookieOpts } from '../Config/auth';
import { signSession } from '../Config/jwt';
import { generateCsrfToken } from '../Utils/generateCsrfToken';
import { validateFirstName, validateLastName } from '../Utils/validateNames';
import { validateCNPJ, validateCPF, } from '../Utils/validateCpfAndCpnj';
import { validateImageUrl } from '../Utils/validateImage';
import { validateBRPhone } from '../Utils/validateTellPhone';
import {
  searchUserByEmail,
  searchUserById,
  createUser,
  searchRoleByName,
  createUserRole,
  searchUsers,
  userHasPermission,
  updateUserById,
} from '../Repositorys/UsersRepository';

function noStore(res: Response) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
}

export async function UserRegister(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId as number | undefined;

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
    await createUserRole(user.id, clientRole.id, tenantId ?? 1);

    const sessionToken = signSession({
      sub: String(user.id),
      email: user.email,
      tenantId
    });

    if (KeepMeLoggedIn) {
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOpts, maxAge: 30 * 24 * 60 * 60 * 1000 });
    } else {
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOpts, maxAge: 15 * 60 * 1000 });
    }

    noStore(res);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ error: error.message });
  }
}

export async function UserLogin(req: Request, res: Response) {
  try {
    const tenantId = (req as any).tenantId as number | undefined;
    const email = validateEmail(req.body.email);
    const password = validatePassword(req.body.password);
    const KeepMeLoggedIn = req.body.keepMeLoggedIn;

    const user = await searchUserByEmail(email);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: 'Invalid password' });

    const sessionToken = signSession({
      sub: String(user.id),
      email: user.email,
      tenantId
    });

    const csrfToken = generateCsrfToken();
    res.cookie('csrf', csrfToken, {
      sameSite: 'strict',
      secure: true,
      path: '/',
      maxAge: 2 * 60 * 60 * 1000,
    });

    if (KeepMeLoggedIn) {
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOpts, maxAge: 30 * 24 * 60 * 60 * 1000 });
    } else {
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOpts, maxAge: 15 * 60 * 1000 });
    }

    noStore(res);
    return res.status(200).json({ message: 'Logged in successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function UserMe(req: Request, res: Response) {
  try {
    const { id } = req.user!;
    const user = await searchUserById(Number(id));
    if (!user) return res.status(404).json({ error: 'User not found' });
    noStore(res);
    return res.status(200).json({ user });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export function Logout(_req: Request, res: Response) {
  res.clearCookie(COOKIE_NAME, { ...cookieOpts, maxAge: undefined });
  noStore(res);
  return res.status(200).json({ message: 'Logged out' });
}

export async function getUsers(req: Request, res: Response) {
  try {
    const { id } = req.user!;
    const tenantId = Number((req as any).tenantId);
    if (!Number.isFinite(tenantId)) return res.status(400).json({ error: 'missing tenantId' });
    const ok = await userHasPermission(Number(id), tenantId, 'users.read');
    if (!ok) return res.status(403).json({ error: 'Forbidden' });
    const users = await searchUsers(tenantId);
    return res.status(200).json({ users });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function genUser(req: Request, res: Response) {
  try {
    const { id } = req.user!;
    const tenantId = (req as any).tenantId as number | undefined;
    const ok = await userHasPermission(Number(id), Number(tenantId), 'users.create');
    if (!ok) return res.status(403).json({ error: 'Forbidden' });

    const { firstName, lastName, email, password } = req.body;
    await createUser({ email, firstName, lastName, password });
    const clientRole = await searchRoleByName('client');
    const user = await searchUserByEmail(email);
    await createUserRole(user.id, clientRole.id, tenantId ?? 1);

    noStore(res);
    return res.status(201).json({ message: 'User created successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function updateDataUser(req: Request, res: Response) {
  try {
    const rawId = req.user?.id;
    const userId = Number(rawId);
    if (!Number.isInteger(userId)) return res.status(401).json({ error: 'Unauthorized' });

    const { firstName, lastName, cpf, cnpj, phone, userImage } = req.body ?? {};
    const updates: any = {};
    if (firstName !== undefined && firstName !== null && firstName !== '') updates.first_name = validateFirstName(firstName);
    if (lastName !== undefined && lastName !== null && lastName !== '') updates.last_name = validateLastName(lastName);
    if (cpf !== undefined && cpf !== null && cpf !== '') updates.cpf = validateCPF(req.body.cpf);
    if (cnpj !== undefined && cnpj !== null && cnpj !== '' ) updates.cnpj = validateCNPJ(req.body.cnpj);
    if (phone !== undefined && phone !== null && phone !== '') updates.phone = validateBRPhone(phone);
    if (userImage !== undefined && userImage !== null && userImage !== '') updates.user_image = validateImageUrl(userImage);

    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'Nenhum campo válido para atualizar' });

    const updated = await updateUserById(userId, updates);
    if (!updated) return res.status(404).json({ error: 'User not found' });

    noStore(res);
    return res.status(200).json({ message: 'Perfil atualizado com sucesso', user: updated });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
