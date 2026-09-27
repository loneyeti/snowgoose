export function safeResearchUrl(
  value: string | undefined,
): { href: string; domain: string } | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return { href: url.href, domain: url.hostname };
  } catch {
    return null;
  }
}
