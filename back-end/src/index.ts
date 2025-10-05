import express from 'express';
import cookieParser from 'cookie-parser';
import { UserLogin, Logout, UserMe, UserRegister, getUsers } from './Services/UsersService';
import { IssueOneTimeToken } from './Controllers/tokenController';
import { requireSession } from './middlewares/requireSession';
import { requireOneTimeBearer } from './middlewares/oneTimeBearer';
import { authLimiter, globalLimiter } from './Config/limiter';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(globalLimiter);

app.post('/login', authLimiter, UserLogin);
app.post('/register', authLimiter, UserRegister);
app.get('/me', requireSession, UserMe);
app.get('/logout', authLimiter, Logout);
app.get('/token', requireSession, IssueOneTimeToken);

app.get('/users', requireSession, requireOneTimeBearer, getUsers)

app.listen(3000);
