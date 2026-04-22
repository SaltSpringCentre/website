// Populates the homepage "next event" banner with the next upcoming
// retreat or concert from EVENTS (events-data.js). Weekly classes and
// community gatherings are not in EVENTS, so they're excluded naturally.
// If no future event is found, the banner is hidden.
//
// Banner image lookup (priority order):
//   1. Event has bannerImage: '<exact photo caption>' -> use that photo
//      from sscy-photos.json (matches the `cap` field).
//   2. Otherwise, pick deterministically (hashed by event.id) from the
//      photos in sscy-photos.json whose category matches the event.type
//      per BANNER_CATEGORIES.
//   3. If sscy-photos.json is missing or no photo matches, fall back to
//      event.img so the banner never breaks.

var BANNER_CATEGORIES = {
  concert: ['Music for Peace'],
  retreat: ['ACYR / Annual Retreat', 'Nature & Nurture Series', 'Classes / Programs']
};

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
    if (img) {
      if (next.img) {
        img.setAttribute('src', next.img);
        img.setAttribute('alt', cleanTitle);
      }
      upgradeBannerImage(img, next, cleanTitle);
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

  function upgradeBannerImage(imgEl, event, altText) {
    fetch('sscy-photos.json', { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (photos) {
        if (!photos) return;

        // Flatten all photos across all categories into a single list.
        var all = [];
        for (var cat in photos) {
          if (!photos.hasOwnProperty(cat)) continue;
          var arr = photos[cat] || [];
          for (var i = 0; i < arr.length; i++) {
            if (arr[i] && arr[i].src) all.push(arr[i]);
          }
        }

        // 1. Explicit override by caption match
        if (event.bannerImage) {
          for (var j = 0; j < all.length; j++) {
            if (all[j].cap === event.bannerImage) {
              imgEl.setAttribute('src', all[j].src);
              imgEl.setAttribute('alt', all[j].cap || altText);
              return;
            }
          }
        }

        // 2. Banner-flagged photos matching event.type (or any)
        var flagged = all.filter(function (p) {
          return p.banner === true || p.banner === event.type;
        });
        if (flagged.length) {
          var pick = flagged[hashStr(event.id || '') % flagged.length];
          imgEl.setAttribute('src', pick.src);
          imgEl.setAttribute('alt', pick.cap || altText);
          return;
        }

        // 3. Fallback: BANNER_CATEGORIES pool (legacy, used until photos
        //    get flagged manually). Deterministic pick by event.id hash.
        var cats = BANNER_CATEGORIES[event.type];
        if (!cats) return;
        var catPool = [];
        for (var k = 0; k < cats.length; k++) {
          var items = photos[cats[k]] || [];
          for (var m = 0; m < items.length; m++) {
            if (items[m] && items[m].src) catPool.push(items[m]);
          }
        }
        if (!catPool.length) return;
        var chosen = catPool[hashStr(event.id || '') % catPool.length];
        imgEl.setAttribute('src', chosen.src);
        imgEl.setAttribute('alt', chosen.cap || altText);
      })
      .catch(function () { /* keep event.img fallback */ });
  }

  function hashStr(s) {
    var h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return Math.abs(h);
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
