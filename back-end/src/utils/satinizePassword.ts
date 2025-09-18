export function satinizePassword(password: string) {
    if (password === null || password === undefined || password === "") throw new Error("Password is empty");
    const passwordString = String(password);
    if (passwordString.length > 100) throw new Error("Password is too long");
    if (passwordString.length < 4) throw new Error("Password is too short");

    return String(passwordString);
}