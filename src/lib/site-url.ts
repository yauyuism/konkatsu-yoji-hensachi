const LOCAL_FALLBACK = "http://localhost:3000";

function normalizeUrl(value: string | undefined | null) {
  if (!value) {
    return null;
  }

  const input = value.trim();
  if (!input) {
    return null;
  }

  const withProtocol = input.startsWith("http://") || input.startsWith("https://") ? input : `https://${input}`;

  try {
    const parsed = new URL(withProtocol);
    return parsed.origin;
  } catch {
    return null;
  }
}

export function getSiteUrl() {
  return (
    normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
    normalizeUrl(process.env.NEXT_PUBLIC_URL) ??
    normalizeUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    normalizeUrl(process.env.VERCEL_URL) ??
    LOCAL_FALLBACK
  );
}
