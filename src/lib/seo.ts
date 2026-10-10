// Canonical origin for SEO tags. Every page points search engines at the
// production custom domain, even when served from a netlify.app or preview host.
export const SITE_URL = "https://septicaudit.com";

export function absoluteUrl(path: string): string {
  return path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}

// Per-route head entries: absolute canonical link plus a matching og:url.
export function pageSeo(path: string) {
  const url = absoluteUrl(path);
  return {
    meta: [{ property: "og:url", content: url }],
    links: [{ rel: "canonical", href: url }],
  };
}
