import { writable } from "svelte/store";

const base = "http://localhost:3000";

export const captchaSvg = writable<string>("");
export const captchaToken = writable<string>("");
export const captchaAnswer = writable<string>("");

export async function loadCaptcha() {
  try {
    const res = await fetch(`${base}/captcha`, {
      method: "GET",
      credentials: "include",
    });
    const data = await res.json();
    captchaSvg.set(data.svg || "");
    captchaToken.set(data.token || "");
    captchaAnswer.set("");
  } catch {
    captchaSvg.set(`<svg xmlns='http://www.w3.org/2000/svg' width='180' height='60'>
      <rect width='100%' height='100%' fill='#f3f3f3'/>
      <text x='10' y='35'>Erro ao carregar</text>
    </svg>`);
    captchaToken.set("");
    captchaAnswer.set("");
  }
}

export async function sendLogin(
  email: string,
  password: string,
  captchaAnswerVal: string,
  captchaTokenVal: string
) {
  try {
    const res = await fetch(`${base}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        email,
        password,
        captchaAnswer: captchaAnswerVal,
        captchaToken: captchaTokenVal,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      return { error: true, status: res.status, data: errorData };
    }
    const data = await res.json();
    return { error: false, data };
  } catch (e: any) {
    return { error: true, message: e.message || "Falha de rede" };
  }
}
