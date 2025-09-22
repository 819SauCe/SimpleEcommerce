import { db } from "../../config";

export async function getUserByEmail(email: string) {
    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0] || null;
    } catch (error: any) {
        console.error("Error on get user by email:", error.message);
        throw new Error("Database query failed");
    }
}
