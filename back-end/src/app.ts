import express from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { http, host, port, cors_origin } from './config';
import { requireAuth } from './auth/requireAuth';
import { login } from './api/services/loginService';
import { register } from './api/services/registerService';
import { logout } from './api/services/logoutService';
import { resetPassword } from './api/services/resetPassword';

const app = express();
const limiter = rateLimit({ windowMs: 900000, max: 100, message: 'Too many requests' })
app.use(cors({ origin: cors_origin }));
app.use(express.json());
app.use(limiter);
app.use(helmet());
app.disable('x-powered-by');
app.use(morgan('combined'));
app.use(cookieParser());

app.post("/auth/login", login);
app.post("/auth/register", register);
app.get("/auth/logout", requireAuth, logout);
app.get("/auth/refresh", requireAuth, login);
app.post("/auth/reset-password", resetPassword);
app.post("/auth/reset-password/:token", resetPassword);

app.listen(port,  () => { console.log(`${http}://${host}:${port}`); })