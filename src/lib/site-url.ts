function stripProtocol(hostnameOrUrl: string): string {
  return hostnameOrUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function toAbsoluteSiteUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed.replace(/\/$/, "");
  }

  return `https://${stripProtocol(trimmed)}`;
}

/** Canonical storefront URL used for OAuth callbacks, metadata, and sitemap links. */
export function getSiteUrl(): string {
  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProduction) {
    return toAbsoluteSiteUrl(vercelProduction);
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return toAbsoluteSiteUrl(vercelUrl);
  }

  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return toAbsoluteSiteUrl(explicit);
  }

  return "http://localhost:3000";
}

export function getSiteOrigin(siteUrl: string): string {
  return new URL(siteUrl).origin;
}

function isLocalDevHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname.startsWith("127.0.0.1") ||
    hostname.endsWith(".localhost")
  );
}

function isDevTunnelHost(hostname: string): boolean {
  return (
    hostname.includes(".ngrok") ||
    hostname.includes(".ngrok-free.app") ||
    hostname.includes(".loca.lt") ||
    hostname.includes(".trycloudflare.com")
  );
}

function isVercelPreviewHost(hostname: string): boolean {
  return hostname.endsWith(".vercel.app");
}

/** True when the browser origin cannot complete the OAuth redirect flow. */
export function wouldAuthCallbackFail(currentOrigin: string, canonicalSiteUrl: string): boolean {
  try {
    return getSiteOrigin(canonicalSiteUrl) !== currentOrigin;
  } catch {
    return false;
  }
}

export function getSiteOriginMismatchMessage(
  currentOrigin: string,
  canonicalSiteUrl: string,
): string | null {
  if (!wouldAuthCallbackFail(currentOrigin, canonicalSiteUrl)) {
    return null;
  }

  let hostname: string;
  try {
    hostname = new URL(currentOrigin).hostname;
  } catch {
    return `Customer sign-in must use your configured site URL (${canonicalSiteUrl}), not ${currentOrigin}.`;
  }

  if (isLocalDevHost(hostname) || isDevTunnelHost(hostname)) {
    return `Customer sign-in must use your configured site URL (${canonicalSiteUrl}), not ${currentOrigin}. Shopify redirects back over HTTPS — open the tunnel URL while \`pnpm dev:shopify\` runs locally.`;
  }

  if (isVercelPreviewHost(hostname)) {
    return `Customer sign-in redirects to ${canonicalSiteUrl}. Open the production deployment at ${canonicalSiteUrl} instead of this preview URL (${currentOrigin}) so Shopify can return you to the account page.`;
  }

  return `Customer sign-in must use your configured site URL (${canonicalSiteUrl}), not ${currentOrigin}. Shopify only accepts the registered callback domain.`;
}
