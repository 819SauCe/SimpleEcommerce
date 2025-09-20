import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: '../.env', quiet: true });

const host = process.env.APPLICATION_HOST || "";
const port = Number(process.env.APPLICATION_PORT) || 3000;
const development = process.env.DEVELOPMENT || "";
const cors_origin = process.env.CORS_ORIGIN || "";
const jwt_access_secret = process.env.JWT_ACCESS_SECRET || "";
const jwt_refresh_secret = process.env.JWT_REFRESH_SECRET || "";
const jwt_access_expires: string | number = process.env.JWT_ACCESS_EXPIRES || "";
const jwt_refresh_expires: string | number = process.env.JWT_REFRESH_EXPIRES || "";
const database_url = process.env.DATABASE_URL || "";
const resendApiKey = process.env.RESEND_API_KEY || "";

let http = "http";

if (!cors_origin) throw new Error('Missing environment variables');
if (!host || !port) throw new Error('Missing environment variables');
if (!jwt_access_secret || !jwt_refresh_secret) throw new Error('Missing environment variables');
if (!jwt_access_expires || !jwt_refresh_expires) throw new Error('Missing environment variables');
if (!database_url) throw new Error('Missing environment variables');
if (development !== "dev") http = "https";
if (!resendApiKey) throw new Error('Missing environment variables');

const db = new pg.Pool({ connectionString: database_url });

export {
  http,host,
  port,
  cors_origin,
  jwt_access_secret,
  jwt_refresh_secret,
  jwt_access_expires,
  jwt_refresh_expires,
  db,
  development,
  resendApiKey
};