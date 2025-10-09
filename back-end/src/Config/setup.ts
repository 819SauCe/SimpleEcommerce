import dotenv from 'dotenv';

dotenv.config({ path: '../.env', quiet: true });

let i: number;
const node_env = process.env.NODE_ENV || 'development';
const host = process.env.HOST || 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 8080;
const cors = process.env.CORS ? process.env.CORS.split(',') : ['http://localhost:3000'];

export function validCors() {
  console.log('Valid CORS URLs:');
  cors.forEach(url => console.log(url));
}

export const setup = {
  node_env,
  host,
  port,
  cors
};