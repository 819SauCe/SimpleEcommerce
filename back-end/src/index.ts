import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import type { RequestHandler } from 'express';
import { validCors } from './Config/setup';
import { setup } from './Config/setup';
import { UserLogin, Logout, UserMe, UserRegister, getUsers } from './Services/UsersService';
import { requireTenantId } from './middlewares/requireTenantId';
import { IssueOneTimeToken } from './Controllers/tokenController';
import { requireSession } from './middlewares/requireSession';
import { requireOneTimeBearer } from './middlewares/oneTimeBearer';
import { authLimiter, globalLimiter } from './Config/limiter';
import { createProject, getProjectById } from './Services/ProjectsService';
import { upsertPageByPath, listPages, getPageByPath } from './Services/PagesService';
import { resolveTenant } from './middlewares/tenant';
import { updateDataUser } from './Services/UsersService';

const app = express();
const corsOptions = { origin: setup.cors, credentials: true };

const useStoreParamAsTenant: RequestHandler = (req, _res, next) => {
  (req as any).tenantId = Number(req.params.storeId);
  next();
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(globalLimiter);
app.use(resolveTenant);
app.use(helmet());

app.post('/login', authLimiter, UserLogin);
app.post('/register', authLimiter, UserRegister);
app.get('/me', requireSession, UserMe);
app.post('/logout', authLimiter, requireSession, Logout);
app.post('/token', requireSession, IssueOneTimeToken);
app.patch('/me', requireSession, requireOneTimeBearer, updateDataUser);

app.get('/users', requireSession, requireOneTimeBearer, requireTenantId, getUsers);

app.post('/projects', requireSession, requireOneTimeBearer, createProject);
app.get('/projects/:projectId', requireSession, requireOneTimeBearer, getProjectById);

app.post('/projects/:projectsId/pages', requireSession, requireOneTimeBearer, useStoreParamAsTenant, upsertPageByPath);
app.get('/projects/:projectsId/pages', requireSession, requireOneTimeBearer, useStoreParamAsTenant, listPages);
app.get('/projects/:projectsId/page', requireSession, requireOneTimeBearer, useStoreParamAsTenant, getPageByPath);

validCors();
app.listen(setup.port, () => {
  console.log(`Server running at http://${setup.host}:${setup.port}/ in ${setup.node_env} mode`);
});
