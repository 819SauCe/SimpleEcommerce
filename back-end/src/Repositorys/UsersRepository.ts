import pool from "../Config/connectDB";
import bcrypt from 'bcrypt';

export async function searchUserByEmail(email: string){
  const query = 'SELECT * FROM users WHERE email = $1';
  const values = [email];
  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function searchUserById(id: number){
  const query = 'SELECT id, first_name, last_name, user_image FROM users WHERE id = $1';
  const values = [id];
  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function createUser({ email, firstName, lastName, password }: { email: string, firstName: string, lastName: string, password: string }){
  const hashedPassword = await bcrypt.hash(password, 10);
  const query = 'INSERT INTO users (email, first_name, last_name, password) VALUES ($1, $2, $3, $4) RETURNING *';
  const values = [email, firstName, lastName, hashedPassword];
  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function createUserRole(userId: number, roleId: number, projectId: number){
  const query = 'INSERT INTO user_roles (user_id, role_id, project_id) VALUES ($1, $2, $3) RETURNING *';
  const values = [userId, roleId, projectId];
  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function searchRoleByName(name: string){
  const query = 'SELECT * FROM roles WHERE name = $1';
  const values = [name];
  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function searchUserRoleByUserId(userId: number, projectId: number){
  const query = 'SELECT * FROM user_roles WHERE user_id = $1 AND project_id = $2';
  const values = [userId, projectId];
  const result = await pool.query(query, values);
  return result.rows;
}

export async function getRoleByUserId(userId: number) {
  const query = 'SELECT * FROM user_roles WHERE user_id = $1';
  const values = [userId];
  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function userHasPermission(userId: number, projectId: number, permissionName: string) {
  const q = `
    select 1
    from user_roles ur
    join roles r on r.id = ur.role_id
    join role_permissions rp on rp.role_id = r.id
    join permissions p on p.id = rp.permission_id
    where ur.user_id = $1 and ur.project_id = $2 and p.name = $3
    limit 1
  `;
  const v = [userId, projectId, permissionName];
  const r = await pool.query(q, v);
  return (r.rowCount ?? 0) > 0;
}

export async function searchUsers(projectId: number) {
  const usersQuery = `
    select distinct u.id, u.first_name, u.last_name, u.email, u.cpf, u.user_image
    from users u
    join user_roles ur on ur.user_id = u.id
    where ur.project_id = $1
  `;
  const usersResult = await pool.query(usersQuery, [projectId]);

  const userRolesQuery = `
    select ur.role_id, ur.project_id, r.name as role_name, r.description as role_description
    from user_roles ur
    join roles r on r.id = ur.role_id
    where ur.user_id = $1 and ur.project_id = $2
  `;

  const usersWithRoles = await Promise.all(
    usersResult.rows.map(async (user) => {
      const rolesRes = await pool.query(userRolesQuery, [user.id, projectId]);
      const roles = rolesRes.rows.map(ur => ({
        role_id: ur.role_id,
        project_id: ur.project_id,
        role_name: ur.role_name ?? null,
        role_description: ur.role_description ?? null,
      }));
      return { ...user, roles };
    })
  );

  return usersWithRoles;
}
