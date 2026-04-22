// Populates the homepage "next event" banner with the next upcoming
// retreat or concert from EVENTS (events-data.js). Weekly classes and
// community gatherings are not in EVENTS, so they're excluded naturally.
// If no future event is found, the banner is hidden.

(function () {
  if (typeof EVENTS === 'undefined' || !Array.isArray(EVENTS)) return;

  var today = new Date();
  today.setHours(0, 0, 0, 0);

  var upcoming = EVENTS
    .filter(function (e) {
      if (!e || !e.date) return false;
      var d = new Date(e.date + 'T00:00:00');
      return !isNaN(d) && d >= today;
    })
    .sort(function (a, b) {
      return a.date.localeCompare(b.date);
    });

  var next = upcoming[0];

  var desktop = document.querySelector('.mfp-banner');
  var mobile = document.querySelector('.event-banner');

  if (!next) {
    if (desktop) desktop.style.display = 'none';
    if (mobile) mobile.style.display = 'none';
    return;
  }

  var isConcert = next.type === 'concert';
  var seriesLabel = isConcert ? 'Music for Peace Concert Series' : 'Upcoming Retreat';
  var cleanTitle = (next.title || '').replace(/^Music for Peace:\s*/i, '');
  var ctaLabel = isConcert
    ? 'Get Tickets' + (next.price && next.price !== 'Inquire' && next.price !== 'By Donation' ? ' • ' + next.price : '')
    : 'Learn More' + (next.price && next.price !== 'Inquire' ? ' • ' + next.price : '');
  var href = 'event.html?id=' + encodeURIComponent(next.id);

  if (desktop) {
    desktop.setAttribute('href', href);
    setText(desktop.querySelector('.mfp-series'), seriesLabel);
    setText(desktop.querySelector('.mfp-title'), cleanTitle);
    var artistsEl = desktop.querySelector('.mfp-artists');
    if (artistsEl) {
      if (isConcert && next.desc) {
        // Try to extract artist names from the description if they're first sentence.
        // Otherwise fall back to the date label.
        var firstSentence = next.desc.split(/\.\s/)[0];
        artistsEl.textContent = firstSentence.length < 120 ? firstSentence : next.dateLabel;
      } else {
        artistsEl.textContent = next.desc ? shorten(next.desc, 120) : '';
      }
    }
    var detailsEl = desktop.querySelector('.mfp-details');
    if (detailsEl) {
      var parts = [];
      if (next.dateLabel) parts.push('<span>' + escapeHtml(next.dateLabel) + '</span>');
      if (next.time) parts.push('<span>' + escapeHtml(next.time) + '</span>');
      if (next.venue) parts.push('<span>' + escapeHtml(next.venue) + '</span>');
      detailsEl.innerHTML = parts.join('');
    }
    var ctaEl = desktop.querySelector('.mfp-cta');
    if (ctaEl) ctaEl.textContent = ctaLabel;
    var img = desktop.querySelector('.mfp-img');
    if (img && next.img) {
      img.setAttribute('src', next.img);
      img.setAttribute('alt', cleanTitle);
    }
  }

  if (mobile) {
    mobile.setAttribute('href', href);
    setText(mobile.querySelector('.label'), seriesLabel);
    var h3 = mobile.querySelector('h3');
    if (h3) h3.textContent = cleanTitle;
    var sub = mobile.querySelector('.sub');
    if (sub) {
      var subParts = [];
      if (next.dateLabel) subParts.push(next.dateLabel);
      if (next.venue) subParts.push(next.venue);
      sub.textContent = subParts.join(' • ');
    }
    var cta = mobile.querySelector('.cta');
    if (cta) cta.textContent = ctaLabel;
  }

  function setText(el, text) {
    if (el) el.textContent = text;
  }
  function shorten(s, n) {
    if (!s) return '';
    if (s.length <= n) return s;
    return s.substring(0, n).replace(/\s+\S*$/, '') + '...';
  }
  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
})();
