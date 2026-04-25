// Page hero picker. Looks for img[data-hero-pool="<Category>"] and swaps
// src with a deterministic pick from sscy-photos.json — filtered to
// aspect:'landscape' and landscape-aspect (width/height >= 1.3). Legacy
// fallback: treat hero:true as implicit 'landscape' when aspect is unset.
// If fetch fails or no viable images exist, the hardcoded src is left
// untouched.
//
// Works from site root and from /m/ subpages; resolves sscy-photos.json
// relative to the script's own URL via document.currentScript.
(function () {
  var THRESH = 1.3;
  var scriptEl = document.currentScript;
  var jsonUrl = scriptEl
    ? new URL('sscy-photos.json', scriptEl.src).href
    : 'sscy-photos.json';

  function hash(s) {
    var h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  function probe(src) {
    return new Promise(function (res) {
      var i = new Image();
      i.onload = function () {
        res(i.naturalHeight ? i.naturalWidth / i.naturalHeight : 0);
      };
      i.onerror = function () { res(0); };
      i.src = src;
    });
  }

  function resolveSrc(p) {
    // JSON paths are relative to site root (e.g. "images/..."). On /m/
    // pages we need to prepend "../" so the browser resolves correctly.
    if (/^https?:|^\//.test(p)) return p;
    if (location.pathname.indexOf('/m/') >= 0) return '../' + p;
    return p;
  }

  function go() {
    var imgs = document.querySelectorAll('img[data-hero-pool]');
    if (!imgs.length) return;
    fetch(jsonUrl, { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data) return;
        imgs.forEach(function (img) {
          var pool = img.getAttribute('data-hero-pool');
          var arr = (data[pool] || []).filter(function (p) {
            if (!p || !p.src) return false;
            if (p.aspect === 'landscape') return true;
            return !p.aspect && p.hero === true;
          });
          if (!arr.length) return;
          Promise.all(arr.map(function (p) {
            return probe(resolveSrc(p.src)).then(function (ar) {
              return ar >= THRESH ? p : null;
            });
          })).then(function (results) {
            var viable = results.filter(Boolean);
            if (!viable.length) return;
            var key = (img.id || location.pathname) + '|' + pool;
            var pick = viable[hash(key) % viable.length];
            img.setAttribute('src', resolveSrc(pick.src));
            if (pick.cap) img.setAttribute('alt', pick.cap);
          });
        });
      })
      .catch(function () { /* leave hardcoded srcs */ });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', go);
  } else {
    go();
  }
})();
