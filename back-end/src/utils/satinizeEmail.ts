export function satinizeEmail(email: string) {
    const invalidCharacters = ["'", '"', "*", "{", "}", "(", ")", "$", " "];

    if (email === null || email === undefined || email === "") throw new Error("Email is empty");
    if (email.length > 100) throw new Error("Email is too long");
    if (email.length < 4) throw new Error("Email is too short");
    if (invalidCharacters.some((c) => email.includes(c))) throw new Error("Email contains invalid character");
    if (!email.includes("@")) throw new Error("Email is invalid");
    if (!email.includes(".")) throw new Error("Email is invalid");

    return String(email);
}