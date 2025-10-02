import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const pool = new Pool({ connectionString: process.env.POSTGRESQL_CONNECTION_LINE });

(async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('Database connected');
  } catch (error: any) {
    console.log(`Database connection error: ${error.message}`);
  }
})();


export default pool;
