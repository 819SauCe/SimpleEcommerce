import styles from '../styles/pages/Pricing.module.scss';
import buttonStyles from '../styles/components/Button.module.scss';
import { Link } from 'react-router-dom';

export function Pricing() {
  return (
    <main className={styles.wrap}>
      <header className={styles.head}>
        <h1>Choose your plan</h1>
        <p>Start free. Upgrade when you need more power.</p>
      </header>

      <section className={styles.grid}>
        <article className={styles.card}>
          <span className={styles.badge}>Starter</span>
          <h3>Free</h3>
          <div className={styles.price}>$0/mo</div>
          <p className={styles.desc}>Launch your first store.</p>
          <ul>
            <li>1 store</li>
            <li>Up to 50 products</li>
            <li>Community support</li>
          </ul>
          <div className={styles.cta}>
            <Link to="/register" className={`${buttonStyles.default_button} ${buttonStyles['default_button--primary']}`}>Get started</Link>
          </div>
        </article>

        <article className={styles.card}>
          <span className={styles.badge}>Most popular</span>
          <h3>Pro</h3>
          <div className={styles.price}>$29/mo</div>
          <p className={styles.desc}>Everything to grow your business.</p>
          <ul>
            <li>Unlimited products</li>
            <li>Custom domain</li>
            <li>Email support</li>
          </ul>
          <div className={styles.cta}>
            <Link to="/register" className={`${buttonStyles.default_button} ${buttonStyles['default_button--primary']}`}>Start Pro</Link>
          </div>
        </article>

        <article className={styles.card}>
          <span className={styles.badge}>Scale</span>
          <h3>Business</h3>
          <div className={styles.price}>$99/mo</div>
          <p className={styles.desc}>Advanced features for teams.</p>
          <ul>
            <li>Multiple stores</li>
            <li>API access</li>
            <li>Priority support</li>
          </ul>
          <div className={styles.cta}>
            <Link to="/register" className={`${buttonStyles.default_button} ${buttonStyles['default_button--secondary']}`}>Contact sales</Link>
          </div>
        </article>
      </section>
    </main>
  );
}
