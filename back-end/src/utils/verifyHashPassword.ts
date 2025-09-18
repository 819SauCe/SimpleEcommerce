import bycrypt from "bcryptjs";

export async function verifyHashPassword(password: string, hash: string): Promise<boolean> {
    return await bycrypt.compare(password, hash);
}