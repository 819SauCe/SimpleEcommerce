import pool from "../Config/connectDB";

export async function createStoreRepo(
  ownerId: number,
  { name, handle, primary_domain }: { name: string; handle: string; primary_domain?: string | null }
) {
  const { rows } = await pool.query(
    `insert into stores (owner_id, name, handle, primary_domain)
     values ($1,$2,$3,$4)
     returning id, owner_id, name, handle, primary_domain, created_at`,
    [ownerId, name, handle, primary_domain ?? null]
  );
  return rows[0];
}

export async function getStoreByIdRepo(id: number) {
  const { rows } = await pool.query(
    `select id, owner_id, name, handle, primary_domain, created_at
     from stores where id = $1`,
    [id]
  );
  return rows[0] || null;
}

export async function getStoreByHandleRepo(handle: string) {
  const { rows } = await pool.query(
    `select id, owner_id, name, handle, primary_domain, created_at
     from stores where handle = $1`,
    [handle]
  );
  return rows[0] || null;
}

export async function getStoreByPrimaryDomainRepo(domain: string) {
  const { rows } = await pool.query(
    `select id, owner_id, name, handle, primary_domain, created_at
     from stores where primary_domain = $1`,
    [domain]
  );
  return rows[0] || null;
}

export async function findStoreByHost(host: string) {
  const storeByDomain = await getStoreByPrimaryDomainRepo(host);
  if (storeByDomain) return storeByDomain;

  const handle = host.split('.')[0];
  if (!handle) return null;

  const storeByHandle = await getStoreByHandleRepo(handle);
  return storeByHandle;
}
