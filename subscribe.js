(function () {
  var WORKER = 'https://sscy-mailchimp-sync.executive-2ef.workers.dev/subscribe';

  function message(form, text) {
    form.innerHTML = '<p style="padding:10px;opacity:0.7;font-size:0.85rem;">' + text + '</p>';
  }

  window.sscySubscribe = function (ev, form) {
    ev.preventDefault();
    var input = form.querySelector('input[type=email]');
    var email = input ? input.value.trim() : '';
    if (!email) return false;

    var btn = form.querySelector('button[type=submit]');
    if (btn) { btn.disabled = true; btn.textContent = '...'; }

    fetch(WORKER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email })
    })
      .then(function (r) {
        return r.json().then(function (d) { return { ok: r.ok, d: d }; })
          .catch(function () { return { ok: r.ok, d: {} }; });
      })
      .then(function (res) {
        if (res.ok) {
          message(form, 'Thank you! Check your email to confirm.');
        } else {
          var msg = (res.d && (res.d.detail || res.d.error)) || 'Please try again.';
          message(form, msg);
        }
      })
      .catch(function () {
        message(form, 'Network error. Please try again.');
      });

    return false;
  };
})();
