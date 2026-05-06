// SSCY Centre-Run program tagging + sorting helper
// Whitelist of programs that the Centre runs itself (vs visiting/rental).
// Centre-run programs sort first and get a gold "CENTRE PROGRAM" pill badge.
window.SSCY_CentreRun = {
  patterns: [
    /yoga\s*(&|and)\s*wellness\s*weekend/i,
    /yssi|yoga\s*study\s*(&|and)\s*service/i,
    /annual\s*community\s*yoga\s*retreat|acyr/i,
    /going\s*deeper/i
  ],
  isCentre: function(name) {
    return this.patterns.some(function(rx) { return rx.test(name || ''); });
  },
  // sortFn: centre-run first, then by start_date
  sortFn: function(a, b) {
    var aC = this.isCentre(a.name), bC = this.isCentre(b.name);
    if (aC !== bC) return aC ? -1 : 1;
    return (a.start_date || '').localeCompare(b.start_date || '');
  },
  // Returns gold pill HTML string (or empty)
  badgeHTML: function(name) {
    if (!this.isCentre(name)) return '';
    return '<span class="centre-badge" style="display:inline-block;background:#c9a84c;color:#2c2c2c;font-family:\'Cinzel\',serif;font-size:0.58rem;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;padding:3px 9px;border-radius:50px;margin-bottom:8px;">Centre Program</span>';
  }
};
