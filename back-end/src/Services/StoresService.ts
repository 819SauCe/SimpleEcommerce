import { Request, Response } from 'express';
import { createStoreRepo, getStoreByIdRepo } from '../Repositorys/StoresRepository';

export async function createStore(req: Request, res: Response) {
  try {
    const { id } = req.user!;
    const { name, handle, primary_domain } = req.body;
    if (!name || !handle) return res.status(400).json({ error: 'name e handle são obrigatórios' });

    const store = await createStoreRepo(Number(id), { name, handle, primary_domain });
    return res.status(201).json(store);
  } catch (error: any) {
    if (error.code === '23505') return res.status(409).json({ error: 'handle já existe' });
    if (error.code === '22P02') return res.status(400).json({ error: 'invalid input' });
    console.error(error);
    return res.status(500).json({ error: 'internal error' });
  }
}

export async function getStoreById(req: Request, res: Response) {
  try {
    const storeId = Number(req.params.storeId);
    const store = await getStoreByIdRepo(storeId);
    if (!store) return res.status(404).json({ error: 'store not found' });
    if (store.owner_id !== req.user!.id) return res.status(403).json({ error: 'forbidden' });
    res.json(store);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'internal error' });
  }
}
