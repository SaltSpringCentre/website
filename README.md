[pancha-karma-handbook 2.html](https://github.com/user-attachments/files/28154578/pancha-karma-handbook.2.html)[Uploading pancha-karma-handbook 2.htm<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sacred Union Renewal Retreat · Participant Handbook</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  :root {
    --gold: #C9A96E;
    --gold-light: #E8D5B0;
    --gold-pale: #F7F0E3;
    --forest: #3B5249;
    --forest-mid: #4E6B5E;
    --forest-light: #D4E2DC;
    --cream: #FAF7F2;
    --warm-white: #FFFDF9;
    --ink: #2C2A25;
    --ink-soft: #5A5650;
    --border: #D9CCBA;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Jost', sans-serif;
    background: var(--cream);
    color: var(--ink);
    font-size: 15px;
    line-height: 1.75;
  }

  @media print {
    body { background: white; font-size: 13px; }
    .page-break { page-break-before: always; }
    .no-print { display: none; }
    section { page-break-inside: avoid; }
  }

  /* ── COVER ── */
  .cover {
    background: var(--forest);
    color: var(--gold-pale);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 60px 40px;
    position: relative;
    overflow: hidden;
  }

  .cover::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 20% 80%, rgba(201,169,110,0.15) 0%, transparent 55%),
      radial-gradient(ellipse at 80% 20%, rgba(201,169,110,0.10) 0%, transparent 50%);
  }

  .mandala-ring {
    width: 300px;
    height: 300px;
    border: 1px solid rgba(201,169,110,0.3);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 36px;
    position: relative;
  }
  .mandala-ring::before {
    content: '';
    position: absolute;
    inset: 16px;
    border: 1px solid rgba(201,169,110,0.5);
    border-radius: 50%;
  }
  .mandala-ring::after {
    content: '';
    position: absolute;
    inset: 32px;
    border: 1px solid rgba(201,169,110,0.2);
    border-radius: 50%;
  }

  .cover-eyebrow {
    font-family: 'Jost', sans-serif;
    font-weight: 300;
    font-size: 10px;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 18px;
    position: relative;
    z-index: 1;
  }

  .cover h1 {
    font-family: 'Cormorant Garamond', serif;
    font-size: 62px;
    font-weight: 300;
    line-height: 1.1;
    color: var(--gold-pale);
    letter-spacing: 0.02em;
    margin-bottom: 12px;
    position: relative;
    z-index: 1;
  }

  .cover h1 em {
    font-style: italic;
    color: var(--gold);
  }

  .cover-subtitle {
    font-family: 'Cormorant Garamond', serif;
    font-size: 19px;
    font-weight: 300;
    font-style: italic;
    color: var(--gold-light);
    margin-bottom: 44px;
    position: relative;
    z-index: 1;
  }

  .cover-rule {
    width: 120px;
    height: 1px;
    background: linear-gradient(to right, transparent, var(--gold), transparent);
    margin: 0 auto 44px;
    position: relative;
    z-index: 1;
  }

  .cover-meta {
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--gold-light);
    opacity: 0.75;
    position: relative;
    z-index: 1;
    line-height: 2.4;
  }

  .cover-org {
    font-family: 'Cormorant Garamond', serif;
    font-size: 17px;
    font-style: italic;
    color: var(--gold);
    margin-top: 14px;
    position: relative;
    z-index: 1;
    letter-spacing: 0.05em;
  }

  /* ── LAYOUT ── */
  .chapter {
    padding: 72px 40px 56px;
    max-width: 820px;
    margin: 0 auto;
  }

  .chapter-number {
    font-size: 10px;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: var(--gold);
    display: block;
    margin-bottom: 10px;
    font-weight: 500;
  }

  .chapter h2 {
    font-family: 'Cormorant Garamond', serif;
    font-size: 40px;
    font-weight: 300;
    line-height: 1.15;
    color: var(--forest);
    margin-bottom: 22px;
  }

  .chapter h2 em {
    font-style: italic;
    color: var(--gold);
  }

  .chapter-intro {
    font-size: 16px;
    color: var(--ink-soft);
    line-height: 1.85;
    border-left: 2px solid var(--gold-light);
    padding-left: 24px;
    margin-bottom: 48px;
  }

  /* ── DIVIDERS ── */
  .section-rule {
    display: flex;
    align-items: center;
    gap: 16px;
    margin: 48px 0 32px;
  }
  .section-rule::before, .section-rule::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }
  .section-rule span {
    font-family: 'Cormorant Garamond', serif;
    font-size: 17px;
    color: var(--gold);
    font-style: italic;
    white-space: nowrap;
  }

  .full-divider {
    border: none;
    border-top: 1px solid var(--border);
    margin: 0;
  }

  h3.section-head {
    font-family: 'Cormorant Garamond', serif;
    font-size: 25px;
    font-weight: 400;
    color: var(--forest);
    margin-bottom: 12px;
  }

  h4.sub-head {
    font-size: 10px;
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: var(--gold);
    font-weight: 500;
    margin: 26px 0 10px;
  }

  p { margin-bottom: 14px; color: var(--ink-soft); }

  /* ── CALLOUTS ── */
  .callout {
    background: var(--forest);
    color: var(--gold-pale);
    border-radius: 4px;
    padding: 26px 30px;
    margin: 28px 0;
  }
  .callout p { color: var(--gold-light); margin-bottom: 8px; }
  .callout p:last-child { margin-bottom: 0; }
  .callout strong { color: var(--gold); }

  .callout-light {
    background: var(--gold-pale);
    border: 1px solid var(--gold-light);
    border-radius: 4px;
    padding: 22px 26px;
    margin: 24px 0;
  }
  .callout-light p { color: var(--ink); margin-bottom: 6px; }
  .callout-light p:last-child { margin-bottom: 0; }

  /* ── RECIPE CARD ── */
  .recipe-card {
    background: var(--warm-white);
    border: 1px solid var(--border);
    border-top: 3px solid var(--gold);
    padding: 26px 30px;
    margin: 26px 0;
    border-radius: 0 0 4px 4px;
  }
  .recipe-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 21px;
    color: var(--forest);
    margin-bottom: 14px;
  }
  .recipe-cols {
    display: grid;
    grid-template-columns: 1fr 1.4fr;
    gap: 26px;
  }
  @media (max-width: 600px) { .recipe-cols { grid-template-columns: 1fr; } }

  /* ── SCHEDULE TABLE ── */
  .schedule-grid {
    display: grid;
    grid-template-columns: 110px 1fr;
    gap: 0;
    border: 1px solid var(--border);
    border-radius: 4px;
    overflow: hidden;
    margin: 20px 0;
  }
  .schedule-grid .cell {
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
    font-size: 14px;
  }
  .schedule-grid .cell.time {
    background: var(--forest);
    color: var(--gold);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.06em;
    display: flex;
    align-items: center;
  }
  .schedule-grid .cell.activity {
    background: var(--warm-white);
    color: var(--ink);
  }
  .schedule-grid .cell:last-child,
  .schedule-grid .cell:nth-last-child(2) { border-bottom: none; }

  /* ── GHEE TABLE ── */
  .ghee-table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
  }
  .ghee-table th {
    background: var(--forest);
    color: var(--gold);
    font-size: 10px;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    padding: 12px 18px;
    text-align: left;
    font-weight: 400;
  }
  .ghee-table td {
    padding: 11px 18px;
    border-bottom: 1px solid var(--border);
    font-size: 14px;
    color: var(--ink);
    background: var(--warm-white);
  }
  .ghee-table tr:last-child td { border-bottom: none; }
  .ghee-table td:first-child { font-weight: 500; color: var(--forest); }

  /* ── DATES BAND ── */
  .dates-band {
    background: var(--gold-pale);
    border: 1px solid var(--gold-light);
    border-left: 4px solid var(--gold);
    padding: 24px 30px;
    margin: 28px 0;
    border-radius: 0 4px 4px 0;
  }
  .dates-band h4 { color: var(--forest); font-size: 13px; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 10px; }
  .dates-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 12px;
  }
  .dates-item { font-size: 14px; color: var(--ink); }
  .dates-item strong { display: block; font-size: 16px; color: var(--forest); font-family: 'Cormorant Garamond', serif; }

  /* ── BIO CARD ── */
  .bio-card {
    display: grid;
    grid-template-columns: 180px 1fr;
    gap: 34px;
    background: var(--warm-white);
    border: 1px solid var(--border);
    padding: 34px;
    border-radius: 4px;
    margin: 26px 0;
    align-items: start;
  }
  @media (max-width: 600px) { .bio-card { grid-template-columns: 1fr; } }

  .bio-portrait {
    width: 180px;
    height: 220px;
    background: var(--forest-light);
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 8px;
    color: var(--forest-mid);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    text-align: center;
    padding: 16px;
    flex-shrink: 0;
  }

  .bio-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 27px;
    font-weight: 400;
    color: var(--forest);
    margin-bottom: 3px;
  }
  .bio-aka {
    font-family: 'Cormorant Garamond', serif;
    font-size: 16px;
    font-style: italic;
    color: var(--gold);
    margin-bottom: 3px;
  }
  .bio-title {
    font-size: 10px;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: var(--forest-mid);
    font-weight: 500;
    margin-bottom: 16px;
  }
  .bio-body p { font-size: 14px; line-height: 1.82; margin-bottom: 10px; }
  .bio-creds {
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid var(--border);
  }
  .bio-creds h5 {
    font-size: 10px;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 8px;
    font-weight: 500;
  }
  .bio-creds ul { list-style: none; }
  .bio-creds li {
    font-size: 13px;
    color: var(--ink-soft);
    padding: 3px 0 3px 18px;
    position: relative;
    line-height: 1.5;
  }
  .bio-creds li::before {
    content: '◇';
    position: absolute;
    left: 0;
    color: var(--gold);
    font-size: 9px;
    top: 6px;
  }

  /* ── TREATMENT GRID ── */
  .treatment-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin: 20px 0;
  }
  @media (max-width: 600px) { .treatment-grid { grid-template-columns: 1fr; } }

  .treatment-item {
    background: var(--warm-white);
    border: 1px solid var(--border);
    padding: 18px 20px;
    border-radius: 4px;
  }
  .treatment-item h4 {
    font-family: 'Cormorant Garamond', serif;
    font-size: 18px;
    color: var(--forest);
    margin-bottom: 5px;
  }
  .treatment-item p { font-size: 13px; color: var(--ink-soft); margin: 0; line-height: 1.65; }

  /* ── LISTS ── */
  ul.styled {
    list-style: none;
    margin: 10px 0 16px;
  }
  ul.styled li {
    padding: 5px 0 5px 22px;
    position: relative;
    font-size: 14px;
    color: var(--ink-soft);
    border-bottom: 1px solid rgba(217,204,186,0.35);
  }
  ul.styled li:last-child { border-bottom: none; }
  ul.styled li::before {
    content: '◇';
    position: absolute;
    left: 0;
    color: var(--gold);
    font-size: 9px;
    top: 9px;
  }

  ul.avoid {
    list-style: none;
    margin: 10px 0 16px;
  }
  ul.avoid li {
    padding: 4px 0 4px 22px;
    position: relative;
    font-size: 14px;
    color: var(--ink-soft);
  }
  ul.avoid li::before {
    content: '×';
    position: absolute;
    left: 0;
    color: #A85454;
    font-weight: 700;
    font-size: 13px;
  }

  /* ── FEE ── */
  .fee-band {
    background: var(--forest);
    color: var(--gold-pale);
    padding: 44px 40px;
    text-align: center;
    border-radius: 4px;
    margin: 30px 0;
  }
  .fee-amount {
    font-family: 'Cormorant Garamond', serif;
    font-size: 68px;
    font-weight: 300;
    color: var(--gold);
    line-height: 1;
    margin-bottom: 6px;
  }
  .fee-label {
    font-size: 11px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--gold-light);
    margin-bottom: 26px;
  }
  .fee-includes {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 28px;
    text-align: left;
    max-width: 520px;
    margin: 0 auto;
  }
  .fee-item {
    font-size: 13px;
    color: var(--gold-light);
    padding-left: 16px;
    position: relative;
  }
  .fee-item::before {
    content: '—';
    position: absolute;
    left: 0;
    color: var(--gold);
  }

  /* ── CONTACT FORM ── */
  .form-wrap {
    background: var(--warm-white);
    border: 1px solid var(--border);
    border-top: 3px solid var(--gold);
    padding: 36px 40px;
    border-radius: 0 0 4px 4px;
    margin: 28px 0;
  }
  .form-wrap h3 {
    font-family: 'Cormorant Garamond', serif;
    font-size: 26px;
    color: var(--forest);
    margin-bottom: 6px;
  }
  .form-wrap .form-note {
    font-size: 13px;
    color: var(--ink-soft);
    margin-bottom: 26px;
    font-style: italic;
  }
  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }
  @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
  .form-group { display: flex; flex-direction: column; gap: 6px; }
  .form-group.full { grid-column: 1 / -1; }
  .form-group label {
    font-size: 10px;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: var(--forest-mid);
    font-weight: 500;
  }
  .form-group input,
  .form-group select,
  .form-group textarea {
    border: 1px solid var(--border);
    border-radius: 3px;
    padding: 10px 14px;
    font-family: 'Jost', sans-serif;
    font-size: 14px;
    color: var(--ink);
    background: var(--cream);
    outline: none;
    transition: border-color 0.2s;
  }
  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus { border-color: var(--gold); }
  .form-group textarea { resize: vertical; min-height: 90px; }
  .form-submit {
    display: inline-block;
    background: var(--forest);
    color: var(--gold-pale);
    border: none;
    padding: 14px 36px;
    font-family: 'Jost', sans-serif;
    font-size: 11px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    cursor: pointer;
    border-radius: 2px;
    margin-top: 8px;
    transition: background 0.2s;
  }
  .form-submit:hover { background: var(--forest-mid); }
  .form-email-note {
    font-size: 12px;
    color: var(--ink-soft);
    margin-top: 14px;
    font-style: italic;
  }

  /* ── HEALING NOTE ── */
  .healing-note {
    background: linear-gradient(135deg, var(--gold-pale), #EFE8D6);
    border: 1px solid var(--gold-light);
    border-left: 4px solid var(--gold);
    padding: 20px 24px;
    margin: 24px 0;
    border-radius: 0 4px 4px 0;
  }
  .healing-note p {
    color: var(--ink);
    font-style: italic;
    margin-bottom: 0;
    font-size: 14px;
    font-family: 'Cormorant Garamond', serif;
    font-size: 17px;
    line-height: 1.65;
  }

  .intention-box {
    border: 1px dashed var(--gold);
    padding: 28px;
    margin: 22px 0;
    min-height: 90px;
    border-radius: 4px;
  }
  .intention-box p {
    font-family: 'Cormorant Garamond', serif;
    font-style: italic;
    font-size: 15px;
    color: var(--gold);
    text-align: center;
    opacity: 0.65;
  }

  /* ── PAGE BAND ── */
  .page-band {
    background: var(--forest-light);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    padding: 13px 40px;
    max-width: 820px;
    margin: 0 auto;
  }
  .page-band p {
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--forest-mid);
    font-weight: 500;
    margin: 0;
  }

  /* ── BACK COVER ── */
  .back-cover {
    background: var(--forest);
    color: var(--gold-pale);
    padding: 80px 40px;
    text-align: center;
  }
  .back-cover h2 {
    font-family: 'Cormorant Garamond', serif;
    font-size: 34px;
    font-weight: 300;
    color: var(--gold-light);
    margin-bottom: 20px;
    font-style: italic;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }
  .back-cover p {
    color: var(--gold-light);
    opacity: 0.75;
    font-size: 14px;
    max-width: 480px;
    margin: 0 auto 10px;
  }
  .back-cover .contact-block {
    margin-top: 40px;
    font-size: 12px;
    letter-spacing: 0.18em;
    color: var(--gold);
    line-height: 2.2;
  }
