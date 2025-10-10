import crypto from 'crypto';

export function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex'); // 64 caracteres
}
