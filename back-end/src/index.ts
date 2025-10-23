import express, { RequestHandler } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { validCors, setup } from './Config/setup';
import { authLimiter, globalLimiter } from './Config/limiter';
import { requireSession } from './middlewares/requireSession';
import { requireOneTimeBearer } from './middlewares/oneTimeBearer';
import { requireTenantId } from './middlewares/requireTenantId';
import { resolveTenant } from './middlewares/tenant';
import { IssueOneTimeToken } from './Controllers/tokenController';
import { createProject, getProjectById, listMyProjects } from './Services/ProjectsService';
import { upsertPageByPath, listPages, getPageByPath } from './Services/PagesService';
import {
  UserLogin,
  Logout,
  UserMe,
  UserRegister,
  getUsers,
  updateDataUser,
} from './Services/UsersService';


const app = express();
const corsOptions = { origin: setup.cors, credentials: true };

const useStoreParamAsTenant: RequestHandler = (req, _res, next) => {
  const { storeId, projectsId, projectId } = req.params as any;
  (req as any).tenantId = Number(storeId ?? projectsId ?? projectId);
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
app.get('/projects', requireSession, requireOneTimeBearer, listMyProjects);
app.get('/projects/:projectId', requireSession, requireOneTimeBearer, getProjectById);

app.post('/projects/:projectsId/pages', requireSession, requireOneTimeBearer, useStoreParamAsTenant, upsertPageByPath);
app.get('/projects/:projectsId/pages', requireSession, requireOneTimeBearer, useStoreParamAsTenant, listPages);
app.get('/projects/:projectsId/page', requireSession, requireOneTimeBearer, useStoreParamAsTenant, getPageByPath);

validCors();
app.listen(setup.port, () => {
  console.log(`Server running at http://${setup.host}:${setup.port}/ in ${setup.node_env} mode`);
});