</style>
</head>
<body>

<!-- ═══════════════════ COVER -->
<div class="cover">
  <div class="mandala-ring">
    <svg width="110" height="110" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="55" cy="22" rx="7" ry="20" fill="none" stroke="#C9A96E" stroke-width="1"/>
      <ellipse cx="55" cy="22" rx="7" ry="20" fill="none" stroke="#C9A96E" stroke-width="1" transform="rotate(45 55 55)"/>
      <ellipse cx="55" cy="22" rx="7" ry="20" fill="none" stroke="#C9A96E" stroke-width="1" transform="rotate(90 55 55)"/>
      <ellipse cx="55" cy="22" rx="7" ry="20" fill="none" stroke="#C9A96E" stroke-width="1" transform="rotate(135 55 55)"/>
      <ellipse cx="55" cy="22" rx="7" ry="20" fill="none" stroke="#C9A96E" stroke-width="1" transform="rotate(180 55 55)"/>
      <ellipse cx="55" cy="22" rx="7" ry="20" fill="none" stroke="#C9A96E" stroke-width="1" transform="rotate(225 55 55)"/>
      <ellipse cx="55" cy="22" rx="7" ry="20" fill="none" stroke="#C9A96E" stroke-width="1" transform="rotate(270 55 55)"/>
      <ellipse cx="55" cy="22" rx="7" ry="20" fill="none" stroke="#C9A96E" stroke-width="1" transform="rotate(315 55 55)"/>
      <circle cx="55" cy="55" r="11" fill="none" stroke="#C9A96E" stroke-width="1.5"/>
      <circle cx="55" cy="55" r="4" fill="#C9A96E" opacity="0.55"/>
    </svg>
  </div>

  <p class="cover-eyebrow">Sacred Shakti · Ayurveda Bliss · Mount Madonna Center</p>
  <h1>Sacred Union<br><em>Renewal Retreat</em></h1>
  <p class="cover-subtitle">A Five-Day Pancha Karma Journey for Couples</p>
  <div class="cover-rule"></div>
  <p class="cover-meta">
    Participant Handbook<br>
    Mount Madonna Center · Watsonville, California<br>
    January 2027 · $875 per person per day
  </p>
  <p class="cover-org">Mayanā Lisboa &amp; Myrica Morningstar</p>
