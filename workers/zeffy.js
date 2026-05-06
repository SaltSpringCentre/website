/**
 * Cloudflare Worker: SSCY Zeffy proxy
 *
 * Read-only proxy for the Zeffy public API. Holds the API key as a worker
 * secret and forwards GETs to the Zeffy backend, with edge caching and a
 * strict CORS allowlist.
 *
 * Add secrets (Settings > Variables and Secrets):
 *   ZEFFY_API_KEY  - From your Zeffy dashboard (Settings > API or similar)
 *
 * Optional vars:
 *   ZEFFY_API_BASE - Override base URL (defaults to https://api.zeffy.com/v1)
 *
 * Endpoints:
 *   GET  /campaigns                 -> list active campaigns (5 min edge cache)
 *   GET  /campaigns/:id             -> single campaign detail
 *   GET  /payments?since=YYYY-MM-DD -> donations (60 sec cache)
 *   GET  /contacts                  -> donor contacts (60 sec cache)
 *   GET  /health                    -> { ok: true }
 *
 * NOTE: Zeffy does not publish full API specs publicly. The base URL and
 * Authorization header format below are best-guess based on common API
 * conventions. If your Zeffy dashboard shows a different base or header
 * scheme, override ZEFFY_API_BASE / adjust the `Authorization` header in
 * forward(). One sample successful curl from your dashboard is enough to
 * lock these in.
 */

const ALLOWED_ORIGINS = new Set([
  'https://saltspringcentre.com',
  'https://www.saltspringcentre.com',
  'https://saltspringcentre.github.io'
]);

const DEFAULT_BASE = 'https://api.zeffy.com/v1';

const CACHE_SECONDS = {
  '/campaigns': 300,
  '/payments': 60,
  '/contacts': 60
};

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(request) });
    }

    const url = new URL(request.url);

    if (url.pathname === '/health' && request.method === 'GET') {
      return jsonResponse({ ok: true, service: 'sscy-zeffy' }, 200, request);
    }

    if (request.method !== 'GET') {
      return jsonResponse({ error: 'Method not allowed' }, 405, request);
    }

    if (!env.ZEFFY_API_KEY) {
      return jsonResponse({ error: 'Zeffy not configured' }, 500, request);
    }

    if (url.pathname === '/campaigns' || url.pathname.startsWith('/campaigns/')) {
      return forward(url, env, request, ctx, '/campaigns');
    }
    if (url.pathname === '/payments') {
      return forward(url, env, request, ctx, '/payments');
    }
    if (url.pathname === '/contacts') {
      return forward(url, env, request, ctx, '/contacts');
    }

    return jsonResponse({ error: 'Not found' }, 404, request);
  }
};

async function forward(url, env, request, ctx, cacheKeyBase) {
  const base = (env.ZEFFY_API_BASE || DEFAULT_BASE).replace(/\/+$/, '');
  const upstream = base + url.pathname + url.search;

  const cache = caches.default;
  const cacheKey = new Request(upstream, { method: 'GET' });
  let cached = await cache.match(cacheKey);
  if (cached) {
    return withCors(cached, request);
  }

  let resp;
  try {
    resp = await fetch(upstream, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${env.ZEFFY_API_KEY}`,
        'Accept': 'application/json'
      }
    });
  } catch (err) {
    return jsonResponse({ error: 'Upstream fetch failed', detail: String(err) }, 502, request);
  }

  const body = await resp.text();

  if (!resp.ok) {
    return jsonResponse({
      error: 'Upstream error',
      status: resp.status,
      detail: safeParse(body)
    }, resp.status === 401 || resp.status === 403 ? resp.status : 502, request);
  }

  const ttl = CACHE_SECONDS[cacheKeyBase] || 60;
  const out = new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${ttl}`
    }
  });

  ctx.waitUntil(cache.put(cacheKey, out.clone()));
  return withCors(out, request);
}

function safeParse(text) {
  try { return JSON.parse(text); } catch { return text.slice(0, 500); }
}

function withCors(resp, request) {
  const headers = new Headers(resp.headers);
  const cors = corsHeaders(request);
  for (const [k, v] of Object.entries(cors)) headers.set(k, v);
  return new Response(resp.body, { status: resp.status, headers });
}

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const allowed = ALLOWED_ORIGINS.has(origin) ? origin : '';
  return {
    'Access-Control-Allow-Origin': allowed,
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}

function jsonResponse(obj, status, request) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(request)
    }
  });
}
