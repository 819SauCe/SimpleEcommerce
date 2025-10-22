import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env', quiet: true });

const pool = new Pool({ connectionString: process.env.POSTGRESQL_CONNECTION_LINE });

(async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('Database connected successfully');
  } catch (error: any) {
    console.log(`Database connection error: ${error.message}`);
    console.log(process.env.POSTGRESQL_CONNECTION_LINE);
  }
})();


export default pool;
