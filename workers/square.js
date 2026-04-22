/**
 * Cloudflare Worker: SSCY Square checkout
 *
 * Bridge between shop.html and the Square Payments + Orders APIs.
 * The frontend uses Square's Web Payments SDK to tokenize card details
 * in-browser (PCI-safe), then hands the resulting `sourceId` to this
 * worker which charges the card server-side using the secret access
 * token.
 *
 * Add secrets (Settings > Variables and Secrets):
 *   SQUARE_ACCESS_TOKEN  - Sandbox or Production access token
 *   SQUARE_LOCATION_ID   - Location ID for the SSCY seller
 *   SQUARE_APP_ID        - Application ID (public, also exposed to frontend)
 *   SQUARE_ENV           - "sandbox" or "production" (controls API host)
 *
 * Endpoints:
 *   GET  /config           -> { applicationId, locationId, environment }
 *                             Public values the frontend needs to init the
 *                             Web Payments SDK.
 *   POST /create-payment   -> { items, buyer, sourceId }
 *                             Creates an Order + charges the card. Returns
 *                             { ok, paymentId, receiptUrl, orderId, total }.
 */

const MAX_ITEMS = 20;
const MAX_ITEM_NAME = 200;
const MAX_QTY = 99;
const MAX_UNIT_PRICE_CENTS = 100000; // $1000 per line item, generous

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(request) });
    }

    const url = new URL(request.url);

    if (url.pathname === '/config' && request.method === 'GET') {
      return handleConfig(env, request);
    }
    if (url.pathname === '/create-payment' && request.method === 'POST') {
      return handleCreatePayment(request, env);
    }

    return jsonResponse({ error: 'Not found' }, 404, request);
  }
};

function handleConfig(env, request) {
  if (!env.SQUARE_APP_ID || !env.SQUARE_LOCATION_ID) {
    return jsonResponse({ error: 'Square not configured' }, 500, request);
  }
  return jsonResponse({
    applicationId: env.SQUARE_APP_ID,
    locationId: env.SQUARE_LOCATION_ID,
    environment: env.SQUARE_ENV || 'sandbox'
  }, 200, request);
}

async function handleCreatePayment(request, env) {
  if (!env.SQUARE_ACCESS_TOKEN || !env.SQUARE_LOCATION_ID) {
    return jsonResponse({ error: 'Square not configured' }, 500, request);
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return jsonResponse({ error: 'Invalid body' }, 400, request);
  }

  const sourceId = (body.sourceId || '').toString().trim();
  const items = Array.isArray(body.items) ? body.items : [];
  const buyer = body.buyer || {};

  if (!sourceId) return jsonResponse({ error: 'Missing card token' }, 400, request);
  if (!items.length) return jsonResponse({ error: 'Cart is empty' }, 400, request);
  if (items.length > MAX_ITEMS) return jsonResponse({ error: 'Too many items' }, 400, request);

  const lineItems = [];
  let totalCents = 0;
  for (const it of items) {
    const name = (it.name || '').toString().trim().substring(0, MAX_ITEM_NAME);
    const qty = Math.max(1, Math.min(MAX_QTY, parseInt(it.qty, 10) || 1));
    const unit = Math.round(Number(it.unitPriceCents) || 0);
    if (!name) return jsonResponse({ error: 'Item missing name' }, 400, request);
    if (unit < 0 || unit > MAX_UNIT_PRICE_CENTS) {
      return jsonResponse({ error: 'Invalid unit price' }, 400, request);
    }
    lineItems.push({
      name: name,
      quantity: String(qty),
      base_price_money: { amount: unit, currency: 'CAD' }
    });
    totalCents += unit * qty;
  }
  if (totalCents <= 0) return jsonResponse({ error: 'Order total is zero' }, 400, request);

  const env_host = (env.SQUARE_ENV === 'production')
    ? 'https://connect.squareup.com'
    : 'https://connect.squareupsandbox.com';
  const auth = { Authorization: 'Bearer ' + env.SQUARE_ACCESS_TOKEN };

  // 1. Create order
  const orderIdempotency = crypto.randomUUID();
  const orderPayload = {
    idempotency_key: orderIdempotency,
    order: {
      location_id: env.SQUARE_LOCATION_ID,
      line_items: lineItems,
      source: { name: 'SSCY Website' }
    }
  };
  if (buyer.email) orderPayload.order.customer_id = undefined; // reserved for future
  const orderRes = await fetch(env_host + '/v2/orders', {
    method: 'POST',
    headers: { ...auth, 'Content-Type': 'application/json', 'Square-Version': '2024-10-17' },
    body: JSON.stringify(orderPayload)
  });
  const orderData = await orderRes.json();
  if (!orderRes.ok || !orderData.order) {
    return jsonResponse({
      error: 'Could not create order',
      detail: firstError(orderData)
    }, 502, request);
  }
  const order = orderData.order;
  const totalMoney = order.total_money;

  // 2. Charge the card
  const payIdempotency = crypto.randomUUID();
  const payPayload = {
    idempotency_key: payIdempotency,
    source_id: sourceId,
    amount_money: totalMoney,
    order_id: order.id,
    location_id: env.SQUARE_LOCATION_ID,
    buyer_email_address: (buyer.email || '').toString().trim() || undefined,
    note: buyer.name ? ('Buyer: ' + buyer.name.substring(0, 80)) : undefined
  };
  const payRes = await fetch(env_host + '/v2/payments', {
    method: 'POST',
    headers: { ...auth, 'Content-Type': 'application/json', 'Square-Version': '2024-10-17' },
    body: JSON.stringify(payPayload)
  });
  const payData = await payRes.json();
  if (!payRes.ok || !payData.payment) {
    return jsonResponse({
      error: 'Payment failed',
      detail: firstError(payData)
    }, 402, request);
  }

  return jsonResponse({
    ok: true,
    paymentId: payData.payment.id,
    receiptUrl: payData.payment.receipt_url || null,
    orderId: order.id,
    total: totalMoney
  }, 200, request);
}

function firstError(resp) {
  if (resp && Array.isArray(resp.errors) && resp.errors.length) {
    const e = resp.errors[0];
    return [e.category, e.code, e.detail].filter(Boolean).join(' / ');
  }
  return '';
}

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
