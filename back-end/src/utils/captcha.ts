import crypto from "crypto";

const SECRET = process.env.CAPTCHA_SECRET || "troque-este-segredo";

export function verifyCaptchaToken(captchaToken: string, userAnswer: string): boolean {
  if (!captchaToken || !userAnswer) return false;

  const [payloadB64, sig] = captchaToken.split(".");
  if (!payloadB64 || !sig) return false;

  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(payloadB64)
    .digest("base64url");
  if (sig !== expected) return false;

  let payload: { exp: number; salt: string; answerHash: string };
  try {
    payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());
  } catch {
    return false;
  }

  if (!payload?.exp || Date.now() > payload.exp) return false;

  const normalized = String(userAnswer).trim().toLowerCase();
  const check = crypto
    .createHmac("sha256", SECRET)
    .update(payload.salt + "|" + normalized)
    .digest("hex");

  return check === payload.answerHash;
}
