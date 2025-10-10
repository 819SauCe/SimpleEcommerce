import { Request, Response } from 'express';
import { createStoreRepo, getStoreByIdRepo } from '../Repositorys/StoresRepository';
import { searchRoleByName, createUserRole } from '../Repositorys/UsersRepository';

export async function createStore(req: Request, res: Response) {
  try {
    const ownerId = Number(req.user!.id);
    const { name, handle, primary_domain } = req.body;
    if (!name || !handle) return res.status(400).json({ error: 'name e handle são obrigatórios' });

    const store = await createStoreRepo(ownerId, { name, handle, primary_domain: primary_domain ?? null });
    const ownerRole = await searchRoleByName('store_owner');
    await createUserRole(ownerId, ownerRole.id, store.id);

    return res.status(201).json(store);
  } catch (error: any) {
    if (error.code === '23505') return res.status(409).json({ error: 'handle já existe' });
    if (error.code === '22P02') return res.status(400).json({ error: 'invalid input' });
    return res.status(500).json({ error: 'internal error' });
  }
}

export async function getStoreById(req: Request, res: Response) {
  try {
    const storeId = Number(req.params.storeId);
    const store = await getStoreByIdRepo(storeId);
    if (!store) return res.status(404).json({ error: 'store not found' });
    if (store.owner_id !== Number(req.user!.id)) return res.status(403).json({ error: 'forbidden' });
    return res.json(store);
  } catch (_error: any) {
    return res.status(500).json({ error: 'internal error' });
  }
}
