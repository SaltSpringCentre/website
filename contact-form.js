(function () {
  var WORKER = 'https://sscy-contact.executive-2ef.workers.dev/contact';

  function show(el, text) {
    if (!el) return;
    if (typeof text === 'string') el.textContent = text;
    el.style.display = 'block';
  }

  function hide(el) {
    if (el) el.style.display = 'none';
  }

  window.sscyContactSubmit = function (ev, form) {
    ev.preventDefault();

    var btn = document.getElementById('cf-submit');
    var success = document.getElementById('cf-success');
    var error = document.getElementById('cf-error');
    hide(success);
    hide(error);

    var payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      subject: form.subject.value.trim(),
      message: form.message.value.trim(),
      hp: form.hp.value
    };

    if (!payload.name || !payload.email || !payload.message) {
      show(error, 'Please fill in name, email, and message.');
      return false;
    }

    var originalLabel = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending...';

    fetch(WORKER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (r) {
        return r.json().then(function (d) { return { ok: r.ok, d: d }; })
          .catch(function () { return { ok: r.ok, d: {} }; });
      })
      .then(function (res) {
        btn.disabled = false;
        btn.textContent = originalLabel;
        if (res.ok) {
          form.reset();
          show(success);
        } else {
          var msg = (res.d && res.d.error) || 'Could not send. Please try again.';
          show(error, msg);
        }
      })
      .catch(function () {
        btn.disabled = false;
        btn.textContent = originalLabel;
        show(error, 'Network error. Please try again.');
      });

    return false;
  };
})();
