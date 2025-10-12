export function validateCPF(raw: string) {
  if (!raw) throw new Error('CPF is required');
  const cpf = String(raw).replace(/\D+/g, '');
  if (cpf.length !== 11) throw new Error('CPF must have 11 digits');
  if (/^(\d)\1{10}$/.test(cpf)) throw new Error('Invalid CPF');
  const digits = cpf.split('').map(Number);
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += digits[i] * (10 - i);
  let dv1 = sum % 11;
  dv1 = dv1 < 2 ? 0 : 11 - dv1;
  if (dv1 !== digits[9]) throw new Error('Invalid CPF');
  sum = 0;
  for (let i = 0; i < 10; i++) sum += digits[i] * (11 - i);
  let dv2 = sum % 11;
  dv2 = dv2 < 2 ? 0 : 11 - dv2;
  if (dv2 !== digits[10]) throw new Error('Invalid CPF');
  return cpf;
}

export function validateCNPJ(raw: string) {
  if (!raw) throw new Error('CNPJ is required');
  const cnpj = String(raw).replace(/\D+/g, '');
  if (cnpj.length !== 14) throw new Error('CNPJ must have 14 digits');
  if (/^(\d)\1{13}$/.test(cnpj)) throw new Error('Invalid CNPJ');
  const digits = cnpj.split('').map(Number);
  const weights1 = [5,4,3,2,9,8,7,6,5,4,3,2];
  const weights2 = [6,5,4,3,2,9,8,7,6,5,4,3,2];
  const sum1 = weights1.reduce((acc, w, i) => acc + digits[i] * w, 0);
  let dv1 = sum1 % 11;
  dv1 = dv1 < 2 ? 0 : 11 - dv1;
  if (dv1 !== digits[12]) throw new Error('Invalid CNPJ');
  const sum2 = weights2.reduce((acc, w, i) => acc + (i < 12 ? digits[i] : dv1) * w, 0);
  let dv2 = sum2 % 11;
  dv2 = dv2 < 2 ? 0 : 11 - dv2;
  if (dv2 !== digits[13]) throw new Error('Invalid CNPJ');
  return cnpj;
}