</div>

<hr class="full-divider">

<!-- ═══════════════════ CHAPTER 1: WHAT IS PK -->
<div class="page-band"><p>Chapter One · Understanding Pancha Karma</p></div>

<div class="chapter">
  <span class="chapter-number">Chapter One</span>
  <h2>What Is <em>Pancha Karma?</em></h2>
  <p class="chapter-intro">
    Pancha Karma — Sanskrit for "five actions" — is Ayurveda's most comprehensive system of purification and rejuvenation. The Sacred Union Renewal Retreat brings this ancient healing tradition to couples — two people cleansing, renewing, and deepening their connection together, supported at every step.
  </p>

  <h3 class="section-head">The Ayurvedic Perspective</h3>
  <p>Ayurveda teaches that strong digestive fire — called <em>Agni</em> — is the cornerstone of health. When Agni is functioning well, the body produces healthy tissues, eliminates waste efficiently, and generates <em>Ojas</em>: the refined essence behind clear perception, physical resilience, and a strong immune system.</p>
  <p>When Agni weakens — through accumulated stress, poor diet, irregular lifestyle, or environmental load — digestion becomes incomplete. The residue left behind is called <em>Ama</em>: a sticky, congesting substance that settles in the channels of the body and obstructs the natural flow of energy and nourishment. Ayurveda views this buildup as the root of most imbalance and chronic illness.</p>
  <p>Pancha Karma is specifically designed to draw Ama out of the tissues and escort it through the body's natural pathways of elimination — safely, systematically, and thoroughly.</p>

  <div class="healing-note">
    <p>Pancha Karma creates the conditions for the body and mind to settle into a profound stillness — one in which deep tissue cleansing and the release of long-held emotional tensions become possible.</p>
  </div>

  <div class="section-rule"><span>How the Program Works</span></div>

  <p>Your five-day program is built around <strong>five primary cleansing methods</strong>, supported by a carefully chosen selection of <strong>Complementary Ayurvedic Therapies</strong>. The complementary therapies are not add-ons — they are integral to the process, selected specifically for your constitution and health picture as assessed through your Ayurvedic Consultation.</p>

  <div class="callout-light">
    <p><strong>Your program is individualized.</strong> Before treatments begin, you will receive a thorough Ayurvedic Consultation to assess your unique body-mind constitution (<em>prakriti</em>), current imbalances (<em>vikriti</em>), digestive strength, and health priorities. This assessment shapes every aspect of your care — which therapies are used, in what sequence, and with which herbal preparations.</p>
  </div>

  <h3 class="section-head">The Five Primary Cleansing Methods</h3>
  <p>Pancha Karma draws on five classical actions to systematically move Ama out of the body: oleation (internal and external), heat therapy, purgation, nasal cleansing, and colon therapy. These are delivered through a range of classical treatments, some or all of which may be part of your program:</p>

  <div class="treatment-grid">
    <div class="treatment-item">
      <h4>Abhyanga</h4>
      <p>A warm herbal oil massage applied with intention and rhythm. It loosens toxins from the tissues, deeply nourishes the nervous system, and prepares the body to release.</p>
    </div>
    <div class="treatment-item">
      <h4>Shirodhara</h4>
      <p>A continuous stream of warm herbalized oil flows over the forehead in a slow, pendular motion — stilling the mind, regulating the nervous system, and inviting profound inner quiet.</p>
    </div>
    <div class="treatment-item">
      <h4>Swedana</h4>
      <p>An individualized herbal steam bath that opens the channels and draws toxins to the surface of the skin for elimination — while keeping the head and heart cool and comfortable.</p>
    </div>
    <div class="treatment-item">
      <h4>Nasya</h4>
      <p>Medicated oil or herbal preparations administered through the nasal passages to clear the sinuses, support the central nervous system, and address deep-seated respiratory patterns.</p>
    </div>
    <div class="treatment-item">
      <h4>Basti</h4>
      <p>A herbal enema preparation that draws accumulated Ama from the colon — considered one of the most powerful and transformative treatments in the classical Pancha Karma repertoire.</p>
    </div>
    <div class="treatment-item">
      <h4>Garshana</h4>
      <p>Dry lymphatic brushing with natural fibers that enlivens circulation, removes surface impurities, and opens the skin to receive subsequent oil treatments more deeply.</p>
    </div>
    <div class="treatment-item">
      <h4>Udvartana</h4>
      <p>A firm herbal paste massage that exfoliates the skin, stimulates lymphatic flow, and helps to metabolize stagnant tissue — leaving skin luminous and the body lighter.</p>
    </div>
    <div class="treatment-item">
      <h4>Pinda Swedana</h4>
      <p>Warm pouches of rice cooked in herbs and milk are pressed rhythmically into the joints and tissues — simultaneously nourishing and deeply releasing.</p>
    </div>
  </div>

  <div class="section-rule"><span>Complementary Ayurvedic Therapies</span></div>

  <p>Woven throughout your five days are additional supportive practices chosen to enhance the effectiveness of the cleansing and rejuvenation process. These therapies work with your body's own healing intelligence — deepening the detox, supporting your nervous system, and tending to overall well-being.</p>

  <ul class="styled">
    <li><strong>Aromatherapy</strong> — therapeutic use of carefully selected essential oils to support each phase of treatment</li>
    <li><strong>Sacred Vedic Chants</strong> — sound vibrations drawn from ancient tradition that create a healing resonance in the treatment space</li>
    <li><strong>Two organic Ayurvedic meals daily</strong> — freshly prepared, seasonally appropriate, and aligned with your constitution</li>
    <li><strong>Digestive teas</strong> — herbal preparations served throughout the day to support Agni and ease elimination</li>
    <li><strong>Daily health intake</strong> — brief check-ins with your practitioner each day to track your progress and adjust your care as needed</li>
  </ul>

  <div class="section-rule"><span>The Healing Response</span></div>

  <p>As stored toxins move out of the tissues and into circulation for elimination, it is entirely normal to notice changes on all levels — physical, emotional, and mental. You may experience fatigue, mild headache, changes in digestion, unexpected emotions, or vivid dreams. These responses are signs that the process is working.</p>
  <p>Your practitioners will be present each day to support you through whatever arises. You are held throughout this process — you do not need to navigate it alone.</p>
