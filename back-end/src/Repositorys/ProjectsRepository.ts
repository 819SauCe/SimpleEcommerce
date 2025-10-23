import pool from "../Config/connectDB";

export type Store = {
  id: string;
  owner_id: number;
  name: string;
  handle: string;
  primary_domain: string | null;
  created_at: string;
};

type ListOptions = {
  page?: number;
  pageSize?: number;
  q?: string;
  order?: "asc" | "desc";
  onlyOwner?: boolean;
};

type ListResult<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export async function createStoreRepo(
  ownerId: number,
  { name, handle, primary_domain }: { name: string; handle: string; primary_domain?: string | null }
): Promise<Store> {
  const { rows } = await pool.query(
    `INSERT INTO stores (owner_id, name, handle, primary_domain)
     VALUES ($1,$2,$3,$4)
     RETURNING id, owner_id, name, handle, primary_domain, created_at`,
    [ownerId, name, handle, primary_domain ?? null]
  );
  return rows[0];
}

export async function getStoreByIdRepo(id: number): Promise<Store | null> {
  const { rows } = await pool.query(
    `SELECT id, owner_id, name, handle, primary_domain, created_at
     FROM stores WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

export async function getStoreByHandleRepo(handle: string): Promise<Store | null> {
  const { rows } = await pool.query(
    `SELECT id, owner_id, name, handle, primary_domain, created_at
     FROM stores WHERE handle = $1`,
    [handle]
  );
  return rows[0] || null;
}

export async function getStoreByPrimaryDomainRepo(domain: string): Promise<Store | null> {
  const { rows } = await pool.query(
    `SELECT id, owner_id, name, handle, primary_domain, created_at
     FROM stores WHERE primary_domain = $1`,
    [domain]
  );
  return rows[0] || null;
}

export async function findStoreByHost(host: string): Promise<Store | null> {
  if (!host) return null;
  let clean = host.trim().toLowerCase();
  const c = clean.indexOf(':');
  if (c !== -1) clean = clean.slice(0, c);
  if (clean.startsWith('www.')) clean = clean.slice(4);
  const byDomain = await getStoreByPrimaryDomainRepo(clean);
  if (byDomain) return byDomain;
  const first = clean.split('.')[0];
  if (!first) return null;
  return getStoreByHandleRepo(first);
}

export async function listStoresForUserRepo(
  userId: number,
  opts: ListOptions = {}
): Promise<ListResult<Store>> {
  const page = Math.max(1, Number(opts.page ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(opts.pageSize ?? 20)));
  const order: "asc" | "desc" = opts.order === "asc" ? "asc" : "desc";
  const q = opts.q?.trim();
  const onlyOwner = Boolean(opts.onlyOwner);
  const offset = (page - 1) * pageSize;
  const whereParts: string[] = [];
  const params: unknown[] = [];

  if (onlyOwner) {
    whereParts.push(`p.owner_id = $${params.length + 1}`);
    params.push(userId);
  } else {
    whereParts.push(`(p.owner_id = $${params.length + 1} OR EXISTS (SELECT 1 FROM users_roles ur WHERE ur.store_id = p.id AND ur.user_id = $${params.length + 1}))`);
    params.push(userId);
  }

  if (q) {
    whereParts.push(`(p.name ILIKE $${params.length + 1} OR p.handle ILIKE $${params.length + 1})`);
    params.push(`%${q}%`);
  }

  const whereSQL = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";
  const totalSQL = `SELECT COUNT(*)::int AS total FROM stores p ${whereSQL}`;
  const totalRes = await pool.query(totalSQL, params);
  const total: number = totalRes.rows[0]?.total ?? 0;

  const rowsSQL = `
    SELECT p.id, p.owner_id, p.name, p.handle, p.primary_domain, p.created_at
    FROM stores p
    ${whereSQL}
    ORDER BY p.created_at ${order}
    LIMIT $${params.length + 1}
    OFFSET $${params.length + 2}
  `;
  const rowsRes = await pool.query(rowsSQL, [...params, pageSize, offset]);

  return {
    data: rowsRes.rows,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function userHasAccessToStoreRepo(userId: number, storeId: number): Promise<boolean> {
  const { rows } = await pool.query(
    `SELECT 1
     FROM stores p
     WHERE p.id = $1
       AND (p.owner_id = $2
            OR EXISTS (SELECT 1 FROM users_roles ur WHERE ur.store_id = p.id AND ur.user_id = $2))
     LIMIT 1`,
    [storeId, userId]
  );
  return Boolean(rows[0]);
}

export async function listOwnedStoresRepo(
  ownerId: number,
  opts: Omit<ListOptions, "onlyOwner"> = {}
) {
  return listStoresForUserRepo(ownerId, { ...opts, onlyOwner: true });
}
