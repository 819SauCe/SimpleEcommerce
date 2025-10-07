import Button  from '../components/Button';
import styles from '../styles/components/Button.module.scss';

export function Login() {
  return (
    <>
    <h1>login</h1>
    <Button label="Click me" onClick={() => alert('Button clicked!')} className={styles.default_button}/>
    </>
  );
}