</div>

<hr class="full-divider">

<!-- ═══════════════════ CHAPTER 2: BEFORE -->
<div class="page-break"></div>
<div class="page-band"><p>Chapter Two · Before You Arrive — Purvakarma Preparation</p></div>

<div class="chapter">
  <span class="chapter-number">Chapter Two</span>
  <h2>Before You <em>Arrive</em></h2>
  <p class="chapter-intro">
    The week before your retreat is called <em>Purvakarma</em> — the preparatory phase. These practices are not optional formalities; they prime your tissues to release, your digestion to open, and your mind to soften. Arriving well-prepared significantly deepens the work of the five days.
  </p>

  <h3 class="section-head">Setting Your Intention</h3>
  <p>Choose a quiet moment to create a small, dedicated space in your home for the preparation week — a candle, a flower, something meaningful. Let it anchor your attention inward. Consider what you are ready to release: a physical burden, an old pattern, an emotion that has overstayed its welcome.</p>

  <div class="intention-box">
    <p>Write your intention here — the quality or shift you are inviting through this cleanse.</p>
  </div>

  <p>During the preparation week, practice conserving your energy. Minimize unnecessary social activity and screen time. Begin turning attention inward, even before you arrive.</p>

  <div class="section-rule"><span>Dietary Preparation</span></div>

  <h4 class="sub-head">Every Morning</h4>
  <ul class="styled">
    <li>Rise around 6:00 am and drink a mug of hot water with fresh lemon juice before anything else</li>
    <li>Scrape your tongue and rinse your eyes as part of your morning hygiene</li>
    <li>Practice gentle movement, breathing exercises, or seated meditation</li>
  </ul>

  <h4 class="sub-head">Nourishing Foods to Favour</h4>
  <ul class="styled">
    <li>Kitchari — the classical Ayurvedic mono-diet dish (recipe below); eat it as your primary food</li>
    <li>Warm vegetable soups, broths, and steamed dishes simply prepared</li>
    <li>Beet Apple Cilantro Salad for liver and gallbladder support (recipe below)</li>
    <li>Freshly cooked meals only — warmth aids digestion and the preparation process</li>
  </ul>

  <h4 class="sub-head">What to Set Aside This Week</h4>
  <ul class="avoid">
    <li>Dairy and wheat products</li>
    <li>Red meat, processed foods, and packaged snacks</li>
    <li>Cold food, iced drinks, and refrigerated leftovers</li>
    <li>Alcohol, caffeine, and recreational substances</li>
    <li>Oils in cooking (beyond the ghee protocol below)</li>
  </ul>

  <div class="recipe-card">
    <p class="recipe-title">Kitchari — The Cleansing Staple</p>
    <div class="recipe-cols">
      <div>
        <h4 class="sub-head">Ingredients</h4>
        <ul class="styled">
          <li>½ cup split mung beans (or red lentils)</li>
          <li>½ cup white basmati rice</li>
          <li>1–2 tsp ghee or coconut oil</li>
          <li>1 tsp cumin seeds</li>
          <li>1 tsp coriander seeds</li>
          <li>1 tsp turmeric</li>
          <li>1-inch fresh ginger, minced</li>
          <li>6 cups water · salt to taste</li>
          <li>1–2 cups vegetables (optional)</li>
        </ul>
      </div>
      <div>
        <h4 class="sub-head">Method</h4>
        <p>Rinse the mung beans and rice well. Warm the ghee in a heavy pot, then add the seeds, turmeric, and ginger — let them open for about a minute. Add the beans, rice, and water. Bring to a boil, then reduce to a gentle simmer for 30–40 minutes until everything is soft and porridge-like. Stir in vegetables for the final 10 minutes. Season with salt and serve warm.</p>
      </div>
    </div>
  </div>

  <div class="recipe-card">
    <p class="recipe-title">Beet Apple Cilantro Salad — Liver Support</p>
    <div class="recipe-cols">
      <div>
        <h4 class="sub-head">Ingredients</h4>
        <ul class="styled">
          <li>1 medium beet, grated raw</li>
          <li>1 apple, finely diced</li>
          <li>1 tbsp fresh cilantro, chopped</li>
          <li>1 tbsp fresh lemon juice</li>
          <li>A pinch of sea salt</li>
        </ul>
      </div>
      <div>
        <h4 class="sub-head">Why This Salad</h4>
        <p>Beet supports bile flow in the liver and gallbladder, thinning and moving it so that fat-soluble toxins can be carried out more easily. Apple adds gentle fibre. Cilantro is a mild chelator. Together they make an effective and enjoyable pre-cleanse liver tonic. Eat a small portion daily during your preparation week.</p>
      </div>
    </div>
  </div>

  <div class="section-rule"><span>Internal Oleation — Five Days of Ghee</span></div>

  <p>Starting on Day 1 of your preparation week, you will take increasing doses of organic ghee each morning before eating. This practice — called <em>Snehana</em> — works from the inside out: the oil penetrates into the fat-soluble layers of the body's tissues, softening and mobilizing toxins that have been stored there, often for years. It simultaneously stimulates the liver and prepares the whole system for the purge to follow.</p>

  <div class="callout-light">
    <p><strong>If ghee is not suitable for you</strong> (due to high cholesterol or other reasons), substitute with cold-pressed flax oil, hemp oil, sesame oil, or coconut oil. Let your practitioner know in advance.</p>
  </div>

  <table class="ghee-table">
    <thead>
      <tr>
        <th>Day</th>
        <th>Morning Dose — on an empty stomach</th>
        <th>Tips</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>Day 1</td><td>1 teaspoon melted ghee</td><td>Take before anything else, then wait 1 hour before eating</td></tr>
      <tr><td>Day 2</td><td>2 teaspoons melted ghee</td><td>Follow each dose with a cup of hot ginger tea</td></tr>
      <tr><td>Day 3</td><td>3 teaspoons melted ghee</td><td>You may split into two portions with a short pause between</td></tr>
      <tr><td>Day 4</td><td>4 teaspoons melted ghee</td><td>You can stir ghee into tea with lemon and a pinch of salt</td></tr>
      <tr><td>Day 5</td><td>6 teaspoons melted ghee</td><td>Expect oily stools and noticeably softer skin by this point</td></tr>
    </tbody>
  </table>

  <p style="font-size:13px; color:var(--ink-soft); font-style:italic;">If you have strong digestion, you may convert teaspoons to tablespoons. A natural aversion to the ghee by Day 4 or 5 is a good sign — it indicates the tissues are adequately saturated.</p>

  <div class="section-rule"><span>Virechana — The Preparatory Purge</span></div>

  <h3 class="section-head">The Night of Day 5</h3>
  <p>On the evening following your final dose of ghee, you will perform a gentle but thorough Virechana — a classical purgation that clears the small intestine, liver, and gallbladder of accumulated Ama. This is a threshold moment in the Purvakarma process.</p>

  <h4 class="sub-head">Preparing Your Evening</h4>
  <ul class="styled">
    <li>Eat your final meal by 6:30 pm — make it warm, well-spiced, and include onions and garlic to kindle digestive fire</li>
    <li>Light a candle. Sit quietly. Reflect on what you are ready to release — not only physically, but emotionally and mentally</li>
  </ul>

  <div class="callout">
    <p><strong>The Castor Oil Mixture</strong></p>
    <p>At 9:00 pm, shake together <strong>2–3 tablespoons of castor oil</strong> and <strong>¼ cup of fresh orange juice</strong> in a small jar. Drink immediately — pinching your nostrils reduces the taste considerably. Follow with another ¼ cup of orange juice. Go directly to sleep.</p>
  </div>

  <h4 class="sub-head">Through the Night and Next Morning</h4>
  <ul class="styled">
    <li>You will be wakened during the night by the urge to use the bathroom — this is expected</li>
    <li>Drink a cup of warm water after each visit to replace fluids and support the movement</li>
    <li>Several bowel movements will occur over the coming hours; the later ones may be clear liquid — this is a sign of a thorough cleanse</li>
    <li>Rest fully the following day. Eat only Kitchari, steamed vegetables, and cleansing tea. This is not a day for activity or obligations.</li>
  </ul>

  <div class="section-rule"><span>Reintroducing Food After the Purge</span></div>

  <h3 class="section-head">Reintroducing Food</h3>
  <p>After Virechana, your digestive system is in a sensitized, open, and newly clean state. Begin with liquids and progress with patience. Eat only in response to genuine hunger — not the clock.</p>

  <div class="recipe-card">
    <p class="recipe-title">Kanji — Porridge for Rekindling Digestion</p>
    <div class="recipe-cols">
      <div>
        <h4 class="sub-head">Ingredients</h4>
        <ul class="styled">
          <li>¾ cup white basmati rice (or millet or quinoa)</li>
          <li>6 cups water</li>
          <li>A 1-inch piece of fresh ginger</li>
          <li>Cinnamon and cardamom to taste</li>
          <li>A little honey, if desired</li>
        </ul>
      </div>
      <div>
        <h4 class="sub-head">Method</h4>
        <p>Cook the grain in the water until it is very soft and breaking apart. Blend half of it with the cooking liquid and ginger until smooth and creamy. Season with your chosen spices and enough additional hot water to make a loose, drinkable consistency. Make a second batch with the remaining rice. Sip throughout the day as hunger guides you.</p>
        <p style="font-style:italic; font-size:13px;">For a savory version: use cumin, coriander, turmeric, ginger, and salt instead of sweet spices.</p>
      </div>
    </div>
  </div>

  <h4 class="sub-head">Gradual Food Progression</h4>
  <ul class="styled">
    <li><strong>Purge day:</strong> Liquids only — Kanji, warm water, herbal and digestive teas</li>
    <li><strong>Day 1 after:</strong> Kanji, thin rice soup, warm vegetable broth</li>
    <li><strong>Day 2 after:</strong> Kitchari, steamed vegetables, simple lentil soup</li>
    <li><strong>Days 3–4 after:</strong> Continue Kitchari; begin reintroducing other whole, warm foods slowly</li>
    <li><strong>For 1–2 weeks after:</strong> Avoid raw food, cold food, heavy proteins, processed foods, and alcohol</li>
  </ul>

  <div class="section-rule"><span>Daily Teas & Supplements</span></div>

  <h4 class="sub-head">Blood-Cleansing Tea (2–3 cups daily)</h4>
  <p>Choose any combination of: dandelion root, burdock root, red clover blossom, ginger, turmeric, or licorice root. Roasted dandelion root tea is widely available. Avoid any blends containing laxative herbs during this phase.</p>

  <h4 class="sub-head">Herbal Digestive Tea (throughout the day)</h4>
  <p>Simmer half a teaspoon each of cumin, coriander, and fennel seeds in a quart of water for 15 minutes. Strain and sip warm throughout the day to keep digestion clear and supported.</p>

  <h4 class="sub-head">Triphala (before bed each evening)</h4>
  <p>Dissolve half a teaspoon of Triphala powder in half a cup of warm water and drink before sleep. This gentle, time-tested formula supports overnight elimination and tones the digestive tract.</p>
