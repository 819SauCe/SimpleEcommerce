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

export async function createUserRole(userId: string, roleId: string, projectId: string){
  try {
    const query = 'INSERT INTO user_roles (user_id, role_id, project_id) VALUES ($1, $2, $3) RETURNING *';
    const values = [userId, roleId, projectId];
    const result = await pool.query(query, values);
    return result.rows[0];

  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function searchRoleByName(name: string){
  try {
    const query = 'SELECT * FROM roles WHERE name = $1';
    const values = [name];
    const result = await pool.query(query, values);
    return result.rows[0];

  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function searchUserRoleByUserId(userId: string, projectId: string){
  try {
    const query = 'SELECT * FROM user_roles WHERE user_id = $1 AND project_id = $2';
    const values = [userId, projectId];
    const result = await pool.query(query, values);
    return result.rows;

  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getRoleByUserId(userId: string) {
  try {
    const query = 'SELECT * FROM user_roles WHERE user_id = $1';
    const values = [userId];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function searchUsers() {
  try {
    const usersQuery = `SELECT id, first_name, last_name, email, cpf, user_image FROM users`;
    const usersResult = await pool.query(usersQuery);
    const userRolesQuery = `SELECT * FROM user_roles WHERE user_id = $1`;
    const roleByIdQuery = `SELECT * FROM roles WHERE id = $1`;
    const usersWithRoles = await Promise.all(
      usersResult.rows.map(async (user) => {
        const rolesRes = await pool.query(userRolesQuery, [user.id]);
        const roles = await Promise.all(
          rolesRes.rows.map(async (ur) => {
            const roleRes = await pool.query(roleByIdQuery, [ur.role_id]);
            const role = roleRes.rows[0] || null;
            return {
              role_id: ur.role_id,
              project_id: ur.project_id,
              role_name: role?.name ?? null,
              role_description: role?.description ?? null,
            };
          })
        );

        return {
          ...user,
          roles,
        };
      })
    );

    return usersWithRoles;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
