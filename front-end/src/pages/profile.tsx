import { useEffect, useMemo, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import { useUser } from '../config/UserContext';
import styles from '../styles/pages/Profile.module.scss';
import buttonStyles from '../styles/components/Button.module.scss';
import inputStyles from '../styles/components/Input.module.scss';

type PublicUser = {
  id: string;
  firstName?: string;
  lastName?: string;
  image?: string;
};

type PersonType = 'INDIVIDUAL' | 'COMPANY';
type DocumentType = 'CPF' | 'CNPJ';

function getAutoAvatarUrl(seed: string, bg = '260900', text = 'ffffff') {
  const s = encodeURIComponent(seed || 'U');
  return `https://api.dicebear.com/7.x/initials/svg?seed=${s}&backgroundColor=${bg}&textColor=${text}`;
}

export function Profile() {
  const { slug } = useParams<{ slug: string }>();
  const user = useUser();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [personType, setPersonType] = useState<PersonType>('INDIVIDUAL');
  const [documentType, setDocumentType] = useState<DocumentType>('CPF');
  const [documentNumber, setDocumentNumber] = useState('');
  const [cpf, setCpf] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneCountry, setPhoneCountry] = useState('BR');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [stateRegion, setStateRegion] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('BR');
  const [userImage, setUserImage] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'success' | 'error' | null>(null);
  const [loading, setLoading] = useState(false);
  const [avatarFallbackApplied, setAvatarFallbackApplied] = useState(false);
  const [publicUser, setPublicUser] = useState<PublicUser | null | undefined>(undefined);
  const [loadingUser, setLoadingUser] = useState(true);

  const isOwner = useMemo(() => !!user && String(slug ?? '') === String(user.id ?? ''), [slug, user]);
  const displayName = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : (businessName || `@${slug}`);

  const initials = useMemo(() => {
    const f = firstName?.[0] ?? '';
    const l = lastName?.[0] ?? '';
    const base = (f + l) || (slug?.[0] ?? '') || 'U';
    return base.toUpperCase();
  }, [firstName, lastName, slug]);

  const avatarUrl = useMemo(() => {
    if (userImage) return userImage;
    return getAutoAvatarUrl(initials);
  }, [userImage, initials]);

  useEffect(() => {
    if (!user || !isOwner) return;
    setFirstName(user.firstName || '');
    setLastName(user.lastName || '');
    setUserImage(user.image || '');
    setEmail((user as any)?.email || '');
    setPublicUser(undefined);
    setLoadingUser(false);
  }, [user, isOwner]);

  useEffect(() => {
    if (!slug || isOwner) return;
    let cancelled = false;
    (async () => {
      try {
        setLoadingUser(true);
        const res = await fetch(`http://localhost:8080/users/${encodeURIComponent(slug)}`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        });
        if (cancelled) return;
        if (res.status === 404) {
          setPublicUser(null);
          setLoadingUser(false);
          return;
        }
        if (!res.ok) {
          setPublicUser(null);
          setLoadingUser(false);
          return;
        }
        const data = (await res.json()) as PublicUser;
        setPublicUser(data);
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setUserImage(data.image || '');
        setLoadingUser(false);
      } catch {
        if (!cancelled) {
          setPublicUser(null);
          setLoadingUser(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [slug, isOwner]);

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setUserImage(reader.result);
    };
    reader.readAsDataURL(file);
  }

  const requiredForPercent = useMemo(() => {
    const base = [
      email?.trim(),
      phone?.trim(),
      country?.trim(),
      addressLine1?.trim(),
      addressNumber?.trim(),
      city?.trim(),
      stateRegion?.trim(),
      postalCode?.trim(),
    ];
    const nameOk = personType === 'COMPANY' ? businessName?.trim() : (firstName?.trim() && lastName?.trim());
    const docOk = country === 'BR'
      ? (personType === 'COMPANY' ? (cnpj?.trim()?.length >= 14) : (cpf?.trim()?.length >= 11))
      : (documentNumber?.trim());
    return [...base, nameOk ? 'ok' : '', docOk ? 'ok' : ''];
  }, [email, phone, country, addressLine1, addressNumber, city, stateRegion, postalCode, personType, businessName, firstName, lastName, cpf, cnpj, documentNumber]);

  const completionPercent = useMemo(() => {
    const total = requiredForPercent.length;
    const filled = requiredForPercent.filter(Boolean).length;
    return Math.round((filled / total) * 100);
  }, [requiredForPercent]);

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
        setMessage(tokenText || 'Failed to generate token.');
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
        setMessage('One-time token was not received.');
        setStatus('error');
        return;
      }
      const identity: Record<string, unknown> = {
        firstName,
        lastName,
        businessName,
        email,
        phone,
        phoneCountry,
        personType,
        documentType,
        documentNumber,
        cpf,
        cnpj,
        image: userImage,
      };
      const address: Record<string, unknown> = {
        addressLine1,
        addressNumber,
        addressLine2,
        neighborhood,
        city,
        stateRegion,
        postalCode,
        country,
      };
      const payload: Record<string, unknown> = {
        identity,
        address,
        asaasCustomer: {
          name: personType === 'COMPANY' ? (businessName || `${firstName} ${lastName}`.trim()) : `${firstName} ${lastName}`.trim(),
          email,
          cpfCnpj: country === 'BR' ? (personType === 'COMPANY' ? cnpj || documentNumber : cpf || documentNumber) : documentNumber,
          phone,
          mobilePhone: phone,
          address: addressLine1,
          addressNumber,
          complement: addressLine2 || null,
          province: neighborhood || null,
          postalCode,
          city,
          state: stateRegion,
          country,
          personType: personType === 'COMPANY' ? 'JURIDICA' : 'FISICA',
        },
        profileCompletion: completionPercent,
      };
      const res = await fetch('http://localhost:8080/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const raw = await res.text();
      let data: any;
      try { data = JSON.parse(raw); } catch { data = { raw }; }
      if (res.ok) {
        setMessage(data.message || 'Profile updated successfully!');
        setStatus('success');
      } else {
        setMessage(data.error || data.message || `Error ${res.status}.`);
        setStatus('error');
      }
    } catch {
      setMessage('Network error. Please try again.');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  }

  if (!isOwner && publicUser === null && !loadingUser) return <Navigate to="/404" replace />;

  if (loadingUser) {
    return (
      <main className={styles.main}>
        <div className={styles.loading_container}>
          <div className={styles.spinner}></div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.profile_container}>
        <div className={styles.header_row}>
          <h1 className={styles.title_profile_container}>{isOwner ? 'My profile' : displayName}</h1>
          {isOwner && (
            <div className={styles.progress_wrap} aria-label="Profile progress">
              <div className={styles.progress_bar}>
                <div className={styles.progress_fill} style={{ width: `${completionPercent}%` }} />
              </div>
              <span className={styles.progress_label}>{completionPercent}% complete</span>
            </div>
          )}
        </div>

        <div className={`${styles.avatar_preview_wrap} ${styles.field_full}`} style={{ marginBottom: isOwner ? 12 : 16 }}>
          <div className={styles.avatar_preview}>
            <img
              src={avatarUrl}
              alt="Avatar"
              onError={(e) => {
                if (!avatarFallbackApplied) {
                  (e.currentTarget as HTMLImageElement).src = getAutoAvatarUrl(initials);
                  setAvatarFallbackApplied(true);
                }
              }}
            />
          </div>
          {isOwner ? (
            <div className={styles.avatar_upload}>
              <label htmlFor="avatarUpload" className={styles.upload_label}>Choose image</label>
              <input id="avatarUpload" type="file" accept="image/*" onChange={handleImageUpload} disabled={loading} className={styles.upload_input} />
              <span className={styles.avatar_hint}>You can upload a direct image</span>
            </div>
          ) : (
            <span className={styles.avatar_hint}>Public profile</span>
          )}
        </div>

        {isOwner ? (
          <>
            <form onSubmit={handleSave} noValidate>
              <div className={styles.section_card}>
                <div className={styles.section_title}>Identity & Contact</div>
                <div className={styles.grid}>
                  <div className={styles.field}>
                    <label htmlFor="personType">Person type</label>
                    <select id="personType" className={inputStyles.default_input} value={personType} onChange={(e) => setPersonType(e.target.value as PersonType)} disabled={loading}>
                      <option value="INDIVIDUAL">Individual</option>
                      <option value="COMPANY">Company</option>
                    </select>
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="email">Email</label>
                    <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" className={inputStyles.default_input} disabled={loading} required />
                  </div>

                  {personType === 'COMPANY' ? (
                    <div className={styles.field_full}>
                      <label htmlFor="businessName">Company / Trade name</label>
                      <Input id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Your Company LLC" className={inputStyles.default_input} disabled={loading} />
                    </div>
                  ) : (
                    <>
                      <div className={styles.field}>
                        <label htmlFor="firstName">First name</label>
                        <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Your first name" className={inputStyles.default_input} disabled={loading} required />
                      </div>
                      <div className={styles.field}>
                        <label htmlFor="lastName">Last name</label>
                        <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Your last name" className={inputStyles.default_input} disabled={loading} required />
                      </div>
                    </>
                  )}

                  <div className={styles.field}>
                    <label htmlFor="phoneCountry">Phone country</label>
                    <select id="phoneCountry" className={inputStyles.default_input} value={phoneCountry} onChange={(e) => setPhoneCountry(e.target.value)} disabled={loading}>
                      <option value="BR">Brazil (+55)</option>
                      <option value="US">United States (+1)</option>
                      <option value="PT">Portugal (+351)</option>
                      <option value="AR">Argentina (+54)</option>
                      <option value="MX">Mexico (+52)</option>
                      <option value="ES">Spain (+34)</option>
                      <option value="FR">France (+33)</option>
                      <option value="DE">Germany (+49)</option>
                      <option value="GB">United Kingdom (+44)</option>
                      <option value="CA">Canada (+1)</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="phone">Phone</label>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="Digits only" inputMode="tel" className={inputStyles.default_input} disabled={loading} />
                  </div>
                </div>

                <div className={styles.section_subtitle}>Billing Documents</div>
                <div className={styles.grid}>
                  <div className={styles.field}>
                    <label htmlFor="documentType">Document type</label>
                    <select id="documentType" className={inputStyles.default_input} value={documentType} onChange={(e) => setDocumentType(e.target.value as DocumentType)} disabled={loading}>
                      <option value="CPF">CPF</option>
                      <option value="CNPJ">CNPJ</option>
                    </select>
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="documentNumber">Document number</label>
                    <Input id="documentNumber" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value.replace(/\s/g, ''))} placeholder="Document" className={inputStyles.default_input} disabled={loading} />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="cpf">CPF</label>
                    <Input id="cpf" value={cpf} onChange={(e) => setCpf(e.target.value.replace(/\D/g, ''))} placeholder="Digits only" inputMode="numeric" maxLength={11} className={inputStyles.default_input} disabled={loading || personType === 'COMPANY'} />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="cnpj">CNPJ</label>
                    <Input id="cnpj" value={cnpj} onChange={(e) => setCnpj(e.target.value.replace(/\D/g, ''))} placeholder="Digits only" inputMode="numeric" maxLength={14} className={inputStyles.default_input} disabled={loading || personType === 'INDIVIDUAL'} />
                  </div>
                </div>
              </div>

              <div className={`${styles.section_card} ${styles.section_card__address}`}>
                <div className={styles.section_title}>Address</div>
                <div className={styles.grid}>
                  <div className={styles.field_full}>
                    <label htmlFor="addressLine1">Address (line 1)</label>
                    <Input id="addressLine1" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} placeholder="Street, avenue, etc." className={inputStyles.default_input} disabled={loading} />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="addressNumber">Number</label>
                    <Input id="addressNumber" value={addressNumber} onChange={(e) => setAddressNumber(e.target.value)} placeholder="Number" className={inputStyles.default_input} disabled={loading} />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="addressLine2">Complement</label>
                    <Input id="addressLine2" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} placeholder="Apt, suite…" className={inputStyles.default_input} disabled={loading} />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="neighborhood">Neighborhood / Province</label>
                    <Input id="neighborhood" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Neighborhood/Province" className={inputStyles.default_input} disabled={loading} />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="city">City</label>
                    <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className={inputStyles.default_input} disabled={loading} />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="stateRegion">State/Region</label>
                    <Input id="stateRegion" value={stateRegion} onChange={(e) => setStateRegion(e.target.value)} placeholder="State/Region" className={inputStyles.default_input} disabled={loading} />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="postalCode">ZIP / Postal Code</label>
                    <Input id="postalCode" value={postalCode} onChange={(e) => setPostalCode(e.target.value.replace(/\s/g, ''))} placeholder="ZIP/Postal code" className={inputStyles.default_input} disabled={loading} />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="country">Country</label>
                    <select id="country" className={inputStyles.default_input} value={country} onChange={(e) => setCountry(e.target.value)} disabled={loading}>
                      <option value="BR">Brazil</option>
                      <option value="US">United States</option>
                      <option value="PT">Portugal</option>
                      <option value="AR">Argentina</option>
                      <option value="MX">Mexico</option>
                      <option value="ES">Spain</option>
                      <option value="FR">France</option>
                      <option value="DE">Germany</option>
                      <option value="GB">United Kingdom</option>
                      <option value="CA">Canada</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <Button type="submit" label={loading ? 'Saving…' : 'Save changes'} onClick={() => {}} disabled={loading} className={`${buttonStyles.default_button} ${buttonStyles['default_button--primary']} ${styles.cta_button}`} />
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
              <span className={styles.readonly_label}>Name</span>
              <span className={styles.readonly_value}>{displayName}</span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default Profile;
