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
    if (!req.user) return res.status(401).json({ error: 'não autenticado' });
    const projectId = Number(req.params.projectId);
    await assertProjectAccess(projectId, Number(req.user.id));

    const { path, ...body } = req.body;
    if (!path) return res.status(400).json({ error: 'path é obrigatório' });

    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const page = await upsertPageRepo(projectId, { path: normalizedPath, ...body });

    return res.status(200).json(page);
  } catch (e: any) {
    if (e.status === 403) return res.status(403).json({ error: 'sem permissão' });
    console.error(e);
    return res.status(500).json({ error: 'erro ao salvar página' });
  }
}

export async function listPages(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'não autenticado' });
    const projectId = Number(req.params.projectId);
    await assertProjectAccess(projectId, Number(req.user.id));

    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const rows = await listPagesRepo(projectId, status);
    return res.json(rows);
  } catch (e: any) {
    if (e.status === 403) return res.status(403).json({ error: 'sem permissão' });
    return res.status(500).json({ error: 'erro ao listar páginas' });
  }
}

export async function getPageByPath(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'não autenticado' });
    const projectId = Number(req.params.projectId);
    await assertProjectAccess(projectId, Number(req.user.id));

    const q = (req.query.path as string) || '/';
    const path = q.startsWith('/') ? q : `/${q}`;
    const page = await getPageByPathRepo(projectId, path);

    if (!page) return res.status(404).json({ error: 'página não encontrada' });
    return res.json(page);
  } catch (e: any) {
    if (e.status === 403) return res.status(403).json({ error: 'sem permissão' });
    return res.status(500).json({ error: 'erro ao obter página' });
  }
}
