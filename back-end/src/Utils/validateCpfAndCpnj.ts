export function validateCPF(cpf: string) {
    if (!cpf) throw new Error('CPF is required');
    if (cpf.length !== 11) throw new Error('CPF must have 11 digits');
    if (!/^\d+$/.test(cpf)) throw new Error('CPF must contain only numbers');
    const digits = cpf.split('').map(Number);
    const sum = digits.slice(0, 9).reduce((acc, digit, index) => acc + digit * (10 - index), 0);
    const firstDigit = 11 - (sum % 11);
    if (firstDigit === 10 || firstDigit === 11) throw new Error('Invalid CPF');
    const sum2 = digits.slice(0, 10).reduce((acc, digit, index) => acc + digit * (11 - index), 0);
    const secondDigit = 11 - (sum2 % 11);
    if (secondDigit === 10 || secondDigit === 11) throw new Error('Invalid CPF');
    return String(cpf);
}

export function validateCNPJ(cnpj: string) {
    if (!cnpj) throw new Error('CNPJ is required');
    if (cnpj.length !== 14) throw new Error('CNPJ must have 14 digits');
    if (!/^\d+$/.test(cnpj)) throw new Error('CNPJ must contain only numbers');
    const digits = cnpj.split('').map(Number);
    const sum = digits.slice(0, 12).reduce((acc, digit, index) => acc + digit * (5 - index), 0);
    const firstDigit = 11 - (sum % 11);
    if (firstDigit === 10 || firstDigit === 11) throw new Error('Invalid CNPJ');
    const sum2 = digits.slice(0, 13).reduce((acc, digit, index) => acc + digit * (6 - index), 0);
    const secondDigit = 11 - (sum2 % 11);
    if (secondDigit === 10 || secondDigit === 11) throw new Error('Invalid CNPJ');
    return String(cnpj);
}