</div>

<hr class="full-divider">

<!-- ═══════════════════ CHAPTER 3: DURING -->
<div class="page-break"></div>
<div class="page-band"><p>Chapter Three · Your Five Days at Mount Madonna Center</p></div>

<div class="chapter">
  <span class="chapter-number">Chapter Three</span>
  <h2>Your Five Days <em>Together</em></h2>
  <p class="chapter-intro">
    You and your partner will be fully provided for throughout your five days at Mount Madonna Center. Meals, teas, treatments, practitioner support, and herbal preparations are all included. Your only responsibility is to arrive together, open, and ready to receive.
  </p>

  <div class="dates-band">
    <h4>Program Dates — 2027</h4>
    <div class="dates-row">
      <div class="dates-item"><strong>Session One</strong>January 4, 5, 6, 7 & 8</div>
      <div class="dates-item"><strong>Session Two</strong>January 11, 12, 13, 14 & 15</div>
    </div>
    <div class="dates-row">
      <div class="dates-item"><strong>Arrival</strong>Sunday evening before your session begins</div>
      <div class="dates-item"><strong>Departure</strong>Sunday, following the close of your session</div>
    </div>
    <p style="font-size:13px; color:var(--ink-soft); margin:0;">Location: <strong>Mount Madonna Center</strong> · Watsonville, California</p>
  </div>

  <h3 class="section-head">What Your Day Looks Like</h3>
  <p>Each day unfolds at a gentle, nourishing pace. You will have approximately 2–3 hours of hands-on treatments, with the rest of the day devoted to rest, reflection, meals, and integration. There is no rushing here.</p>

  <div class="schedule-grid">
    <div class="cell time">~6:00 am</div>
    <div class="cell activity">Rise gently. Hot water with lemon. Tongue scraping, eye rinsing, morning hygiene.</div>

    <div class="cell time">6:30 am</div>
    <div class="cell activity">Daily ghee dose on an empty stomach, followed by hot ginger tea.</div>

    <div class="cell time">7:00 am</div>
    <div class="cell activity">Oil pulling. Gentle yoga, pranayama, or seated meditation.</div>

    <div class="cell time">8:00 am</div>
    <div class="cell activity">Breakfast — when genuinely hungry (at least 1 hour after ghee). Warm Kitchari or light Ayurvedic preparation.</div>

    <div class="cell time">Morning</div>
    <div class="cell activity"><strong>Clients 1 & 2:</strong> Daily health intake with your practitioner. Abhyanga warm oil massage. Complementary Ayurvedic therapies as prescribed for your constitution.</div>

    <div class="cell time">Midday</div>
    <div class="cell activity">Two organic Ayurvedic meals provided. Digestive teas served throughout. Quiet time, journaling, walking in nature, or simply resting throughout the day is encouraged.</div>

    <div class="cell time">Afternoon</div>
    <div class="cell activity"><strong>Clients 3 & 4:</strong> Daily health intake with your practitioner. Abhyanga warm oil massage. Complementary Ayurvedic therapies as prescribed for your constitution.</div>

    <div class="cell time">By 6:00 pm</div>
    <div class="cell activity">Dinner — light, warm, and easy to digest. Aromatherapy and Sacred Vedic Chants woven into the evening rhythm.</div>

    <div class="cell time">Evening</div>
    <div class="cell activity">Gentle yoga or a warm bath. Triphala before bed. No screens. Sleep by 9:30–10 pm to support overnight elimination and tissue repair.</div>
  </div>

  <div class="section-rule"><span>What to Bring</span></div>

  <ul class="styled">
    <li>Comfortable, loose clothing — older pieces you don't mind receiving oil; dark colours are practical</li>
    <li>A warm hat or scarf to cover your head after oil treatments</li>
    <li>A personal journal for intentions, reflections, and notes from your practitioners</li>
    <li>Anything that helps you rest deeply — a favourite blanket, warm socks, an eye pillow</li>
    <li>An open heart and a willingness to slow down</li>
  </ul>

  <div class="callout">
    <p><strong>Please leave behind</strong> strenuous exercise, alcohol, caffeine, cold food and drinks, and unnecessary digital engagement for the duration of your stay. These pull energy outward; your healing requires energy to move inward and downward through the body's channels.</p>
  </div>

  <div class="section-rule"><span>Shared Healing</span></div>

  <p>One of the gifts of undertaking Pancha Karma together is that you do not navigate it alone. As toxins release and emotions surface — grief, tenderness, unexpected joy — your partner is beside you. What might feel vulnerable in isolation becomes an act of intimacy and trust when shared.</p>
  <p>Your practitioners understand this dimension deeply. The retreat space is held for both of you — as individuals and as a couple. If either of you feels overwhelmed at any point, support is always close.</p>

  <div class="healing-note">
    <p>Two people, one journey. The intelligence of your bodies knows exactly what to release, and in what order. Your work is simply to show up — together — and trust what unfolds.</p>
  </div>
