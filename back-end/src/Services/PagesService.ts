import { Request, Response } from 'express';
import { getStoreByIdRepo } from '../Repositorys/StoresRepository';
import { upsertPageRepo, listPagesRepo, getPageByPathRepo } from '../Repositorys/PagesRepository';

async function assertStoreAccess(storeId: number, userId: number) {
  const store = await getStoreByIdRepo(storeId);
  if (!store || store.owner_id !== userId) {
    const err: any = new Error('forbidden');
    err.status = 403;
    throw err;
  }
}

export async function upsertPageByPath(req: Request, res: Response) {
  try {
    const storeId = Number(req.params.storeId);
    await assertStoreAccess(storeId, Number(req.user!.id));

    const body = req.body || {};
    if (!body.path) return res.status(400).json({ error: 'path é obrigatório' });
    // normaliza path
    const path = ('' + body.path).trim();
    if (!path.startsWith('/')) body.path = '/' + path;

    const page = await upsertPageRepo(storeId, {
      path: body.path,
      name: body.name,
      type: body.type,
      header: body.header,
      footer: body.footer,
      content: body.content,
      seo: body.seo,
      canonical_url: body.canonical_url,
      status: body.status
    });

    res.json(page);
  } catch (e: any) {
    console.error(e);
    res.status(e.status || 500).json({ error: e.status ? 'sem permissão' : 'erro ao salvar página' });
  }
}

export async function listPages(req: Request, res: Response) {
  try {
    const storeId = Number(req.params.storeId);
    await assertStoreAccess(storeId, Number(req.user!.id));
    const rows = await listPagesRepo(storeId, typeof req.query.status === 'string' ? req.query.status : undefined);
    res.json(rows);
  } catch (e: any) {
    console.error(e);
    res.status(e.status || 500).json({ error: 'erro ao listar páginas' });
  }
}

export async function getPageByPath(req: Request, res: Response) {
  const storeId = Number(req.params.storeId);
  const q = (req.query.path as string) || '/';
  const path = q.startsWith('/') ? q : '/' + q;
  const page = await getPageByPathRepo(storeId, path);
  if (!page) return res.status(404).json({ error: 'página não encontrada' });
  res.json(page);
}
