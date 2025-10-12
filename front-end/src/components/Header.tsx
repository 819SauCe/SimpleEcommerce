import { useState, useMemo } from 'react';
import { NavLink, Link } from 'react-router-dom';
import styles from '../styles/components/Header.module.scss';
import buttonStyles from '../styles/components/Button.module.scss';
import { useUser } from '../config/UserContext';

export function Header() {
  const user = useUser();
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const initials = useMemo(() => {
    if (!user) return 'A';
    const f = user.firstName?.[0] ?? '';
    const l = user.lastName?.[0] ?? '';
    return (f + l || user.id?.[0] || 'U').toUpperCase();
  }, [user]);

  function getCookie(name: string) {
    return document.cookie.split('; ').find(row => row.startsWith(name + '='))?.split('=')[1];
  }

  async function handleLogout() {
    try {
      const csrf = getCookie('csrf');
      await fetch('http://localhost:8080/logout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'x-csrf': csrf ?? '' }
      });
    } catch { }
    localStorage.removeItem('userId');
    localStorage.removeItem('userFirstName');
    localStorage.removeItem('userLastName');
    localStorage.removeItem('userImage');
    window.location.href = '/login';
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand} aria-label="Go to homepage">
          <span className={styles.logo}>A</span>
          <span className={styles.name}>Arkon</span>
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : undefined}>Home</NavLink>
          <NavLink to="/store" className={({ isActive }) => isActive ? 'active' : undefined}>My Store</NavLink>
          <NavLink to="/products" className={({ isActive }) => isActive ? 'active' : undefined}>My Products</NavLink>
          <NavLink to="/api" className={({ isActive }) => isActive ? 'active' : undefined}>API</NavLink>
        </nav>

        <div className={styles.user}>
          {!user ? (
            <>
              <Link to="/login" className={`${buttonStyles.default_button} ${buttonStyles['default_button--secondary']}`}>Login</Link>
              <Link to="/register" className={`${buttonStyles.default_button} ${buttonStyles['default_button--primary']}`}>Register</Link>
            </>
          ) : (
            <div className={styles.user_menu} onMouseEnter={() => setUserMenuOpen(true)} onMouseLeave={() => setUserMenuOpen(false)} onFocus={() => setUserMenuOpen(true)} onBlur={() => setUserMenuOpen(false)}>
              {user.image ? (
                <button className={styles.avatar_btn} aria-haspopup="menu" aria-expanded={userMenuOpen}>
                  <img className={styles.avatar_img} src={user.image} alt={`${user.firstName} ${user.lastName}`} draggable={false} />
                </button>
              ) : (
                <button className={`${styles.avatar_btn} ${styles.avatar_fallback}`} aria-haspopup="menu" aria-expanded={userMenuOpen} onCopy={(e) => e.preventDefault()} draggable={false}>
                  <span aria-hidden="true">{initials}</span>
                </button>
              )}

              <div className={styles.user_menu_dropdown} role="menu" aria-label="User menu">
                <Link to={`/${user?.id}/user`} role="menuitem" className={styles.user_menu_item}>Perfil</Link>
                <Link to="/settings" role="menuitem" className={styles.user_menu_item}>Configurações</Link>
                <button role="menuitem" onClick={handleLogout} className={styles.user_menu_item_btn}>Logout</button>
              </div>
            </div>
          )}
        </div>

        <button className={styles.menu_btn} aria-expanded={open} aria-controls="drawer" onClick={() => setOpen(v => !v)}>
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Menu
        </button>
      </div>

      {open && (
        <div id="drawer" className={styles.drawer}>
          <NavLink to="/" end onClick={() => setOpen(false)}>Home</NavLink>
          <NavLink to="/store" onClick={() => setOpen(false)}>My Store</NavLink>
          <NavLink to="/products" onClick={() => setOpen(false)}>My Products</NavLink>
          <NavLink to="/api" onClick={() => setOpen(false)}>API</NavLink>
          {!user ? (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className={`${buttonStyles.default_button} ${buttonStyles['default_button--secondary']}`}>
                Login
              </Link>
              <Link to="/register" onClick={() => setOpen(false)} className={`${buttonStyles.default_button} ${buttonStyles['default_button--primary']}`}>
                Register
              </Link>
            </>
          ) : (
            <button onClick={handleLogout} className={`${buttonStyles.default_button} ${buttonStyles['default_button--secondary;']}`}>Logout</button>
          )}
        </div>
      )}
    </header>
  );
}
