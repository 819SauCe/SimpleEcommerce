import express from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import authRouter from "./api/routes/auth";
import captchaRouter from "./api/routes/captcha";
import { http, host, port, cors_origin } from './config';

const app = express();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: 'Too many requests' });

app.use(cors({origin: cors_origin, credentials: true}));

app.use(express.json());
app.use(limiter);
app.use(helmet());
app.disable('x-powered-by');
app.use(morgan('combined'));
app.use(cookieParser());
app.use("/captcha", captchaRouter);
app.use("/auth", authRouter);

app.listen(port, () => {
  console.log(`${http}://${host}:${port}`);
});
