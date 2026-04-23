// email-link.js — assemble mailto links at runtime to defeat naive scrapers.
// Usage: <a data-u="info" data-d="saltspringcentre.com" data-subject="Hello" href="#">Email us</a>
//        <span data-u="payment" data-d="saltspringcentre.com"></span>
(function () {
  function build() {
    var nodes = document.querySelectorAll('[data-u][data-d]:not([data-e-done])');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var u = el.getAttribute('data-u');
      var d = el.getAttribute('data-d');
      if (!u || !d) continue;
      var addr = u + '@' + d;
      if (el.tagName === 'A') {
        var subj = el.getAttribute('data-subject');
        var href = 'mailto:' + addr;
        if (subj) href += '?subject=' + encodeURIComponent(subj);
        el.setAttribute('href', href);
        var hasChildElements = el.children && el.children.length > 0;
        var cur = (el.textContent || '').trim();
        if (!hasChildElements && (cur === '' || cur === '#' || cur === addr)) {
          el.textContent = addr;
        }
      } else if (!el.firstChild) {
        el.textContent = addr;
      }
      el.setAttribute('data-e-done', '1');
    }
  }
  window.emailLink = build;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
  // Catch dynamically-injected nodes (e.g. event.html template strings via innerHTML).
  if (typeof MutationObserver !== 'undefined') {
    var mo = new MutationObserver(function () { build(); });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
