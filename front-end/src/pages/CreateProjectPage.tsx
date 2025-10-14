import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../config/UserContext';
import styles from '../styles/pages/CreateProjectPage.module.scss';

const CREATE_PROJECT_ENDPOINT = '/projects';

function slugify(v: string) {
  return v
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 48);
}

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const user = useUser();
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [primaryDomain, setPrimaryDomain] = useState('');
  const [touchedHandle, setTouchedHandle] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (user === null) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    if (!touchedHandle) setHandle(slugify(name));
  }, [name, touchedHandle]);

  const canSubmit = useMemo(() => {
    if (!name.trim()) return false;
    if (!handle.trim()) return false;
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(handle)) return false;
    return true;
  }, [name, handle]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    setOk(false);
    try {
      const r = await fetch(CREATE_PROJECT_ENDPOINT, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          handle: handle.trim(),
          primary_domain: primaryDomain.trim() || null,
        }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j?.error || 'Erro ao criar');
      }
      setOk(true);
      const project = await r.json();
      setTimeout(() => navigate(`/projects/${project.id}`), 700);
    } catch (err: any) {
      setError(err?.message || 'Erro inesperado');
    } finally {
      setSubmitting(false);
    }
  }

  if (user === undefined || user === null) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Criar loja</h1>
        <p className={styles.subtitle}>Defina o nome, o identificador e, se quiser, o domínio principal.</p>
        <form className={styles.form} onSubmit={onSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Nome</label>
            <input
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Minha Loja Incrível"
              disabled={submitting}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Handle</label>
            <div className={styles.inputGroup}>
              <span className={styles.prefix}>/@</span>
              <input
                className={styles.input}
                value={handle}
                onChange={(e) => {
                  setTouchedHandle(true);
                  setHandle(e.target.value.toLowerCase());
                }}
                onBlur={() => setHandle(slugify(handle))}
                placeholder="minha-loja"
                disabled={submitting}
              />
            </div>
            <div className={styles.hint}>
              {handle ? (
                /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(handle) ? (
                  <span className={styles.ok}>Disponível para uso</span>
                ) : (
                  <span className={styles.err}>Use apenas letras, números e hífens, sem começar ou terminar com hífen</span>
                )
              ) : (
                <span>Será usado na URL e integrações</span>
              )}
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Domínio principal (opcional)</label>
            <input
              className={styles.input}
              value={primaryDomain}
              onChange={(e) => setPrimaryDomain(e.target.value)}
              placeholder="loja.exemplo.com"
              disabled={submitting}
            />
          </div>
          {error && <div className={styles.alertError}>{error}</div>}
          {ok && <div className={styles.alertSuccess}>Loja criada</div>}
          <button className={styles.submit} type="submit" disabled={!canSubmit || submitting}>
            {submitting ? 'Criando...' : 'Criar loja'}
          </button>
        </form>
      </div>
    </div>
  );
}
