/**
 * Cloudflare Worker: SSCY Contact Form relay
 *
 * Takes POST submissions from contact.html, validates, spam-checks,
 * then forwards to a Google Apps Script that sends the email from
 * info@saltspringcentre.com via GmailApp.
 *
 * Add secret (Settings > Variables and Secrets):
 *   CONTACT_RELAY_URL = deployed Apps Script /exec URL (scripts/contact-relay.gs)
 *
 * POST /contact  { name, email, subject, message, hp }
 *   hp is a hidden honeypot field - if filled, silently pretend success.
 */

const MAX_NAME = 120;
const MAX_EMAIL = 180;
const MAX_SUBJECT = 200;
const MAX_MESSAGE = 5000;
const MIN_MESSAGE = 10;

// Per-IP rate limit in the memory of a single isolate. Best-effort only;
// Workers don't guarantee state across isolates, but this is enough to
// slow down a script pointed at one POP.
const rateLimit = new Map();
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_MAX_PER_WINDOW = 5;

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(request) });
    }
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'POST only' }, 405, request);
    }
    if (!env.CONTACT_RELAY_URL) {
      return jsonResponse({ error: 'Relay not configured' }, 500, request);
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (!allowRate(ip)) {
      return jsonResponse(
        { error: 'Too many messages. Please try again later.' },
        429,
        request
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return jsonResponse({ error: 'Invalid body' }, 400, request);
    }

    // Honeypot: any content in the hp field means a bot; pretend success so
    // they don't learn their submission failed.
    if ((body.hp || '').toString().trim()) {
      return jsonResponse({ ok: true }, 200, request);
    }

    const name = (body.name || '').toString().trim();
    const email = (body.email || '').toString().trim();
    const subject = (body.subject || '').toString().trim() || 'Website contact';
    const message = (body.message || '').toString().trim();

    if (!name || name.length > MAX_NAME) {
      return jsonResponse({ error: 'Please enter your name.' }, 400, request);
    }
    if (!email || email.length > MAX_EMAIL || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ error: 'Please enter a valid email.' }, 400, request);
    }
    if (subject.length > MAX_SUBJECT) {
      return jsonResponse({ error: 'Subject is too long.' }, 400, request);
    }
    if (message.length < MIN_MESSAGE || message.length > MAX_MESSAGE) {
      return jsonResponse(
        { error: `Message must be ${MIN_MESSAGE}-${MAX_MESSAGE} characters.` },
        400,
        request
      );
    }

    const payload = {
      name,
      email,
      subject,
      message,
      ip,
      userAgent: request.headers.get('User-Agent') || '',
      submittedAt: new Date().toISOString()
    };

    try {
      const relayRes = await fetch(env.CONTACT_RELAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        redirect: 'follow'
      });
      if (!relayRes.ok) {
        const text = await relayRes.text();
        return jsonResponse(
          { error: 'Could not send right now. Please try again.' },
          502,
          request
        );
      }
      return jsonResponse({ ok: true }, 200, request);
    } catch (e) {
      return jsonResponse(
        { error: 'Could not send right now. Please try again.' },
        502,
        request
      );
    }
  }
};

function allowRate(ip) {
  const now = Date.now();
  const hits = (rateLimit.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_MAX_PER_WINDOW) {
    rateLimit.set(ip, hits);
    return false;
  }
  hits.push(now);
  rateLimit.set(ip, hits);
  // Trim stale keys occasionally
  if (rateLimit.size > 10000) {
    for (const [k, v] of rateLimit) {
      if (!v.length || now - v[v.length - 1] > RATE_WINDOW_MS) rateLimit.delete(k);
    }
  }
  return true;
}

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
