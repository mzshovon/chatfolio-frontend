import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getBackendApiUrl } from "@/lib/env.server";
import { API_BASE_PATH } from "@/lib/env";

/**
 * The apex domain candidate subdomains are served under, e.g. "chatfolio.chat"
 * for `test.chatfolio.chat`. Configurable per environment (staging/prod) —
 * not NEXT_PUBLIC_ since it's only ever read here, server-side.
 */
const ROOT_DOMAIN = process.env.ROOT_DOMAIN ?? "chatfolio.chat";

/** Subdomains that must never be treated as a candidate slug. */
const RESERVED_SUBDOMAINS = new Set(["www", "api", "app", "admin", "cms"]);

/**
 * `*.localhost` resolves to 127.0.0.1 in every modern browser with no hosts
 * file edits, so this doubles as the local dev path for testing subdomain
 * routing (e.g. `test.localhost:3000`). Safe to leave on in production too —
 * a spoofed `Host: x.localhost` header served on the real prod IP would only
 * ever reach the same public, unauthenticated slug content `/x` already
 * serves, so it isn't a privilege-escalation surface.
 */
const ROOT_SUFFIXES = [`.${ROOT_DOMAIN}`, ".localhost"];

function extractSubdomain(host: string): string | null {
  const hostname = host.split(":")[0]?.toLowerCase() ?? "";

  for (const suffix of ROOT_SUFFIXES) {
    if (!hostname.endsWith(suffix)) continue;
    const label = hostname.slice(0, -suffix.length);
    // Reject empty (bare root), nested (a.b.chatfolio.chat), and reserved labels.
    if (!label || label.includes(".") || RESERVED_SUBDOMAINS.has(label)) {
      return null;
    }
    return label;
  }

  return null;
}

/**
 * Reverse-proxies every browser-facing `/api/v1/*` call to the real backend
 * (BACKEND_API_URL). The browser never talks to the backend directly — it
 * can't resolve an internal Docker hostname anyway, and this also sidesteps
 * CORS entirely for this flow: the browser only ever sees same-origin
 * requests, regardless of which candidate subdomain it's on. BACKEND_API_URL
 * is read fresh per request (not baked in at build time like a NEXT_PUBLIC_
 * var would be), so the same built image can point at a different backend
 * per environment with just a container env var, no rebuild.
 */
function proxyApiRequest(request: NextRequest): NextResponse | null {
  const { pathname, search } = request.nextUrl;
  if (!pathname.startsWith(`${API_BASE_PATH}/`) && pathname !== API_BASE_PATH) {
    return null;
  }

  let backendOrigin: string;
  try {
    backendOrigin = getBackendApiUrl();
  } catch {
    return NextResponse.json(
      { detail: "Server misconfigured: BACKEND_API_URL is not set." },
      { status: 500 }
    );
  }

  return NextResponse.rewrite(new URL(`${backendOrigin}${pathname}${search}`));
}

/**
 * Lets a candidate's Chatfolio be reached at either `chatfolio.chat/{slug}`
 * or `{slug}.chatfolio.chat` — the latter rewritten transparently to the
 * existing `/[slug]` route (URL bar keeps showing the subdomain) so no new
 * pages or API calls are needed; it's purely a routing alias.
 */
export function proxy(request: NextRequest) {
  const apiResponse = proxyApiRequest(request);
  if (apiResponse) return apiResponse;

  const host = request.headers.get("host") ?? request.nextUrl.hostname;
  const subdomain = extractSubdomain(host);

  if (!subdomain) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = url.pathname === "/" ? `/${subdomain}` : `/${subdomain}${url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
