import { Request, Response } from 'express';
import { createStoreRepo, getStoreByIdRepo, listStoresForUserRepo, userHasAccessToStoreRepo } from '../Repositorys/ProjectsRepository';
import { searchRoleByName, createUserRole } from '../Repositorys/UsersRepository';

export async function createProject(req: Request, res: Response) {
  try {
    const ownerId = Number(req.user?.id);
    if (!Number.isFinite(ownerId)) return res.status(401).json({ error: 'unauthorized' });
    const { name, handle, primary_domain } = req.body;
    if (!name || !handle) return res.status(400).json({ error: 'name e handle são obrigatórios' });
    const project = await createStoreRepo(ownerId, { name, handle, primary_domain: primary_domain ?? null });
    const ownerRole = await searchRoleByName('project_owner');
    if (!ownerRole) return res.status(500).json({ error: 'role project_owner não encontrada' });
    await createUserRole(ownerId, ownerRole.id, project.id);
    return res.status(201).json(project);
  } catch (error: any) {
    if (error.code === '23505') return res.status(409).json({ error: 'handle já existe' });
    if (error.code === '22P02') return res.status(400).json({ error: 'invalid input' });
    return res.status(500).json({ error: 'internal error' });
  }
}

export async function getProjectById(req: Request, res: Response) {
  try {
    const projectId = Number(req.params.projectId);
    if (!Number.isFinite(projectId)) return res.status(400).json({ error: 'invalid projectId' });
    const project = await getStoreByIdRepo(projectId);
    if (!project) return res.status(404).json({ error: 'project not found' });
    const userId = Number(req.user?.id);
    if (!Number.isFinite(userId)) return res.status(401).json({ error: 'unauthorized' });
    const hasAccess = await userHasAccessToStoreRepo(userId, projectId);
    if (!hasAccess) return res.status(403).json({ error: 'forbidden' });
    return res.json(project);
  } catch {
    return res.status(500).json({ error: 'internal error' });
  }
}

export async function listMyProjects(req: Request, res: Response) {
  try {
    const userId = Number(req.user?.id);
    if (!Number.isFinite(userId)) return res.status(401).json({ error: 'unauthorized' });
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));
    const search = typeof req.query.q === 'string' ? req.query.q.trim() : undefined;
    const order: 'asc' | 'desc' = req.query.order === 'asc' ? 'asc' : 'desc';
    const { data, total } = await listStoresForUserRepo(userId, { page, pageSize, q: search, order });
    res.set('X-Total-Count', String(total));
    return res.json({
      data,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch {
    return res.status(500).json({ error: 'internal error' });
  }
}
