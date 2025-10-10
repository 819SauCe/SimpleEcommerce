import { useState } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import styles from '../styles/pages/Login.module.scss';
import buttonStyles from '../styles/components/Button.module.scss';
import inputStyles from '../styles/components/Input.module.scss';

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"success" | "error" | null>(null);

  async function handleLogin() {
    if (!email || !password) {
      setMessage("Please enter both email and password.");
      setStatus("error");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || "Login successful!");
        setStatus("success");
        window.location.href = "/";
      } else {
        setMessage(data.message || `email or password incorrect.`);
        setStatus("error");
      }

    } catch (err: any) {
      setMessage("Network error. Please try again later.");
      setStatus("error");
    }
  }

  return (
    <main className={styles.main}>
      <div className={styles.login_container}>
        <h1 className={styles.title_login_container}>Welcome back</h1>

        <div className={styles.input_container}>
          <label htmlFor="email">Email:</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@example.com" type="email" className={inputStyles.default_input}/>

          <label htmlFor="password">Password:</label>
          <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" type="password" className={inputStyles.default_input}/>
        </div>

        <Button label="Login" onClick={handleLogin} className={buttonStyles.default_button}/>

        <p className={styles.forgot_password}>
          Forgot Password? <a href="/forgot-password">Click here</a>
        </p>
        <p className={styles.register_link}>
          Don't have an account? <a href="/register">Register</a>
        </p>

        {message && (
          <div className={`${styles.popup} ${status === "success" ? styles.popup_success : styles.popup_error}`}>
            {message}
          </div>
        )}
      </div>
    </main>
  );
}
