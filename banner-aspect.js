// Banner aspect-ratio guard. For banner-style images (.section-banner,
// .mfp-banner img, .event-banner img, .mfp-img, img.banner), if the
// natural aspect ratio is too portrait to work as a banner, the image
// gets a .banner-natural class that lets it render at its natural
// proportions in a modest centered slot instead of being stretched or
// cropped into a banner rectangle.
//
// Also watches for src swaps (next-event.js swaps .mfp-img in place)
// and for banner imgs added after first paint.

(function () {
  var THRESHOLD = 1.3; // width/height; anything narrower reverts to natural
  var SELECTORS = '.section-banner, .mfp-banner img, .event-banner img, .mfp-img, img.banner';

  var style = document.createElement('style');
  style.textContent = [
    'img.banner-natural,',
    '.section-banner.banner-natural,',
    '.mfp-banner img.banner-natural,',
    '.event-banner img.banner-natural,',
    '.mfp-img.banner-natural {',
    '  max-height: none !important;',
    '  height: auto !important;',
    '  width: auto !important;',
    '  max-width: min(420px, 100%) !important;',
    '  margin-left: auto !important;',
    '  margin-right: auto !important;',
    '  display: block !important;',
    '  object-fit: contain !important;',
    '  border-radius: 12px;',
    '}'
  ].join('\n');
  document.head.appendChild(style);

  function check(img) {
    if (!img || !img.naturalHeight) return;
    var ar = img.naturalWidth / img.naturalHeight;
    if (ar < THRESHOLD) img.classList.add('banner-natural');
    else img.classList.remove('banner-natural');
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
