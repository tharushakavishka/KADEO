/** Success-page URLs are user input, not trusted order records. */
export function safeWhatsAppLink(value?: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== "wa.me" || url.port || url.username || url.password || !/^\/\d{8,15}$/.test(url.pathname)) return null;
    return url.href;
  } catch { return null; }
}
