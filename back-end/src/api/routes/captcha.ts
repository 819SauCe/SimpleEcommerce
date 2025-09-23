import { Router } from "express";
import { getCaptcha } from "../controllers/captcha/getCaptcha";

const router = Router();
router.get("/", getCaptcha);
export default router;
