import { Router } from "express";
import { login } from "../services/loginService";
import { register } from "../services/registerService";
import { logout } from "../services/logoutService";
import { resetPassword } from "../services/resetPassword";
import { requireAuth } from "../../auth/requireAuth";
import { requireCaptcha } from "../middlewares/requireCaptcha";
import { refresh } from "../services/refreshService";

const router = Router();

router.post("/login", requireCaptcha, login);
router.post("/register", requireCaptcha, register);
router.get("/logout", requireAuth, logout);
router.get("/refresh", requireAuth, refresh);
router.post("/reset-password", resetPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
