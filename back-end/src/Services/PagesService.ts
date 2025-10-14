import { Request, Response } from 'express';
import { getStoreByIdRepo } from '../Repositorys/ProjectsRepository';
import { upsertPageRepo, listPagesRepo, getPageByPathRepo } from '../Repositorys/PagesRepository';

async function assertProjectAccess(projectId: number, userId: number) {
  const project = await getStoreByIdRepo(projectId);
  if (!project || project.owner_id !== userId) {
    const err: any = new Error('forbidden');
    err.status = 403;
    throw err;
  }
}

export async function upsertPageByPath(req: Request, res: Response) {
  try {
    const projectId = Number(req.params.projectId);
    await assertProjectAccess(projectId, Number(req.user!.id));

    const body = req.body || {};
    if (!body.path) return res.status(400).json({ error: 'path é obrigatório' });
    const raw = String(body.path).trim();
    const normalizedPath = raw.startsWith('/') ? raw : `/${raw}`;

    const page = await upsertPageRepo(projectId, {
      path: normalizedPath,
      name: body.name,
      type: body.type,
      header: body.header,
      footer: body.footer,
      content: body.content,
      seo: body.seo,
      canonical_url: body.canonical_url,
      status: body.status
    });

    return res.json(page);
  } catch (e: any) {
    return res.status(e.status || 500).json({ error: e.status ? 'sem permissão' : 'erro ao salvar página' });
  }
}

export async function listPages(req: Request, res: Response) {
  try {
    const projectId = Number(req.params.projectId);
    await assertProjectAccess(projectId, Number(req.user!.id));
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const rows = await listPagesRepo(projectId, status);
    return res.json(rows);
  } catch (e: any) {
    return res.status(e.status || 500).json({ error: 'erro ao listar páginas' });
  }
}

export async function getPageByPath(req: Request, res: Response) {
  const projectId = Number(req.params.projectId);
  const q = (req.query.path as string) || '/';
  const path = q.startsWith('/') ? q : `/${q}`;
  const page = await getPageByPathRepo(projectId, path);
  if (!page) return res.status(404).json({ error: 'página não encontrada' });
  return res.json(page);
}