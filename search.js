/* SSCY site-wide search.
 *
 * Loads /search-index.json on first focus, then filters/scores entries
 * against the query and renders a dropdown of matches inside .sn-search-results.
 *
 * Public API on window.SSCYSearch:
 *   .attach(input, results)  — wire an input + results container
 */
(function () {
  'use strict';

  var INDEX_URL = 'search-index.json';
  var MAX_RESULTS = 8;
  var indexPromise = null;

  function loadIndex() {
    if (indexPromise) return indexPromise;
    indexPromise = fetch(INDEX_URL, { cache: 'force-cache' })
      .then(function (r) { return r.ok ? r.json() : []; })
      .catch(function () { return []; });
    return indexPromise;
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function tokenize(q) {
    return String(q || '')
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(function (t) { return t.length > 1; });
  }

  // Score a single entry against the query tokens. Returns 0 if no match.
  function scoreEntry(entry, qLower, tokens) {
    var title = (entry.title || '').toLowerCase();
    var excerpt = (entry.excerpt || '').toLowerCase();
    var headings = entry.headings || [];
    var headingTexts = headings.map(function (h) { return (h.text || '').toLowerCase(); });

    var score = 0;
    var matchedHeadingIdx = -1;

    // Whole-phrase boosts.
    if (qLower && title.indexOf(qLower) >= 0) score += 60;
    for (var i = 0; i < headingTexts.length; i++) {
      if (qLower && headingTexts[i].indexOf(qLower) >= 0) {
        score += 40;
        if (matchedHeadingIdx < 0) matchedHeadingIdx = i;
      }
    }
    if (qLower && excerpt.indexOf(qLower) >= 0) score += 15;

    // Per-token scoring.
    var hitTokens = 0;
    for (var t = 0; t < tokens.length; t++) {
      var tk = tokens[t];
      var hit = false;
      if (title.indexOf(tk) >= 0) { score += 12; hit = true; }
      for (var h = 0; h < headingTexts.length; h++) {
        if (headingTexts[h].indexOf(tk) >= 0) {
          score += 6;
          hit = true;
          if (matchedHeadingIdx < 0) matchedHeadingIdx = h;
        }
      }
      if (excerpt.indexOf(tk) >= 0) { score += 3; hit = true; }
      if (hit) hitTokens++;
    }

    // Require at least one token hit when tokens exist.
    if (tokens.length > 0 && hitTokens === 0) return { score: 0 };

    // Slight boost for short titles that match well (more likely the canonical page).
    if (score > 0 && title.length < 40) score += 2;

    return { score: score, headingIdx: matchedHeadingIdx };
  }

  function search(index, q) {
    var qLower = String(q || '').trim().toLowerCase();
    if (!qLower) return [];
    var tokens = tokenize(qLower);
    var results = [];
    for (var i = 0; i < index.length; i++) {
      var entry = index[i];
      var s = scoreEntry(entry, qLower, tokens);
      if (s.score > 0) {
        results.push({ entry: entry, score: s.score, headingIdx: s.headingIdx });
      }
    }
    results.sort(function (a, b) { return b.score - a.score; });
    return results.slice(0, MAX_RESULTS);
  }

  function buildHref(entry, headingIdx) {
    var page = entry.page || '/';
    if (headingIdx != null && headingIdx >= 0 && entry.headings && entry.headings[headingIdx]) {
      var id = entry.headings[headingIdx].id;
      if (id) return page + '#' + id;
    }
    return page;
  }

  function renderResults(resultsEl, results, query) {
    if (!resultsEl) return;
    if (!query) {
      resultsEl.innerHTML = '';
      resultsEl.classList.remove('open');
      return;
    }
    if (results.length === 0) {
      resultsEl.innerHTML = '<div class="sn-search-empty">No matches for "' + escapeHtml(query) + '"</div>';
      resultsEl.classList.add('open');
      return;
    }
    var html = '';
    for (var i = 0; i < results.length; i++) {
      var r = results[i];
      var e = r.entry;
      var href = buildHref(e, r.headingIdx);
      var sub = '';
      if (r.headingIdx != null && r.headingIdx >= 0 && e.headings && e.headings[r.headingIdx]) {
        sub = e.headings[r.headingIdx].text;
      } else if (e.kind === 'post') {
        sub = 'Blog' + (e.categories && e.categories.length ? ' • ' + e.categories[0] : '');
      } else if (e.excerpt) {
        sub = e.excerpt;
      }
      html += '<a class="sn-search-result" href="' + escapeHtml(href) + '" data-idx="' + i + '">' +
                '<span class="sn-r-title">' + escapeHtml(e.title) + '</span>' +
                (sub ? '<span class="sn-r-sub">' + escapeHtml(sub) + '</span>' : '') +
              '</a>';
    }
    resultsEl.innerHTML = html;
    resultsEl.classList.add('open');
  }

  function attach(inputEl, resultsEl) {
    if (!inputEl || !resultsEl) return;

    var lastQuery = '';
    var activeIdx = -1;
    var currentResults = [];

    function runSearch() {
      var q = inputEl.value;
      lastQuery = q;
      loadIndex().then(function (idx) {
        if (inputEl.value !== lastQuery) return;
        currentResults = search(idx, q);
        activeIdx = -1;
        renderResults(resultsEl, currentResults, q.trim());
      });
    }

    function setActive(i) {
      var nodes = resultsEl.querySelectorAll('.sn-search-result');
      activeIdx = Math.max(-1, Math.min(nodes.length - 1, i));
      nodes.forEach(function (n, k) { n.classList.toggle('active', k === activeIdx); });
      var act = nodes[activeIdx];
      if (act && act.scrollIntoView) act.scrollIntoView({ block: 'nearest' });
    }

    inputEl.addEventListener('focus', function () {
      loadIndex();
      if (inputEl.value.trim()) runSearch();
    });

    inputEl.addEventListener('input', runSearch);

    inputEl.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(activeIdx + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(activeIdx - 1); }
      else if (e.key === 'Enter') {
        var nodes = resultsEl.querySelectorAll('.sn-search-result');
        var target = activeIdx >= 0 ? nodes[activeIdx] : nodes[0];
        if (target) {
          e.preventDefault();
          window.location.href = target.getAttribute('href');
        }
      } else if (e.key === 'Escape') {
        inputEl.value = '';
        renderResults(resultsEl, [], '');
        inputEl.blur();
      }
    });

    // Hide results on outside click.
    document.addEventListener('click', function (ev) {
      if (!inputEl.contains(ev.target) && !resultsEl.contains(ev.target)) {
        resultsEl.classList.remove('open');
      }
    });

    // Re-show if input refocused and value present.
    inputEl.addEventListener('focus', function () {
      if (inputEl.value.trim() && resultsEl.innerHTML) {
        resultsEl.classList.add('open');
      }
    });
  }

  window.SSCYSearch = { attach: attach, load: loadIndex };
})();
