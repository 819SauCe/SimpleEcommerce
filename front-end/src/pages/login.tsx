import { useState } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
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

    fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then((res) => res.json())
      .then((data) => console.log("Login response:", data))
      .catch((err) => console.error("Login error:", err));
  }

  return (
    <>
      <h1>login</h1>
      <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" className={inputStyles.default_input} />
      <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" className={inputStyles.default_input} />
      <Button label="Click me" onClick={handleLogin} className={buttonStyles.default_button} />
    </>
  );
}