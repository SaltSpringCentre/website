// Banner aspect-ratio guard. For banner-style images (.section-banner,
// .mfp-banner img, .event-banner img, .mfp-img, img.banner,
// .hero-img, .event-hero-img, .about-hero-img, and .bg inside .hero /
// .bleed / .event-hero), if the image's natural aspect ratio is narrower
// than its rendered slot (meaning object-fit:cover would crop the top
// and bottom), the image gets a .banner-natural class that renders it
// at its actual proportions in a modest centered slot instead.
//
// Compares natural aspect to the slot's actual rendered aspect, so
// this works correctly at any viewport width. Small tolerance allows
// a sliver of crop without triggering the natural-size fallback.
//
// Also watches for src swaps (next-event.js swaps .mfp-img in place,
// and event.html / m/event.html swap .event-hero-img / .bg per route)
// and for banner imgs added after first paint.

(function () {
  // Any image whose natural aspect is narrower than slotAspect * TOLERANCE
  // gets demoted to natural rendering. 0.95 lets a 5% vertical crop slide;
  // anything more aggressive than that falls back to natural display.
  var TOLERANCE = 0.95;
  var SELECTORS = [
    '.section-banner',
    '.mfp-banner img',
    '.event-banner img',
    '.mfp-img',
    'img.banner',
    '.hero-img',
    '.event-hero-img',
    '.about-hero-img',
    '.hero > img.bg',
    '.bleed > img.bg',
    '.event-hero > img.bg'
  ].join(', ');

  var style = document.createElement('style');
  style.textContent = [
    'img.banner-natural,',
    '.section-banner.banner-natural,',
    '.mfp-banner img.banner-natural,',
    '.event-banner img.banner-natural,',
    '.mfp-img.banner-natural,',
    '.hero-img.banner-natural,',
    '.event-hero-img.banner-natural,',
    '.about-hero-img.banner-natural,',
    '.hero > img.bg.banner-natural,',
    '.bleed > img.bg.banner-natural,',
    '.event-hero > img.bg.banner-natural {',
    '  max-height: 70vh !important;',
    '  height: auto !important;',
    '  width: 100% !important;',
    '  max-width: 100% !important;',
    '  object-fit: contain !important;',
    '  display: block !important;',
    '  margin-left: auto !important;',
    '  margin-right: auto !important;',
    '  position: relative !important;',
    '  inset: auto !important;',
    '  top: auto !important;',
    '  left: auto !important;',
    '  right: auto !important;',
    '  bottom: auto !important;',
    '  transform: none !important;',
    '  border-radius: 12px;',
    '}'
  ].join('\n');
  document.head.appendChild(style);

  function check(img) {
    if (!img || !img.naturalHeight) return;
    var natural = img.naturalWidth / img.naturalHeight;

    // Temporarily clear .banner-natural so we measure the true banner slot,
    // not the natural-mode slot we may have applied on a prior pass.
    var wasNatural = img.classList.contains('banner-natural');
    if (wasNatural) img.classList.remove('banner-natural');
    var slotWidth = img.clientWidth;
    var slotHeight = img.clientHeight;
    if (!slotWidth || !slotHeight) {
      // Slot hasn't laid out yet; try again on the next frame.
      if (wasNatural) img.classList.add('banner-natural');
      requestAnimationFrame(function () { check(img); });
      return;
    }
    var slot = slotWidth / slotHeight;

    if (natural < slot * TOLERANCE) img.classList.add('banner-natural');
  }

  function bind(img) {
    if (img.complete && img.naturalHeight) check(img);
    else img.addEventListener('load', function () { check(img); }, { once: true });
  }

  function scanAll(root) {
    (root || document).querySelectorAll(SELECTORS).forEach(bind);
  }

  var srcObs = new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      var m = mutations[i];
      if (m.type === 'attributes' && m.attributeName === 'src') {
        var t = m.target;
        t.classList.remove('banner-natural');
        bind(t);
      }
    }
  });
  function watchSrc(img) {
    srcObs.observe(img, { attributes: true, attributeFilter: ['src'] });
  }

  function handleNode(n) {
    if (!n || n.nodeType !== 1) return;
    if (n.matches && n.matches(SELECTORS)) {
      bind(n);
      watchSrc(n);
    }
    if (n.querySelectorAll) {
      n.querySelectorAll(SELECTORS).forEach(function (img) {
        bind(img);
        watchSrc(img);
      });
    }
  }

  function init() {
    scanAll();
    document.querySelectorAll(SELECTORS).forEach(watchSrc);

    var treeObs = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        for (var j = 0; j < m.addedNodes.length; j++) handleNode(m.addedNodes[j]);
      }
    });
    treeObs.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
