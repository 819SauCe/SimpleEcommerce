import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import { useUser } from '../config/UserContext';
import styles from '../styles/pages/Profile.module.scss';
import buttonStyles from '../styles/components/Button.module.scss';
import inputStyles from '../styles/components/Input.module.scss';

export function Profile() {
  const { slug } = useParams<{ slug: string }>();
  const user = useUser();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [cpf, setCpf] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [phone, setPhone] = useState('');
  const [userImage, setUserImage] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'success' | 'error' | null>(null);
  const [loading, setLoading] = useState(false);
  const [avatarFallbackApplied, setAvatarFallbackApplied] = useState(false);

  const isOwner = useMemo(() => !!user && String(slug ?? '') === String(user.id ?? ''), [slug, user]);
  const displayName = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : `@${slug}`;

  useEffect(() => {
    if (!user || !isOwner) return;
    setFirstName(user.firstName || '');
    setLastName(user.lastName || '');
    setUserImage(user.image || '');
  }, [user, isOwner]);

  async function handleSave(e?: React.FormEvent) {
    e?.preventDefault();
    try {
      setLoading(true);
      setMessage('');
      setStatus(null);

      const tokenRes = await fetch('http://localhost:8080/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const tokenText = await tokenRes.text();
      if (!tokenRes.ok) {
        setMessage(tokenText || 'Falha ao gerar token.');
        setStatus('error');
        return;
      }

      let token: string | undefined;
      try {
        const parsed = JSON.parse(tokenText);
        token = parsed.token || parsed.oneTimeToken;
      } catch {
        token = tokenText.trim();
      }
      if (!token) {
        setMessage('Token de uso único não recebido.');
        setStatus('error');
        return;
      }

      const body: Record<string, unknown> = { firstName, lastName, cpf, cnpj: cnpj === '' ? null : cnpj, phone, userImage };

      const res = await fetch('http://localhost:8080/me', {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const raw = await res.text();
      let data: any;
      try { data = JSON.parse(raw); } catch { data = { raw }; }

      if (res.ok) {
        setMessage(data.message || 'Perfil atualizado com sucesso!');
        setStatus('success');
      } else {
        setMessage(data.error || data.message || `Erro ${res.status}.`);
        setStatus('error');
      }
    } catch {
      setMessage('Erro de rede. Tente novamente.');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.main}>
      <div className={styles.profile_container}>
        <h1 className={styles.title_profile_container}>{isOwner ? 'Meu perfil' : displayName}</h1>

        <div className={`${styles.avatar_preview_wrap} ${styles.field_full}`} style={{ marginBottom: isOwner ? 0 : 16 }}>
          <div className={styles.avatar_preview}>
            <img
              src={userImage || '/placeholder-avatar.svg'}
              alt="Avatar"
              onError={(e) => {
                if (!avatarFallbackApplied) {
                  (e.currentTarget as HTMLImageElement).src = '/placeholder-avatar.svg';
                  setAvatarFallbackApplied(true);
                }
              }}
            />
          </div>
          {!isOwner && <span className={styles.avatar_hint}>Perfil público</span>}
        </div>

        {isOwner ? (
          <>
            <form onSubmit={handleSave} noValidate>
              <div className={styles.grid}>
                <div className={styles.field}>
                  <label htmlFor="firstName">Nome:</label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Seu nome" className={inputStyles.default_input} disabled={loading} required/>
                </div>

                <div className={styles.field}>
                  <label htmlFor="lastName">Sobrenome:</label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Seu sobrenome" className={inputStyles.default_input} disabled={loading} required/>
                </div>

                <div className={styles.field}>
                  <label htmlFor="cpf">CPF:</label>
                  <Input id="cpf" value={cpf} onChange={(e) => setCpf(e.target.value.replace(/\D/g, ''))} placeholder="Somente números" inputMode="numeric" maxLength={11} className={inputStyles.default_input} disabled={loading}/>
                </div>

                <div className={styles.field}>
                  <label htmlFor="cnpj">CNPJ (opcional):</label>
                  <Input id="cnpj" value={cnpj} onChange={(e) => setCnpj(e.target.value.replace(/\D/g, ''))} placeholder="Deixe vazio para limpar" inputMode="numeric" maxLength={14} className={inputStyles.default_input} disabled={loading}/>
                </div>

                <div className={styles.field}>
                  <label htmlFor="phone">Telefone:</label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="DDD + número" inputMode="tel" maxLength={15} className={inputStyles.default_input} disabled={loading}/>
                </div>

                <div className={`${styles.field} ${styles.field_full}`}>
                  <label htmlFor="userImage">URL do Avatar:</label>
                  <Input id="userImage" value={userImage} onChange={(e) => setUserImage(e.target.value)} placeholder="https://..." type="url" className={inputStyles.default_input} disabled={loading}/>
                </div>
              </div>

              <Button type="submit" label={loading ? 'Salvando…' : 'Salvar alterações'} onClick={() => {}} disabled={loading} className={`${buttonStyles.default_button} ${buttonStyles['default_button--primary']} ${styles.cta_button}`}/>
            </form>

            {message && (
              <div className={`${styles.popup} ${status === 'success' ? styles.popup_success : styles.popup_error}`} role={status === 'error' ? 'alert' : 'status'} aria-live={status === 'error' ? 'assertive' : 'polite'}>
                {message}
              </div>
            )}
          </>
        ) : (
          <div className={styles.readonly_block}>
            <div className={styles.readonly_row}>
              <span className={styles.readonly_label}>Nome</span>
              <span className={styles.readonly_value}>{displayName}</span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default Profile;
