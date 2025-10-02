import { randomUUID } from 'crypto';

type Record = { userId: string; exp: number; used: boolean };

const store = new Map<string, Record>();

export function createOneTimeToken(userId: string, ttlSeconds = 300) {
  const id = randomUUID();
  const exp = Date.now() + ttlSeconds * 1000;
  store.set(id, { userId, exp, used: false });
  return id;
}

export function consumeOneTimeToken(id: string) {
  const rec = store.get(id);
  if (!rec) return { ok: false as const, reason: 'not_found' as const };
  if (rec.used) return { ok: false as const, reason: 'used' as const };
  if (Date.now() > rec.exp) {
    store.delete(id);
    return { ok: false as const, reason: 'expired' as const };
  }
  rec.used = true;
  store.set(id, rec);
  return { ok: true as const, userId: rec.userId };
}

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of store) if (v.exp < now || v.used) store.delete(k);
}, 60_000);
