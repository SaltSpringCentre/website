/* Site-search nav injector.
 *
 * Injects a centered search input + results dropdown into .sticky-nav-inner
 * on every page that includes this script. Desktop only; hides under 768px.
 *
 * On index.html, fades in once the nav has the .pinned class (after scroll
 * past hero). On other pages — where the nav is pinned-equivalent from page
 * load — the bar is visible immediately.
 *
 * Depends on search.js loading first (defer order is fine since both are deferred).
 */
(function () {
  'use strict';

  var BREAKPOINT = 768;

  function inject() {
    if (window.innerWidth < BREAKPOINT) return; // mobile skipped per requirements
    var nav = document.querySelector('.sticky-nav');
    var inner = nav && nav.querySelector('.sticky-nav-inner');
    if (!inner) return;
    if (inner.querySelector('.sn-search')) return; // already injected

    // Inject CSS once.
    if (!document.getElementById('sn-search-style')) {
      var st = document.createElement('style');
      st.id = 'sn-search-style';
      st.textContent = [
        '.sn-search { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);',
        '  width: clamp(220px, 28vw, 360px); opacity: 0; pointer-events: none;',
        '  transition: opacity 0.35s ease; z-index: 5; }',
        '.sticky-nav.pinned .sn-search,',
        '.sn-search.always-on { opacity: 1; pointer-events: auto; }',
        '.sn-search-input { width: 100%; box-sizing: border-box; padding: 9px 16px 9px 38px;',
        '  border: 1px solid rgba(0,0,0,0.10); border-radius: 50px;',
        '  background: rgba(255,255,255,0.85); color: #2c2c2c;',
        '  font-family: "Archivo Narrow", sans-serif; font-size: 0.92rem; letter-spacing: 0.02em;',
        '  outline: none; transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease; }',
        '.sn-search-input::placeholder { color: #9a9a9a; }',
        '.sn-search-input:focus { border-color: #2a8a7d; background: #fff;',
        '  box-shadow: 0 2px 14px rgba(42,138,125,0.14); }',
        '.sn-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%);',
        '  width: 16px; height: 16px; color: #7a7a7a; pointer-events: none; }',
        '.sn-search-results { position: absolute; left: 0; right: 0; top: calc(100% + 8px);',
        '  background: #fff; border: 1px solid rgba(0,0,0,0.08); border-radius: 14px;',
        '  box-shadow: 0 10px 30px rgba(0,0,0,0.10); max-height: 60vh; overflow-y: auto;',
        '  display: none; }',
        '.sn-search-results.open { display: block; }',
        '.sn-search-result { display: block; padding: 10px 16px; text-decoration: none;',
        '  color: #2c2c2c; border-bottom: 1px solid rgba(0,0,0,0.05);',
        '  font-family: "Archivo Narrow", sans-serif; transition: background 0.15s ease; }',
        '.sn-search-result:last-child { border-bottom: 0; }',
        '.sn-search-result:hover, .sn-search-result.active { background: #f3ede3; color: #2a8a7d; }',
        '.sn-r-title { display: block; font-size: 0.95rem; font-weight: 600;',
        '  letter-spacing: 0.02em; margin-bottom: 2px; }',
        '.sn-r-sub { display: block; font-size: 0.8rem; color: #7a7a7a; line-height: 1.35;',
        '  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
        '.sn-search-empty { padding: 14px 16px; font-family: "Archivo Narrow", sans-serif;',
        '  font-size: 0.9rem; color: #7a7a7a; }',
        '@media (max-width: ' + BREAKPOINT + 'px) { .sn-search { display: none; } }'
      ].join('\n');
      document.head.appendChild(st);
    }

    // Build markup.
    var wrap = document.createElement('div');
    wrap.className = 'sn-search';
    wrap.innerHTML =
      '<svg class="sn-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
        'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>' +
      '</svg>' +
      '<input class="sn-search-input" type="search" placeholder="Search the site..." ' +
        'aria-label="Search the site" autocomplete="off" />' +
      '<div class="sn-search-results" role="listbox"></div>';
    inner.appendChild(wrap);

    // Pages without a hero/scroll-driven nav (everything besides index.html)
    // never get .pinned added — show the search immediately on those.
    var path = (window.location.pathname || '').split('/').pop();
    var isIndex = (path === '' || path === 'index.html');
    if (!isIndex) wrap.classList.add('always-on');

    var input = wrap.querySelector('.sn-search-input');
    var results = wrap.querySelector('.sn-search-results');

    // Wait for search.js if needed.
    function tryAttach() {
      if (window.SSCYSearch && typeof window.SSCYSearch.attach === 'function') {
        window.SSCYSearch.attach(input, results);
      } else {
        setTimeout(tryAttach, 50);
      }
    }
    tryAttach();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
