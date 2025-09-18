export function satinizeName(name: string) {
    const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    const invalidCharacters = ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "_", "-", "+", "=", "[", "]", "{", "}", "|", "\\", ":", ";", "'", "\"", ",", ".", "/", "?", "~"];

    if (name === null || name === undefined || name === "") throw new Error("Name is empty");
    if (name.length > 100) throw new Error("Name is too long");
    if (name.length < 4) throw new Error("Name is too short");
    if (numbers.some((n) => name.includes(n))) throw new Error("Name contains number");
    if (invalidCharacters.some((c) => name.includes(c))) throw new Error("Name contains invalid character");
    name = name[0].toUpperCase() + name.slice(1);

    return String(name);
}