import { Request, Response } from "express";
import crypto from "crypto";
import "../../../config"

const SECRET = process.env.CAPTCHA_SECRET || "";

function makeChallenge() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const ops = [
    { s: "+", f: (x: number, y: number) => x + y },
    { s: "-", f: (x: number, y: number) => x - y },
  ];
  const op = ops[Math.floor(Math.random() * ops.length)];
  const expr = `${a} ${op.s} ${b}`;
  const answer = String(op.f(a, b));
  return { expr, answer };
}

function signCaptcha(answer: string) {
  const exp = Date.now() + 1000 * 60 * 3;
  const salt = crypto.randomBytes(8).toString("hex");
  const answerHash = crypto
    .createHmac("sha256", SECRET)
    .update(salt + "|" + answer.trim().toLowerCase())
    .digest("hex");

  const payload = Buffer.from(JSON.stringify({ exp, salt, answerHash })).toString("base64url");
  const signature = crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function getCaptcha(req: Request, res: Response) {
  const { expr, answer } = makeChallenge();
  const token = signCaptcha(answer);

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="60">
  <rect width="100%" height="100%" fill="#f3f3f3"/>
  <g font-family="monospace" font-size="28" font-weight="700" fill="#222">
    <text x="20" y="38">${expr} = ?</text>
  </g>
  <g stroke="#ccc">
    <line x1="5" y1="10" x2="175" y2="12"/>
    <line x1="10" y1="50" x2="160" y2="48"/>
    <line x1="20" y1="25" x2="170" y2="28"/>
  </g>
</svg>`.trim();

  res.json({ svg, token });
}
