import pool from "../Config/connectDB";
import bcrypt from 'bcrypt';

export async function searchUserByEmail(email: string){
  try {
    const query = 'SELECT * FROM users WHERE email = $1';
    const values = [email];
    const result = await pool.query(query, values);
    return result.rows[0];

  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function searchUserById(id: string){
  try {
    const query = 'SELECT id, first_name, last_name, user_image FROM users WHERE id = $1';
    const values = [id];
    const result = await pool.query(query, values);
    return result.rows[0];

  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function createUser({ email, firstName, lastName, password }: { email: string, firstName: string, lastName: string, password: string }){
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (email, first_name, last_name, password) VALUES ($1, $2, $3, $4) RETURNING *';
    const values = [email, firstName, lastName, hashedPassword];
    const result = await pool.query(query, values);
    return result.rows[0];

  } catch (error) {
    console.error(error);
    throw error;
  }
}
