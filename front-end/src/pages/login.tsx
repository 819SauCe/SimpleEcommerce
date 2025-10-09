import { useState } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import styles from '../styles/pages/Login.module.scss';
import buttonStyles from '../styles/components/Button.module.scss';
import inputStyles from '../styles/components/Input.module.scss';

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin() {
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    fetch(`http://localhost:8080/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then((res) => res.json())
      .then((data) => console.log("Login response:", data))
      .catch((err) => console.error("Login error:", err));
  }

  return (
    <main className={styles.main}>
      <div className={styles.login_container}>
        <div>
          <h1 className={styles.title_login_container}>Wellcome back</h1>
        </div>
        <div className={styles.input_container}>
          <label htmlFor="email">Email:</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@example.com" type="email" className={inputStyles.default_input}/>
          <label htmlFor="password">Password:</label>
          <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" type="password" className={inputStyles.default_input}/>
        </div>
        <Button label="Click me" onClick={handleLogin} className={buttonStyles.default_button}/>
        <p className={styles.forgot_password}>Forgot Password? <a href="/forgot-password">Click here</a></p>
        <p className={styles.register_link}>Don't have an account? <a href="/register">Register</a></p>
      </div>
    </main>
  );
}
