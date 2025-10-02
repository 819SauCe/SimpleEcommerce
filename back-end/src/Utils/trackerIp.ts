export function trackerIp(ip: string) {
    if (ip === "127.0.0.1") return String(ip);
    if (ip.startsWith("::ffff:")) ip.replace("::ffff:", "");
}
