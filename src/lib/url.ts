import { apiOrigin } from "./api/client";

/**
 * Returns the URL only if it is an http(s) link, so a tampered API response
 * can't turn a link into data:, file: or other schemes. React already blocks
 * javascript: URLs, but not those.
 */
export function safeExternalUrl(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.href : undefined;
  } catch {
    return undefined;
  }
}

/** Download links must point back at the API itself, never at another host. */
export function safeApiUrl(url: string): string | undefined {
  const safe = safeExternalUrl(url);
  return safe && new URL(safe).origin === new URL(apiOrigin).origin ? safe : undefined;
}
