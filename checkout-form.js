// Cart checkout via Square Web Payments SDK. Shared between desktop
// shop.html and m/shop.html. Reads the existing `cart` array and
// `PRODUCTS` list from the host page.
//
// Call window.openCheckout() to open the modal. Cart must be non-empty
// and total > 0.

(function () {
  var SQUARE_WORKER = 'https://sscy-square.executive-2ef.workers.dev';
  var squareConfig = null;
  var squarePayments = null;
  var squareCard = null;
  var built = false;

  function getCart() { return (typeof cart !== 'undefined' && Array.isArray(cart)) ? cart : []; }
  function getProducts() { return (typeof PRODUCTS !== 'undefined' && Array.isArray(PRODUCTS)) ? PRODUCTS : []; }

  function getLineItems() {
    var products = getProducts();
    return getCart().map(function (item) {
      var p = products.find(function (x) { return x.id === item.id; });
      if (!p) return null;
      var price = typeof p.price === 'number' && p.price > 0 ? p.price : 0;
      return { name: p.title, qty: item.qty, unitPriceCents: Math.round(price * 100) };
    }).filter(Boolean);
  }

  function getTotalCents() {
    return getLineItems().reduce(function (s, l) { return s + l.unitPriceCents * l.qty; }, 0);
  }

  function build() {
    if (built) return;
    var style = document.createElement('style');
    style.textContent = [
      '.co-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:2200;display:none;align-items:center;justify-content:center;padding:16px;}',
      '.co-overlay.open{display:flex;}',
      '.co-modal{background:#fff;border-radius:14px;max-width:520px;width:100%;max-height:92vh;overflow-y:auto;padding:24px 24px 20px;position:relative;font-family:"Archivo Narrow",sans-serif;color:#3a3a3a;}',
      '.co-modal h3{font-family:"Cinzel",serif;font-size:1.3rem;color:#1a5c53;margin:0 0 14px;font-weight:600;}',
      '.co-modal .co-close{position:absolute;top:10px;right:12px;background:transparent;border:none;font-size:1.5rem;color:#7a7a7a;cursor:pointer;line-height:1;padding:4px 10px;}',
      '.co-modal .co-close:hover{color:#1a5c53;}',
      '.co-modal .co-summary{background:#f3ede3;border-radius:8px;padding:12px 14px;margin-bottom:14px;font-size:0.88rem;}',
      '.co-modal .co-summary .line{display:flex;justify-content:space-between;padding:3px 0;color:#3a3a3a;}',
      '.co-modal .co-summary .line.total{margin-top:6px;padding-top:8px;border-top:1px solid rgba(0,0,0,0.1);font-weight:600;color:#1a5c53;font-size:0.98rem;}',
      '.co-modal label{display:block;margin-bottom:12px;font-size:0.78rem;font-weight:600;color:#7a7a7a;text-transform:uppercase;letter-spacing:0.08em;}',
      '.co-modal input[type="text"],.co-modal input[type="email"]{width:100%;margin-top:5px;padding:11px 13px;border:1.5px solid rgba(0,0,0,0.1);background:#faf8f4;border-radius:8px;font-family:"Archivo Narrow",sans-serif;font-size:0.95rem;color:#3a3a3a;text-transform:none;letter-spacing:0;}',
      '.co-modal input:focus{outline:none;border-color:#3bb8a8;}',
      '.co-modal #co-card-container{margin-top:5px;min-height:86px;padding:10px 13px;border:1.5px solid rgba(0,0,0,0.1);background:#faf8f4;border-radius:8px;}',
      '.co-modal .co-pay{display:block;width:100%;padding:13px 20px;background:#1a5c53;color:#fff;border:none;border-radius:50px;font-family:"Archivo Narrow",sans-serif;font-size:0.96rem;font-weight:600;letter-spacing:0.04em;cursor:pointer;margin-top:10px;transition:background 0.2s;}',
      '.co-modal .co-pay:hover:not(:disabled){background:#2a8a7d;}',
      '.co-modal .co-pay:disabled{opacity:0.6;cursor:wait;}',
      '.co-modal .co-error{margin-top:12px;padding:9px 12px;background:rgba(212,110,84,0.12);border:1px solid #d46e54;border-radius:8px;color:#a44a36;font-size:0.86rem;display:none;}',
      '.co-modal .co-error.show{display:block;}',
      '.co-modal .co-success{display:none;text-align:center;padding:10px 0;}',
      '.co-modal .co-success.show{display:block;}',
      '.co-modal .co-success h4{font-family:"Cinzel",serif;font-size:1.25rem;color:#1a5c53;margin:0 0 8px;font-weight:600;}',
      '.co-modal .co-success p{color:#3a3a3a;margin-bottom:12px;}',
      '.co-modal .co-success a{display:inline-block;color:#2a8a7d;text-decoration:underline;margin-bottom:14px;}',
      '.co-modal .co-form.hidden,.co-modal .co-summary.hidden{display:none;}',
      '.co-modal .sandbox-note{font-size:0.74rem;color:#7a7a7a;margin-top:8px;padding:7px 10px;background:rgba(244,215,107,0.2);border-left:3px solid #c9a84c;border-radius:4px;display:none;}',
      '.co-modal .sandbox-note.show{display:block;}'
    ].join('');
    document.head.appendChild(style);

    var overlay = document.createElement('div');
    overlay.className = 'co-overlay';
    overlay.id = 'coOverlay';
    overlay.innerHTML = [
      '<div class="co-modal" role="dialog" aria-labelledby="coTitle">',
      '<button type="button" class="co-close" onclick="closeCheckout()" aria-label="Close">&times;</button>',
      '<h3 id="coTitle">Checkout</h3>',
      '<div class="co-summary" id="coSummary"></div>',
      '<div class="co-form" id="coForm">',
        '<label>Name<input type="text" id="coName" required maxlength="120" autocomplete="name"></label>',
        '<label>Email<input type="email" id="coEmail" required maxlength="180" autocomplete="email"></label>',
        '<label>Card<div id="co-card-container"></div></label>',
        '<button type="button" class="co-pay" id="coPay" onclick="submitCheckout()">Pay <span id="coPayAmount"></span></button>',
        '<div class="co-error" id="coError"></div>',
        '<div class="sandbox-note" id="coSandboxNote">Test mode: card 4111 1111 1111 1111, any future expiry, any CVV.</div>',
      '</div>',
      '<div class="co-success" id="coSuccess">',
        '<h4>Thank you!</h4>',
        '<p id="coSuccessMsg"></p>',
        '<a href="#" target="_blank" rel="noopener" id="coReceiptLink" style="display:none;">View receipt</a>',
        '<button type="button" class="co-pay" onclick="closeCheckout()">Done</button>',
      '</div>',
      '</div>'
    ].join('');
    document.body.appendChild(overlay);
    built = true;
  }

  window.openCheckout = function () {
    build();
    var lines = getLineItems();
    if (!lines.length) {
      if (typeof showToast === 'function') showToast('Your cart is empty.');
      return;
    }
    var totalCents = getTotalCents();
    if (totalCents <= 0) {
      if (typeof showToast === 'function') showToast('Cart total is zero.');
      return;
    }

    var summary = document.getElementById('coSummary');
    summary.innerHTML = lines.map(function (l) {
      return '<div class="line"><span>' + escapeHtml(l.name) + (l.qty > 1 ? ' × ' + l.qty : '') + '</span><span>$' + (l.unitPriceCents * l.qty / 100).toFixed(2) + '</span></div>';
    }).join('') +
      '<div class="line total"><span>Total</span><span>$' + (totalCents / 100).toFixed(2) + '</span></div>';
    document.getElementById('coPayAmount').textContent = '$' + (totalCents / 100).toFixed(2);

    document.getElementById('coForm').classList.remove('hidden');
    document.getElementById('coSummary').classList.remove('hidden');
    document.getElementById('coSuccess').classList.remove('show');
    document.getElementById('coError').classList.remove('show');

    document.getElementById('coOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
    initSquare();
  };

  window.closeCheckout = function () {
    document.getElementById('coOverlay').classList.remove('open');
    document.body.style.overflow = '';
  };

  async function initSquare() {
    if (squareCard) return;
    try {
      if (!squareConfig) {
        var r = await fetch(SQUARE_WORKER + '/config');
        squareConfig = await r.json();
        if (!squareConfig.applicationId) throw new Error('Square not configured');
      }
      if (!window.Square) {
        await loadScript(squareConfig.environment === 'production'
          ? 'https://web.squarecdn.com/v1/square.js'
          : 'https://sandbox.web.squarecdn.com/v1/square.js');
      }
      squarePayments = window.Square.payments(squareConfig.applicationId, squareConfig.locationId);
      squareCard = await squarePayments.card();
      await squareCard.attach('#co-card-container');
      if (squareConfig.environment === 'sandbox') {
        document.getElementById('coSandboxNote').classList.add('show');
      }
    } catch (e) {
      showError('Could not load payment form. ' + (e && e.message ? e.message : ''));
    }
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('Failed to load ' + src)); };
      document.head.appendChild(s);
    });
  }

  window.submitCheckout = async function () {
    var name = document.getElementById('coName').value.trim();
    var email = document.getElementById('coEmail').value.trim();
    if (!name) return showError('Please enter your name.');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError('Please enter a valid email.');
    if (!squareCard) return showError('Payment form is still loading.');

    var btn = document.getElementById('coPay');
    btn.disabled = true;
    btn.textContent = 'Processing...';
    document.getElementById('coError').classList.remove('show');

    try {
      var result = await squareCard.tokenize();
      if (result.status !== 'OK') {
        var errs = (result.errors || []).map(function (e) { return e.message; }).join(' ');
        throw new Error(errs || 'Card was not accepted.');
      }
      var payRes = await fetch(SQUARE_WORKER + '/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: result.token,
          items: getLineItems(),
          buyer: { name: name, email: email }
        })
      });
      var payData = await payRes.json();
      if (!payRes.ok || !payData.ok) {
        throw new Error(payData.detail || payData.error || 'Payment failed');
      }

      // Clear cart
      if (typeof cart !== 'undefined') {
        cart.length = 0;
        if (typeof saveCart === 'function') saveCart();
        if (typeof updateCartUI === 'function') updateCartUI();
        if (typeof renderCartItems === 'function') renderCartItems();
      }

      document.getElementById('coForm').classList.add('hidden');
      document.getElementById('coSummary').classList.add('hidden');
      document.getElementById('coSuccessMsg').textContent = 'Your payment was received. A receipt was sent to ' + email + '.';
      var link = document.getElementById('coReceiptLink');
      if (payData.receiptUrl) {
        link.href = payData.receiptUrl;
        link.style.display = 'inline-block';
      } else {
        link.style.display = 'none';
      }
      document.getElementById('coSuccess').classList.add('show');
    } catch (e) {
      showError(e && e.message ? e.message : 'Payment failed.');
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Pay <span id="coPayAmount">$' + (getTotalCents() / 100).toFixed(2) + '</span>';
    }
  };

  function showError(msg) {
    var el = document.getElementById('coError');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
  }

  function escapeHtml(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
})();
