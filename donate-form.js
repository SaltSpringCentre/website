// Donation checkout via Square Web Payments SDK.
// Replaces the old square.link/u/... donate links with an on-site
// modal that never redirects the donor off saltspringcentre.com.
//
// Usage:
//   <script src="donate-form.js" defer></script>
//   Anywhere:  <a onclick="openDonate(50); return false;">$50</a>
//              <button onclick="openDonate(); return false;">Custom</button>
// openDonate(amount?) opens the modal. Pass a number (in dollars) to
// preset the amount; omit/pass null for a custom amount field.

(function () {
  var SQUARE_WORKER = 'https://sscy-square.executive-2ef.workers.dev';
  var DONATION_LABEL = 'Donation to Salt Spring Centre of Yoga';
  var squareConfig = null;
  var squarePayments = null;
  var squareCard = null;
  var built = false;
  var presetAmount = null;

  function build() {
    if (built) return;
    var style = document.createElement('style');
    style.textContent = [
      '.donate-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:2200;display:none;align-items:center;justify-content:center;padding:24px;}',
      '.donate-overlay.open{display:flex;}',
      '.donate-modal{background:#fff;border-radius:14px;max-width:480px;width:100%;max-height:90vh;overflow-y:auto;padding:28px 28px 24px;position:relative;font-family:"Archivo Narrow",sans-serif;color:#3a3a3a;}',
      '.donate-modal h3{font-family:"Cinzel",serif;font-size:1.4rem;color:#1a5c53;margin:0 0 16px;font-weight:600;}',
      '.donate-modal .donate-close{position:absolute;top:14px;right:16px;background:transparent;border:none;font-size:1.6rem;color:#7a7a7a;cursor:pointer;line-height:1;padding:4px 10px;}',
      '.donate-modal .donate-close:hover{color:#1a5c53;}',
      '.donate-modal label{display:block;margin-bottom:14px;font-size:0.8rem;font-weight:600;color:#7a7a7a;text-transform:uppercase;letter-spacing:0.08em;}',
      '.donate-modal input[type="text"],.donate-modal input[type="email"],.donate-modal input[type="number"]{width:100%;margin-top:6px;padding:12px 14px;border:1.5px solid rgba(0,0,0,0.1);background:#faf8f4;border-radius:8px;font-family:"Archivo Narrow",sans-serif;font-size:0.95rem;color:#3a3a3a;text-transform:none;letter-spacing:0;}',
      '.donate-modal input:focus{outline:none;border-color:#3bb8a8;}',
      '.donate-modal .donate-amount-row{display:flex;align-items:center;gap:8px;}',
      '.donate-modal .donate-amount-row .dollar{font-size:1.2rem;color:#7a7a7a;padding-bottom:2px;text-transform:none;letter-spacing:0;}',
      '.donate-modal #donate-card-container{margin-top:6px;min-height:90px;padding:10px 14px;border:1.5px solid rgba(0,0,0,0.1);background:#faf8f4;border-radius:8px;}',
      '.donate-modal .donate-pay{display:block;width:100%;padding:14px 22px;background:#1a5c53;color:#fff;border:none;border-radius:50px;font-family:"Archivo Narrow",sans-serif;font-size:0.98rem;font-weight:600;letter-spacing:0.04em;cursor:pointer;margin-top:12px;transition:background 0.2s;}',
      '.donate-modal .donate-pay:hover:not(:disabled){background:#2a8a7d;}',
      '.donate-modal .donate-pay:disabled{opacity:0.6;cursor:wait;}',
      '.donate-modal .donate-error{margin-top:14px;padding:10px 14px;background:rgba(212,110,84,0.12);border:1px solid #d46e54;border-radius:8px;color:#a44a36;font-size:0.88rem;display:none;}',
      '.donate-modal .donate-error.show{display:block;}',
      '.donate-modal .donate-success{display:none;text-align:center;padding:12px 0;}',
      '.donate-modal .donate-success.show{display:block;}',
      '.donate-modal .donate-success h4{font-family:"Cinzel",serif;font-size:1.3rem;color:#1a5c53;margin:0 0 10px;font-weight:600;}',
      '.donate-modal .donate-success p{color:#3a3a3a;margin-bottom:14px;}',
      '.donate-modal .donate-success a{display:inline-block;color:#2a8a7d;text-decoration:underline;margin-bottom:18px;}',
      '.donate-modal .donate-form.hidden{display:none;}',
      '.donate-modal .sandbox-note{font-size:0.75rem;color:#7a7a7a;margin-top:10px;padding:8px 12px;background:rgba(244,215,107,0.2);border-left:3px solid #c9a84c;border-radius:4px;display:none;}',
      '.donate-modal .sandbox-note.show{display:block;}'
    ].join('');
    document.head.appendChild(style);

    var overlay = document.createElement('div');
    overlay.className = 'donate-overlay';
    overlay.id = 'donateOverlay';
    overlay.innerHTML = [
      '<div class="donate-modal" role="dialog" aria-labelledby="donateTitle">',
      '<button type="button" class="donate-close" onclick="closeDonate()" aria-label="Close">&times;</button>',
      '<h3 id="donateTitle">Make a Donation</h3>',
      '<div class="donate-form" id="donateFormWrap">',
        '<label>Amount<div class="donate-amount-row"><span class="dollar">$</span><input type="number" id="donateAmount" min="1" step="1" inputmode="decimal"></div></label>',
        '<label>Name<input type="text" id="donateName" required maxlength="120" autocomplete="name"></label>',
        '<label>Email<input type="email" id="donateEmail" required maxlength="180" autocomplete="email"></label>',
        '<label>Card<div id="donate-card-container"></div></label>',
        '<button type="button" class="donate-pay" id="donatePay" onclick="submitDonation()">Donate <span id="donatePayAmount"></span></button>',
        '<div class="donate-error" id="donateError"></div>',
        '<div class="sandbox-note" id="donateSandboxNote">Test mode: card 4111 1111 1111 1111, any future expiry, any CVV.</div>',
      '</div>',
      '<div class="donate-success" id="donateSuccess">',
        '<h4>Thank you.</h4>',
        '<p id="donateSuccessMsg"></p>',
        '<a href="#" target="_blank" rel="noopener" id="donateReceiptLink" style="display:none;">View receipt</a>',
        '<button type="button" class="donate-pay" onclick="closeDonate()">Close</button>',
      '</div>',
      '</div>'
    ].join('');
    document.body.appendChild(overlay);

    built = true;
  }

  function getAmount() {
    var v = parseFloat(document.getElementById('donateAmount').value);
    if (!v || v < 1) return 0;
    return Math.round(v * 100);
  }

  function updatePayLabel() {
    var cents = getAmount();
    var el = document.getElementById('donatePayAmount');
    if (el) el.textContent = cents ? '$' + (cents / 100).toFixed(2) : '';
  }

  window.openDonate = function (amount) {
    build();
    document.getElementById('donateFormWrap').classList.remove('hidden');
    document.getElementById('donateSuccess').classList.remove('show');
    document.getElementById('donateError').classList.remove('show');
    var amtInput = document.getElementById('donateAmount');
    if (amount && !isNaN(amount)) amtInput.value = amount;
    else amtInput.value = '';
    amtInput.oninput = updatePayLabel;
    updatePayLabel();
    document.getElementById('donateOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
    initSquare();
  };

  window.closeDonate = function () {
    document.getElementById('donateOverlay').classList.remove('open');
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
      await squareCard.attach('#donate-card-container');
      if (squareConfig.environment === 'sandbox') {
        document.getElementById('donateSandboxNote').classList.add('show');
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

  window.submitDonation = async function () {
    var name = document.getElementById('donateName').value.trim();
    var email = document.getElementById('donateEmail').value.trim();
    var cents = getAmount();
    if (!cents) return showError('Please enter an amount.');
    if (!name) return showError('Please enter your name.');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError('Please enter a valid email.');
    if (!squareCard) return showError('Payment form is still loading.');

    var btn = document.getElementById('donatePay');
    btn.disabled = true;
    btn.textContent = 'Processing...';
    document.getElementById('donateError').classList.remove('show');

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
          items: [{ name: DONATION_LABEL, qty: 1, unitPriceCents: cents }],
          buyer: { name: name, email: email }
        })
      });
      var payData = await payRes.json();
      if (!payRes.ok || !payData.ok) {
        throw new Error(payData.detail || payData.error || 'Payment failed');
      }
      document.getElementById('donateFormWrap').classList.add('hidden');
      document.getElementById('donateSuccessMsg').textContent = 'Your gift of $' + (cents / 100).toFixed(2) + ' has been received. A receipt was sent to ' + email + '.';
      var link = document.getElementById('donateReceiptLink');
      if (payData.receiptUrl) {
        link.href = payData.receiptUrl;
        link.style.display = 'inline-block';
      } else {
        link.style.display = 'none';
      }
      document.getElementById('donateSuccess').classList.add('show');
    } catch (e) {
      showError(e && e.message ? e.message : 'Payment failed.');
    } finally {
      btn.disabled = false;
      updatePayLabel();
      btn.innerHTML = 'Donate <span id="donatePayAmount">' + (document.getElementById('donatePayAmount') ? document.getElementById('donatePayAmount').textContent : '') + '</span>';
    }
  };

  function showError(msg) {
    var el = document.getElementById('donateError');
    el.textContent = msg;
    el.classList.add('show');
  }
})();