</div>

<hr class="full-divider">

<!-- ═══════════════════ CHAPTER 4: AFTER -->
<div class="page-break"></div>
<div class="page-band"><p>Chapter Four · After the Cleanse — Samsarjana Krama & Rasayana</p></div>

<div class="chapter">
  <span class="chapter-number">Chapter Four</span>
  <h2>After the Cleanse — <em>Rasayana</em></h2>
  <p class="chapter-intro">
    <em>Samsarjana Krama</em> — the graduated return to food — begins the moment the purge is complete. What follows is <em>Rasayana</em>: the conscious phase of rebuilding. Together, these two practices ensure that the benefits of your cleanse are not only preserved, but deepened.
  </p>

  <p>Your pre-departure and at-home recommendations will be given to you personally by your practitioners before you leave Mount Madonna Center. The guidance below provides a general map for the weeks ahead.</p>

  <div class="section-rule"><span>Rasayana — Conscious Rejuvenation</span></div>

  <h3 class="section-head">Post-Pancha Karma: The Rebuilding Phase</h3>
  <p>Once the cleansing work is complete, Ayurveda calls us into <em>Rasayana</em> — the art of conscious rebuilding. The channels of the body have been cleared; now they are ready to receive deep nourishment. This phase is what solidifies and extends the benefits of everything you have done. Approach it with the same care and intention you brought to the cleanse itself.</p>

  <div class="callout-light">
    <p><strong>Set your intention.</strong> Begin this phase by consciously deciding to invest in your own vitality. The cleanse has created an opening — Rasayana is how you fill it with something new: greater strength, clarity, and ease of being.</p>
  </div>

  <h4 class="sub-head">1 · Return to Food Gently</h4>
  <p>Following the food progression from Chapter Two, move gradually back toward a fuller diet. Avoid sugar, processed foods, and anything heavy or stimulating. Prioritize warmth, simplicity, and ease of digestion in everything you eat.</p>

  <h4 class="sub-head">2 · Favour Ojas-Building Foods</h4>
  <p><em>Ojas</em> — the refined essence of vitality — is replenished through specific foods. Make these the foundation of your meals for the weeks following your retreat:</p>
  <ul class="styled">
    <li>Dates, organic ghee, almonds, sesame seeds, raw honey</li>
    <li>Warm nut or seed milks, creamy soups, and Kitchari</li>
    <li>Coconut, avocado, yams, and high-quality oils — coconut, olive, sesame, flax</li>
    <li>Toasted seeds and nuts added to warm dishes for sustained nourishment</li>
  </ul>

  <h4 class="sub-head">3 · Add Superfoods Thoughtfully</h4>
  <ul class="styled">
    <li>Maca, spirulina, bee pollen, royal jelly</li>
    <li>Elderberries, blueberries, blackberries</li>
    <li>Moringa — a particularly potent source of minerals and plant protein</li>
  </ul>

  <h4 class="sub-head">4 · Ayurvedic Rejuvenative Herbs (2–4 weeks)</h4>
  <p>Rasayana herbs rebuild tissue, strengthen immunity, and restore deep vitality after cleansing. Consider incorporating one or more of the following, ideally with guidance from your practitioner:</p>
  <ul class="styled">
    <li>Shatavari, Ashwagandha, Brahmi</li>
    <li>Licorice root, Guduchi, Amlaki, Bala, Shilajit</li>
    <li>Chyavanprash — a traditional Ayurvedic herbal jam taken daily as a tonic</li>
  </ul>

  <h4 class="sub-head">5 · Rest as Medicine</h4>
  <p>Sleep between 10:00 pm and 6:00 am for optimal tissue repair and Ojas production. A short rest after lunch is entirely appropriate, particularly for those with a Vata constitution. This is not laziness — this is how the body rebuilds.</p>

  <h4 class="sub-head">6 · Meditation & Conscious Breathing</h4>
  <p>Daily seated practice — even 15 to 20 minutes — helps integrate the cleanse, stabilize the nervous system, and cultivate the inner stillness in which Ojas naturally accumulates.</p>

  <h4 class="sub-head">7 · Gentle Movement Only</h4>
  <p>Light yoga, slow walking, and easy stretching are ideal. Save vigorous exercise for two to three weeks post-program, when your tissues have had time to consolidate what they have received.</p>

  <h4 class="sub-head">8 · Time in Nature</h4>
  <p>Fresh air, natural light, and unhurried time outdoors replenish <em>Prana</em> — the life force that animates everything. Even a daily walk among trees makes a measurable difference in the quality of your recovery.</p>

  <h4 class="sub-head">9 · Self-Care as Practice</h4>
  <p>Continue your daily Abhyanga (self-oil massage) at home. Touch yourself with the same gentleness and care you received during your treatments. Tend to yourself as you would someone you love.</p>

  <div class="section-rule"><span>Daily Rhythm — Week Three (Rasayana Phase)</span></div>

  <div class="schedule-grid">
    <div class="cell time">6:00 am</div>
    <div class="cell activity">Rise with the sun. A moment of gratitude before getting up. Empty bladder and bowels, wash face, rinse eyes.</div>

    <div class="cell time">Morning</div>
    <div class="cell activity">Warm water. Oil pulling. Clean tongue and teeth. Gentle yoga, pranayama, and seated meditation.</div>

    <div class="cell time">Before breakfast</div>
    <div class="cell activity">Rejuvenative herbal tonic (as recommended by your practitioner). Warm spiced nut or seed milk.</div>

    <div class="cell time">Mid-morning</div>
    <div class="cell activity">Stay hydrated with warm water throughout the day.</div>

    <div class="cell time">Before lunch</div>
    <div class="cell activity">A thin slice of fresh ginger with a pinch of salt, taken 30 minutes before eating, to kindle digestive fire.</div>

    <div class="cell time">Noon</div>
    <div class="cell activity">Your main nourishing meal of the day. Avoid drinking fluids for an hour after eating to allow full digestion.</div>

    <div class="cell time">Afternoon</div>
    <div class="cell activity">A gentle walk after lunch. Rest if needed. Spend time in nature when possible.</div>

    <div class="cell time">6:00 pm</div>
    <div class="cell activity">A light, warm dinner. Wind down deliberately — meditation, a bath, gentle yoga, or quiet spiritual reading.</div>

    <div class="cell time">Before bed</div>
    <div class="cell activity">Triphala in warm water. In bed by 10:00 pm for optimal overnight repair.</div>
  </div>

  <div class="callout">
    <p><strong>Be patient with yourself during this phase.</strong> There is no rushing the rebuilding process. The cleanse has done its work — Rasayana asks only that you show up with consistency, warmth, and care. Avoid anything that feels overstimulating or depleting, and continue to prioritize nourishment over productivity for as long as you can.</p>
    <p style="margin-top:10px;"><strong>Pancha Karma is most potent as a seasonal practice.</strong> Consider planning your next program within 3–6 months to continue and deepen what has been set in motion here.</p>
  </div>
