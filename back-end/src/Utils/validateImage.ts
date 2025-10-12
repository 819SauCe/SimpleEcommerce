export function onlyDigits(s: string) {
  return String(s ?? '').replace(/\D+/g, '');
}

export function validateBRPhone(raw: string) {
  const d = onlyDigits(raw);
  let digits = d;
  if (digits.startsWith('55')) {
    if (digits.length < 12 || digits.length > 13) throw new Error('Telefone inválido');
    return `+${digits}`;
  }
  if (digits.length !== 10 && digits.length !== 11) throw new Error('Telefone inválido');
  return `+55${digits}`;
}

export function validateImageUrl(url: string) {
  if (typeof url !== 'string' || url.length === 0) throw new Error('URL de imagem inválida');
  try {
    const u = new URL(url);
    if (!/\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(u.pathname))
    return url;
  } catch {
    throw new Error('URL de imagem inválida');
  }
}