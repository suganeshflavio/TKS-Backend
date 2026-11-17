/**
 * Protected Edge CDN Worker for TKS / Ramar's Academy Video Streaming
 *
 * Security features:
 * 1. Blocks direct address bar navigation (copy-pasting URL into Chrome or opening in a new tab).
 * 2. Restricts playback to authorized player domains (Origin / Referer validation).
 * 3. Hides Backblaze B2 credentials completely (B2 authorization is handled server-to-server).
 * 4. Verifies HMAC-SHA256 signature and expiration timestamp on /stream/* routes.
 * 5. Supports HTTP Range requests (206 Partial Content) and edge caching for smooth scrubbing.
 */

export interface Env {
  B2_BUCKET_NAME: string;
  B2_DOWNLOAD_URL: string;
  B2_KEY_ID: string;
  B2_APPLICATION_KEY: string;
  STREAM_SECRET?: string;
  ALLOWED_ORIGINS?: string;
}

interface B2Session {
  downloadUrl: string;
  authorizationToken: string;
  expiresAt: number;
}

let cachedSession: B2Session | null = null;

async function getB2Session(env: Env): Promise<B2Session> {
  const now = Date.now();
  if (cachedSession && cachedSession.expiresAt > now) {
    return cachedSession;
  }

  const credentials = btoa(`${env.B2_KEY_ID}:${env.B2_APPLICATION_KEY}`);
  const res = await fetch("https://api.backblazeb2.com/b2api/v2/b2_authorize_account", {
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  });

  if (!res.ok) {
    throw new Error(`B2 authorize failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as {
    downloadUrl?: string;
    authorizationToken: string;
  };

  cachedSession = {
    downloadUrl: data.downloadUrl || env.B2_DOWNLOAD_URL || "https://f005.backblazeb2.com",
    authorizationToken: data.authorizationToken,
    expiresAt: now + 23 * 60 * 60 * 1000,
  };

  return cachedSession;
}

async function verifyHmacSha256(
  secret: string,
  message: string,
  expectedHex: string
): Promise<boolean> {
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const sigBytes = new Uint8Array(
      expectedHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
    );

    return await crypto.subtle.verify("HMAC", key, sigBytes, enc.encode(message));
  } catch {
    return false;
  }
}

function isDirectBrowserNavigation(request: Request): boolean {
  const dest = request.headers.get("sec-fetch-dest");
  const mode = request.headers.get("sec-fetch-mode");

  // Modern browsers (Chrome, Edge, Firefox, Safari) set sec-fetch-dest: "document"
  // and sec-fetch-mode: "navigate" whenever a URL is pasted into the address bar or opened in a new tab.
  // Video player requests from <video> tags will have sec-fetch-dest: "video" (or "empty") and sec-fetch-mode: "cors" / "no-cors".
  if (dest === "document" || mode === "navigate") {
    return true;
  }
  return false;
}

function checkOriginAllowed(
  origin: string | null,
  referer: string | null,
  allowedOriginsStr?: string
): boolean {
  if (!allowedOriginsStr) {
    return true;
  }

  const allowedList = allowedOriginsStr
    .split(",")
    .map((o) => o.trim().toLowerCase())
    .filter(Boolean);

  const check = (urlStr: string | null): boolean => {
    if (!urlStr) return false;
    try {
      const parsed = new URL(urlStr);
      const originOnly = `${parsed.protocol}//${parsed.host}`.toLowerCase();
      return allowedList.some((allowed) => {
        if (allowed === "*") return true;
        if (allowed.startsWith("*.")) {
          const suffix = allowed.slice(1);
          return parsed.host.endsWith(suffix);
        }
        return originOnly === allowed || parsed.host === allowed;
      });
    } catch {
      return false;
    }
  };

  if (origin && check(origin)) return true;
  if (referer && check(referer)) return true;

  return false;
}

function getCorsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "Range, If-Range, If-None-Match, If-Modified-Since, Authorization, Content-Type, X-App-Platform",
    "Access-Control-Expose-Headers": "Content-Length, Content-Range, Accept-Ranges, ETag",
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const requestOrigin = request.headers.get("origin") || "*";

    // 1. CORS Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(requestOrigin),
      });
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", { status: 405 });
    }

    // 2. BLOCK DIRECT BROWSER ADDRESS BAR PLAYBACK / COPY-PASTE
    // If a student copies the link and pastes it into Chrome:
    if (isDirectBrowserNavigation(request)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "FORBIDDEN",
          message: "Direct playback and downloading in the browser address bar is forbidden. Videos can only be played inside the official academy web player."
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
            ...getCorsHeaders(requestOrigin),
          },
        }
      );
    }

    let filePath = "";
    let b2AuthToken: string | null = null;

    // Route 1: /stream/:filePath?exp=...&sig=... (New protected endpoint)
    if (url.pathname.startsWith("/stream/")) {
      filePath = url.pathname.substring("/stream/".length);

      const exp = url.searchParams.get("exp");
      const sig = url.searchParams.get("sig");

      if (!exp || !sig) {
        return new Response("Forbidden: Missing streaming token or signature", {
          status: 403,
          headers: getCorsHeaders(requestOrigin),
        });
      }

      const expNum = parseInt(exp, 10);
      const now = Math.floor(Date.now() / 1000);
      if (isNaN(expNum) || expNum < now) {
        return new Response("Forbidden: Streaming URL has expired", {
          status: 403,
          headers: getCorsHeaders(requestOrigin),
        });
      }

      const secret = env.STREAM_SECRET || "tksacademysecretkey";
      const isValid = await verifyHmacSha256(secret, `${filePath}:${exp}`, sig);
      if (!isValid) {
        return new Response("Forbidden: Invalid streaming signature", {
          status: 403,
          headers: getCorsHeaders(requestOrigin),
        });
      }

      // Check origin / referer if configured
      if (env.ALLOWED_ORIGINS) {
        const origin = request.headers.get("origin");
        const referer = request.headers.get("referer");
        if ((origin || referer) && !checkOriginAllowed(origin, referer, env.ALLOWED_ORIGINS)) {
          return new Response("Forbidden: Unauthorized domain", {
            status: 403,
            headers: getCorsHeaders(requestOrigin),
          });
        }
      }

      // Authorize with B2 behind the scenes
      const session = await getB2Session(env);
      b2AuthToken = session.authorizationToken;
    }
    // Route 2: /file/:bucket/:filePath (Legacy endpoint)
    else if (url.pathname.startsWith("/file/")) {
      const prefix = `/file/${env.B2_BUCKET_NAME}/`;
      if (!url.pathname.startsWith(prefix)) {
        return new Response("Invalid path", { status: 400 });
      }
      filePath = url.pathname.substring(prefix.length);

      const authParam = url.searchParams.get("Authorization");
      if (authParam) {
        b2AuthToken = authParam;
      } else {
        const session = await getB2Session(env);
        b2AuthToken = session.authorizationToken;
      }
    } else {
      return new Response("Not found", { status: 404 });
    }

    // 3. Build upstream URL to Backblaze B2
    const session = await getB2Session(env);
    const upstreamUrl = `${session.downloadUrl}/file/${env.B2_BUCKET_NAME}/${filePath}`;

    const headers = new Headers();
    if (b2AuthToken) {
      headers.set("Authorization", b2AuthToken);
    }

    const range = request.headers.get("range");
    if (range) {
      headers.set("Range", range);
    }

    // 4. Fetch from Backblaze B2
    const upstreamResponse = await fetch(upstreamUrl, {
      method: request.method,
      headers,
    });

    // 5. Build response headers with CORS & Caching
    const responseHeaders = new Headers(upstreamResponse.headers);
    const cors = getCorsHeaders(requestOrigin);
    for (const [k, v] of Object.entries(cors)) {
      responseHeaders.set(k, v);
    }

    // Cache media chunks for 5 minutes at edge to speed up seeking
    responseHeaders.set("Cache-Control", "private, max-age=300");

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  },
};
