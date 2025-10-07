import express from 'express';
import cookieParser from 'cookie-parser';
import { UserLogin, Logout, UserMe, UserRegister, getUsers } from './Services/UsersService';
import { IssueOneTimeToken } from './Controllers/tokenController';
import { requireSession } from './middlewares/requireSession';
import { requireOneTimeBearer } from './middlewares/oneTimeBearer';
import { authLimiter, globalLimiter } from './Config/limiter';
import { createStore, getStoreById } from './Services/StoresService';
import { upsertPageByPath, listPages, getPageByPath } from './Services/PagesService';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(globalLimiter);

app.post('/login', authLimiter, UserLogin);
app.post('/register', authLimiter, UserRegister);
app.get('/me', requireSession, UserMe);
app.get('/logout', authLimiter, Logout);
app.get('/token', requireSession, IssueOneTimeToken);
app.get('/users', requireSession, requireOneTimeBearer, getUsers);

app.post('/stores', requireSession, requireOneTimeBearer, createStore);
app.get('/stores/:storeId', requireSession, requireOneTimeBearer, getStoreById);
app.post('/stores/:storeId/pages', requireSession, requireOneTimeBearer, upsertPageByPath);
app.get('/stores/:storeId/pages', requireSession, requireOneTimeBearer, listPages);
app.get('/stores/:storeId/page', requireSession, requireOneTimeBearer, getPageByPath);

app.listen(3000);
