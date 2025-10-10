import styles from '../styles/pages/Status.module.scss';

export function Status() {
  return (
    <main className={styles.wrap}>
      <header className={styles.head}>
        <h1>Platform status</h1>
        <p>All systems operational</p>
        <div className={styles.badges}>
          <span className={styles.badge}>API: 100%</span>
          <span className={styles.badge}>Dashboard: 100%</span>
          <span className={styles.badge}>CDN: 100%</span>
        </div>
      </header>

      <section className={styles.grid}>
        <article className={styles.card}>
          <h3>API</h3>
          <p>Operational</p>
          <div className={styles.timeline}>
            <div className={styles.item}><span className={styles.dot} /> No incidents reported</div>
          </div>
        </article>

        <article className={styles.card}>
          <h3>Dashboard</h3>
          <p>Operational</p>
          <div className={styles.timeline}>
            <div className={styles.item}><span className={styles.dot} /> No incidents reported</div>
          </div>
        </article>

        <article className={styles.card}>
          <h3>Checkout</h3>
          <p>Operational</p>
          <div className={styles.timeline}>
            <div className={styles.item}><span className={styles.dot} /> No incidents reported</div>
          </div>
        </article>
      </section>
    </main>
  );
}