</div>

<hr class="full-divider">

<!-- ═══════════════════ CHAPTER 5: PRACTITIONERS -->
<div class="page-break"></div>
<div class="page-band"><p>Chapter Five · Your Practitioners</p></div>

<div class="chapter">
  <span class="chapter-number">Chapter Five</span>
  <h2>Meet Your <em>Practitioners</em></h2>
  <p class="chapter-intro">
    You are held by two practitioners who bring between them more than five decades of devoted study, practice, and teaching. Their work together is an expression of a shared love for these ancient sciences and the people they serve.
  </p>

  <!-- MAYA FIRST -->
  <div class="bio-card">
    <div class="bio-portrait" style="padding:0; overflow:hidden; background:none;">
      <img src="data:image/jpeg;base64,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" alt="Mayanā Clarissa Lisboa" style="width:180px; height:220px; object-fit:cover; object-position:center top; border-radius:2px; display:block;">
    </div>
    <div class="bio-body">
      <p class="bio-name">Mayanā Clarissa Lisboa</p>
      <p class="bio-aka">known as Maya</p>
      <p class="bio-title">Founder, Sacred Shakti · Certified Ayurvedic Practitioner</p>

      <p>For over thirty years, Maya has accompanied people on journeys toward greater balance, vitality, and sense of purpose — drawing from Yoga, Ayurveda, and the full spectrum of her life as a practitioner, mother, and lifelong student.</p>

      <p>Her path began in Brazil, where dance first revealed to her the inherent intelligence of body and spirit. That door opened unexpectedly into a deep spiritual unfolding, which carried her to California and into the presence of Baba Hari Dass — a silent monk and yogi who became one of the most formative influences of her life.</p>

      <p>Maya lived and served for many years at Mount Madonna Center — immersed in community, self-study, and the teachings of Classical Ashtanga Yoga and Ayurveda as transmitted by Baba Hari Dass. This community continues to be her spiritual home, and is the setting for this very program.</p>

      <p>As a Pancha Karma specialist, Maya brings professional training, deep practical experience, refined intuition, and the ever-evolving wisdom that comes from motherhood, community life, and sustained spiritual practice. She holds space with care, humility, and reverence for what she calls "the sacred in each one of us."</p>

      <p style="font-style:italic; color:var(--gold); font-family:'Cormorant Garamond',serif; font-size:16px; margin-top:4px;">"It is a blessing to give back to this great unfolding — offering what I can to those seeking support on their path of healing and self-discovery."</p>

      <div class="bio-creds">
        <h5>Training & Credentials</h5>
        <ul>
          <li>Certified Ayurvedic Practitioner — National Ayurvedic Medical Association (NAMA)</li>
          <li>500-hour Certified Yoga Teacher — Classical Ashtanga Yoga, Mount Madonna Institute</li>
          <li>Certified Massage Practitioner — California Massage Therapy Council (CAMTC)</li>
          <li>Specialized Pancha Karma training with Dr. Vasant Lad, Dr. Sarita Shrestha, Dr. Suhas Kshirsagar, Dr. Manisha Kshirsagar, and Dr. Hari Pallathery</li>
          <li>MBA in Sustainable Business — Maharishi International University (Transcendental Meditation-based curriculum)</li>
          <li>BA in Latin American & Latino Studies, Minor in Indigenous Studies — UC Santa Cruz</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- MYRICA SECOND -->
  <div class="bio-card">
    <div class="bio-portrait" style="padding:0; overflow:hidden; background:none;">
      <img src="data:image/jpeg;base64,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" alt="Myrica Morningstar" style="width:180px; height:220px; object-fit:cover; object-position:center top; border-radius:2px; display:block;">
    </div>
    <div class="bio-body">
      <p class="bio-name">Myrica Morningstar</p>
      <p class="bio-title">Ayurvedic Practitioner · Panchakarma Facilitator · Ayurveda Bliss</p>

      <p>Myrica has been studying, practicing, and teaching Ayurveda since 1994 — a journey spanning more than thirty years and touching the lives of countless individuals and couples seeking transformation. She is known for the warmth and presence she brings to every session, and for her ability to make this ancient science feel genuinely alive.</p>

      <p>Her primary area of focus has been facilitating Pancha Karma retreats, with much of her work centered in the Hawaiian Islands. She is a graduate of the California College of Ayurveda and the American Institute for Ayurvedic Studies, and has drawn deep inspiration from the teachings of Dr. Deepak Chopra, Dr. Vasant Lad, Dr. John Douillard, Bri. Maya Tiwari, and Dr. Marc Halpern.</p>

      <p>Beyond her clinical work, Myrica is a teacher, author, gardener, and whole-food artisan. She is a mother of four and grandmother of seven. She is an ordained minister through the SHES network (International Assembly of Spiritual Healers and Earth Stewards), and her ministry — in its simplest form — is love, gratitude, and the beauty of a life lived close to nature.</p>

      <p style="font-style:italic; color:var(--gold); font-family:'Cormorant Garamond',serif; font-size:16px; margin-top:4px;">"Ayurveda is not a set of rules. It is a living conversation with the intelligence of nature — and with the intelligence that you are."</p>

      <div class="bio-creds">
        <h5>Training & Credentials</h5>
        <ul>
          <li>Graduate — California College of Ayurveda</li>
          <li>Graduate — American Institute for Ayurvedic Studies</li>
          <li>Over 30 years of practice and teaching in Ayurveda and Pancha Karma</li>
          <li>Ordained Minister — SHES (International Assembly of Spiritual Healers and Earth Stewards)</li>
        </ul>
      </div>
    </div>
  </div>
</div>

<hr class="full-divider">

<!-- ═══════════════════ BACK COVER -->
<div class="back-cover">
  <div class="cover-rule" style="margin-bottom:36px;"></div>
  <h2>Thank you for choosing to walk this path of healing together. We look forward to holding this sacred space for you both.</h2>
  <p style="margin-top:20px;">To reserve your space or ask any questions, reach Maya directly:</p>
  <div class="contact-block">
    <div>maya@mountmadonna.org</div>
    <div style="margin-top:10px; opacity:0.6; font-size:11px; letter-spacing:0.12em;">SACRED SHAKTI · SACREDSHAKTI.COM</div>
    <div style="opacity:0.6; font-size:11px; letter-spacing:0.12em;">AYURVEDA BLISS · AYURVEDABLISS.ORG</div>
    <div style="opacity:0.6; font-size:11px; letter-spacing:0.12em; margin-top:6px;">MOUNT MADONNA CENTER · WATSONVILLE, CALIFORNIA</div>
  </div>
  <div class="cover-rule" style="margin-top:44px; margin-bottom:0;"></div>
</div>

</body>
</html>
l…]()
