export function validateEmail(email: string) {
    if (!email) throw new Error('Email is required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Invalid email');
    if (!email.endsWith('.com')) throw new Error('Invalid email');
    if (!email.includes('@')) throw new Error('Invalid email');
    if (!email.includes('.')) throw new Error('Invalid email');
    if (!email.includes('')) throw new Error('Invalid email');
    if (email.length > 254) throw new Error('Email is too long');
    if (email.includes(' ')) throw new Error('Email cannot contain spaces');
    if (email.length < 5) throw new Error('Email is too short');
    return String(email);
}
