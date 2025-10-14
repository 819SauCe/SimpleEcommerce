import { Request, Response } from 'express';
import { createStoreRepo, getStoreByIdRepo } from '../Repositorys/ProjectsRepository';
import { searchRoleByName, createUserRole } from '../Repositorys/UsersRepository';

export async function createProject(req: Request, res: Response) {
  try {
    const ownerId = Number(req.user!.id);
    const { name, handle, primary_domain } = req.body;
    if (!name || !handle) return res.status(400).json({ error: 'name e handle são obrigatórios' });

    const project = await createStoreRepo(ownerId, { name, handle, primary_domain: primary_domain ?? null });
    const ownerRole = await searchRoleByName('project_owner');
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
    const project = await getStoreByIdRepo(projectId);
    if (!project) return res.status(404).json({ error: 'project not found' });
    if (project.owner_id !== Number(req.user!.id)) return res.status(403).json({ error: 'forbidden' });
    return res.json(project);
  } catch (_error: any) {
    return res.status(500).json({ error: 'internal error' });
  }
}