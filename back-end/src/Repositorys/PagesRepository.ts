import pool from "../Config/connectDB";

export async function upsertPageRepo(storeId: number, p: {
  path: string; name?: string; type?: string;
  header?: any; footer?: any; content?: any; seo?: any;
  canonical_url?: string | null; status?: 'draft'|'published';
}) {
  const name = p.name ?? 'Page';
  const type = p.type ?? 'static';
  const status = p.status ?? 'draft';

  const { rows } = await pool.query(
    `INSERT INTO pages (
        store_id, name, type, path, canonical_url,
        header, footer, content, seo, status, published_at
     )
     VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10::varchar,
        CASE WHEN $10::varchar = 'published' THEN now() ELSE NULL END
     )
     ON CONFLICT (store_id, path)
     DO UPDATE SET
       name          = EXCLUDED.name,
       type          = EXCLUDED.type,
       canonical_url = EXCLUDED.canonical_url,
       header        = EXCLUDED.header,
       footer        = EXCLUDED.footer,
       content       = EXCLUDED.content,
       seo           = EXCLUDED.seo,
       status        = EXCLUDED.status,
       published_at  = CASE
                         WHEN EXCLUDED.status = 'published'
                           THEN COALESCE(pages.published_at, now())
                         ELSE pages.published_at
                       END,
       updated_at    = now()
     RETURNING *`,
    [
      storeId, name, type, p.path, p.canonical_url ?? null,
      p.header ?? {}, p.footer ?? {}, p.content ?? {}, p.seo ?? {},
      status
    ]
  );
  return rows[0];
}

export async function listPagesRepo(storeId: number, status?: string) {
  const params: any[] = [storeId];
  let where = 'store_id = $1';
  if (status) { params.push(status); where += ` AND status = $${params.length}`; }
  const { rows } = await pool.query(
    `SELECT id, name, type, path, status, updated_at, published_at
       FROM pages
      WHERE ${where}
      ORDER BY (CASE WHEN path='/' THEN 0 ELSE 1 END), path ASC`,
    params
  );
  return rows;
}

export async function getPageByPathRepo(storeId: number, path: string) {
  const { rows } = await pool.query(
    `SELECT * FROM pages WHERE store_id=$1 AND path=$2`,
    [storeId, path]
  );
  return rows[0] || null;
}
