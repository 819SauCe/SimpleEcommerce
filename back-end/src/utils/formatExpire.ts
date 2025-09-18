export function formatExpireToken(ms: number) {
    const expMinutos = Math.floor(ms / 1000 / 60) % 60;
    const expSegundos = Math.floor(ms / 1000) % 60;
    return `${expMinutos}m ${expSegundos}s`;
}