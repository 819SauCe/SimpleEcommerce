import Button from '../components/Button';
import styles from '../styles/pages/Home.module.scss';

export function Home() {
  return (
    <>
      <main className={styles.main}>
        <h1>home</h1>
        <Button label="Click me" onClick={() => alert('Button clicked!')} className='default_button' />
      </main>
    </>
  );
}
