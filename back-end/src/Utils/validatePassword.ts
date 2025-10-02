export function validatePassword(password: string) {
  if (password.length < 8) throw new Error('Password is too short');
  if (password.length > 128) throw new Error('Password is too long');
  if (!/[A-Z]/.test(password)) throw new Error('Password must contain at least one uppercase letter');
  if (!/[a-z]/.test(password)) throw new Error('Password must contain at least one lowercase letter');
  if (!/\d/.test(password)) throw new Error('Password must contain at least one number');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) throw new Error('Password must contain at least one special character');
  return String(password);
}
