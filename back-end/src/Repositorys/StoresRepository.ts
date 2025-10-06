import pool from "../Config/connectDB";

export async function createStoreRepo(ownerId: number, {
  name, handle, primary_domain
}: { name: string; handle: string; primary_domain?: string | null }) {
  const { rows } = await pool.query(
    `INSERT INTO stores (owner_id, name, handle, primary_domain)
     VALUES ($1,$2,$3,$4)
     RETURNING id, owner_id, name, handle, primary_domain, created_at`,
    [ownerId, name, handle, primary_domain ?? null]
  );
  return rows[0];
}

export async function getStoreByIdRepo(id: number) {
  const { rows } = await pool.query(
    `SELECT id, owner_id, name, handle, primary_domain, created_at FROM stores WHERE id=$1`,
    [id]
  );
  return rows[0] || null;
}
