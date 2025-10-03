import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { validateEmail } from '../Utils/validateEmail';
import { validatePassword } from '../Utils/validatePassword';
import { searchUserById, searchUserRoleByUserId} from '../Repositorys/UsersRepositorys';
import { createStore } from '../Repositorys/StoreRepository';
import { COOKIE_NAME, cookieOpts } from '../Config/auth';
import { signSession } from '../Config/jwt';
import { validateFirstName, validateLastName } from '../Utils/validateNames';

export async function createPage(req: Request, res: Response) {
  try {
    const user = await searchUserById(req.body.id);
    if(!user) throw new Error('User not found');
    if(user.cpf === null) throw new Error('you cant create a store, missing cpf');
    if(user.cpf === undefined) throw new Error('you cant create a store, missing cpf');
    const role = await searchUserRoleByUserId(user.id, req.body.projectId);
    if(!role) throw new Error('User not found');

    const { name, type, url, route, header, html, footer, seoTittle, seoDescription } = req.body;
    const sendHeader = "<header>Seu header :D</header>";
    const sendHtml = "<div>Hello World!</div>";
    const sendFooter = "<footer>minha pagina</footer>";

    const store = await createStore(user.id, name, type, url, route, sendHeader, sendHtml, sendFooter, seoTittle, seoDescription);
    res.status(201).json(store);

  } catch(error: any) {
    console.log(error);
    if (error.code === "23505") return res.status(409).json({ error: "Internal server error" });
    if (error.code === "23503") return res.status(400).json({ error: "Internal server error" });
    if (error.code === "22P02") return res.status(400).json({ error: "Internal server error" });
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
