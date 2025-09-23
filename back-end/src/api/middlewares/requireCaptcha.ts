import { Request, Response, NextFunction } from "express";
import { verifyCaptchaToken } from "../../utils/captcha";

export function requireCaptcha(req: Request, res: Response, next: NextFunction) {
  const { captchaAnswer, captchaToken } = req.body || {};
  const ok = verifyCaptchaToken(captchaToken, captchaAnswer);

  if (!ok) {
    return res.status(400).json({ error: true, message: "Captcha inválido ou expirado" });
  }
  next();
}