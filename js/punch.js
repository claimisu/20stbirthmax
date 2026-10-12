/* =====================================================================
   punch.js — the PUNCH! CLUB section.
   Data and settings: js/punchConfig.js   ·   Styles: css/punch.css
   No libraries needed (plain DOM + SVG + requestAnimationFrame).

   Parts:  1 sprite (icons) · 2 state · 3 summary UI · 4 ingredient cards
           5 punch bowl (SVG + animation loop) · 6 contribution dialog
           7 saving (Google Apps Script / Google Form / preview) · 8 wiring
   ===================================================================== */
(function () {
  'use strict';
  var CFG = window.PUNCH_CONFIG, root = document.getElementById('punch');
  if (!CFG || !root) return;

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  var motionMQ = matchMedia('(prefers-reduced-motion: reduce)');
  var smallMQ = matchMedia('(max-width: 700px)');
  function reduced() { return motionMQ.matches; }

  /* ---------------------------------------------------------------
     1 · ICON SPRITE — every ingredient is a small hand-drawn SVG symbol
     --------------------------------------------------------------- */
  function sym(id, inner) { return '<symbol id="ic-' + id + '" viewBox="-32 -32 64 64">' + inner + '</symbol>'; }
  function citrus(rind, pith, pulp, line) {
    return '<circle r="30" fill="' + rind + '"/><circle r="26.5" fill="' + pith + '"/><circle r="24" fill="' + pulp + '"/>' +
      '<path d="M0-23V23M-23 0H23M-16.3-16.3L16.3 16.3M16.3-16.3L-16.3 16.3" stroke="' + line + '" stroke-width="2.4" stroke-linecap="round"/>' +
      '<circle r="3.2" fill="' + pith + '"/><circle r="30" fill="none" stroke="rgba(255,255,255,.28)"/>';
  }
  function star(n, R, r) {
    var pts = [], i, a;
    for (i = 0; i < n * 2; i++) { a = -Math.PI / 2 + i * Math.PI / n; var rr = i % 2 ? r : R; pts.push((Math.cos(a) * rr).toFixed(1) + ',' + (Math.sin(a) * rr).toFixed(1)); }
    return pts.join(' ');
  }
  var SYMBOLS = [
    sym('orange', citrus('#F28C1E', '#FFE9C4', '#FFA43C', '#FFE3B8')),
    sym('lemon', citrus('#E6BE1A', '#FFF7CF', '#F9DE4A', '#FFF7CF')),
    sym('lime', citrus('#5E9C25', '#EAF5C0', '#9CC945', '#EFF7CE')),
    sym('apple', '<circle r="28" fill="#F6EBC8" stroke="#C23A32" stroke-width="4"/><path d="M0-10L2.6-3.2 9.6-3 4.2 1.4 6.2 8.4 0 4.4-6.2 8.4-4.2 1.4-9.6-3-2.6-3.2Z" fill="#EBDDAE" stroke="#CDB57A"/><ellipse cx="-2.5" cy="-1" rx="1.6" ry="2.6" fill="#6B3A1D"/><ellipse cx="2.5" cy="-1" rx="1.6" ry="2.6" fill="#6B3A1D"/>'),
    sym('pineapple', '<path fill-rule="evenodd" d="M-29 0a29 29 0 1 0 58 0a29 29 0 1 0-58 0ZM-8 0a8 8 0 1 0 16 0a8 8 0 1 0-16 0Z" fill="#D9A21E"/><path fill-rule="evenodd" d="M-26 0a26 26 0 1 0 52 0a26 26 0 1 0-52 0ZM-8 0a8 8 0 1 0 16 0a8 8 0 1 0-16 0Z" fill="#F8D24B"/><path d="M0-24V-10M0 10V24M-24 0H-10M10 0H24M-17-17L-9-9M9 9L17 17M17-17L9-9M-9 9L-17 17" stroke="#E5B22A" stroke-width="2" stroke-linecap="round"/>'),
    sym('strawberry', '<path d="M0 27C-18 15-27 1-22-10-18-19-6-20 0-15 6-20 18-19 22-10 27 1 18 15 0 27Z" fill="#E53245"/><path d="M-14-6C-16 0-10 10-2 16" stroke="rgba(255,255,255,.3)" stroke-width="3" stroke-linecap="round" fill="none"/><g fill="#FFE08A"><ellipse cx="-9" cy="0" rx="1.2" ry="2"/><ellipse cx="0" cy="-2" rx="1.2" ry="2"/><ellipse cx="9" cy="0" rx="1.2" ry="2"/><ellipse cx="-5" cy="9" rx="1.2" ry="2"/><ellipse cx="5" cy="9" rx="1.2" ry="2"/><ellipse cx="0" cy="17" rx="1.2" ry="2"/></g><path d="M0-14L-10-24-4-15-13-12-3-11 0-4 3-11 13-13 5-16 10-24Z" fill="#4E9B3F"/>'),
    sym('grapes', '<path d="M0-26V-14" stroke="#4E7B2E" stroke-width="3" stroke-linecap="round"/><g fill="#7B3FA0"><circle cx="-11" cy="-4" r="10"/><circle cx="11" cy="-4" r="10"/><circle cx="0" cy="-10" r="10"/><circle cx="-6" cy="10" r="10"/><circle cx="8" cy="10" r="10"/><circle cx="0" cy="22" r="9"/></g><g fill="#fff" opacity=".35"><circle cx="-14" cy="-7" r="2.6"/><circle cx="8" cy="-7" r="2.6"/><circle cx="-3" cy="-13" r="2.6"/><circle cx="-9" cy="7" r="2.6"/><circle cx="5" cy="7" r="2.6"/></g>'),
    sym('gummy', '<g fill="currentColor"><circle cx="-9" cy="-20" r="5"/><circle cx="9" cy="-20" r="5"/><circle cy="-12" r="11"/><ellipse cy="8" rx="13" ry="15"/><ellipse cx="-16" cy="2" rx="5" ry="8" transform="rotate(25 -16 2)"/><ellipse cx="16" cy="2" rx="5" ry="8" transform="rotate(-25 16 2)"/><ellipse cx="-8" cy="22" rx="6" ry="8"/><ellipse cx="8" cy="22" rx="6" ry="8"/></g><ellipse cx="-4" cy="-15" rx="4" ry="2.6" fill="#fff" opacity=".42" transform="rotate(-25 -4 -15)"/><ellipse cx="-5" cy="4" rx="3.6" ry="7" fill="#fff" opacity=".28"/>'),
    sym('jelly', '<ellipse rx="24" ry="15" transform="rotate(-28)" fill="currentColor"/><g fill="#fff" opacity=".55"><circle cx="-10" cy="-4" r="1.4"/><circle cx="-2" cy="-9" r="1.4"/><circle cx="6" cy="-3" r="1.4"/><circle cx="-6" cy="5" r="1.4"/><circle cx="4" cy="7" r="1.4"/><circle cx="12" cy="-8" r="1.4"/></g><path d="M-14-10Q-4-18 8-14" stroke="#fff" stroke-opacity=".5" stroke-width="3" stroke-linecap="round" fill="none"/>'),
    sym('marshmallow', '<rect x="-19" y="-14" width="38" height="32" rx="9" fill="#F4DFC6"/><ellipse cy="-11" rx="19" ry="8" fill="#FFF8EE"/><path d="M-19 -11V17M19 -11V17" stroke="#E6CDB0" stroke-width="1"/><ellipse cx="-6" cy="-12" rx="7" ry="2.4" fill="#fff"/>'),
    sym('sour', '<path fill-rule="evenodd" d="M-27 0a27 27 0 1 0 54 0a27 27 0 1 0-54 0ZM-10 0a10 10 0 1 0 20 0a10 10 0 1 0-20 0Z" fill="currentColor"/><g fill="#fff" opacity=".7"><circle cx="-18" cy="-12" r="1.5"/><circle cx="-6" cy="-21" r="1.5"/><circle cx="8" cy="-20" r="1.5"/><circle cx="19" cy="-9" r="1.5"/><circle cx="20" cy="7" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="-7" cy="20" r="1.5"/><circle cx="-19" cy="9" r="1.5"/></g>'),
    sym('glass', '<path d="M-18-24H18L14 26Q0 30-14 26Z" fill="rgba(255,255,255,.1)" stroke="#F5E9CC" stroke-width="2.5" stroke-linejoin="round"/><path d="M-16.6-8H16.6L13.4 24Q0 27.6-13.4 24Z" fill="currentColor"/><path d="M-12-4V14" stroke="#fff" stroke-opacity=".4" stroke-width="3" stroke-linecap="round"/><path d="M6-30L11-12" stroke="#F5E9CC" stroke-width="3" stroke-linecap="round"/>'),
    sym('bottle', '<path d="M-7-30H7V-20C7-14 14-12 14-4V25Q14 30 9 30H-9Q-14 30-14 25V-4C-14-12-7-14-7-20Z" fill="rgba(255,255,255,.1)" stroke="#F5E9CC" stroke-width="2.5" stroke-linejoin="round"/><path d="M-12-2H12V25Q12 28 9 28H-9Q-12 28-12 25Z" fill="currentColor" opacity=".9"/><rect x="-12" y="6" width="24" height="10" fill="#F5E9CC"/><circle cx="-4" cy="-2" r="1.6" fill="#fff"/><circle cx="3" cy="-8" r="1.2" fill="#fff"/>'),
    sym('ice', '<rect x="-22" y="-22" width="44" height="44" rx="9" fill="#CBE6F3"/><rect x="-16" y="-16" width="20" height="20" rx="5" fill="#fff" opacity=".5"/><path d="M-22-6L-6-22M22 8L8 22" stroke="#fff" stroke-opacity=".7" stroke-width="2" stroke-linecap="round"/><rect x="-22" y="-22" width="44" height="44" rx="9" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.5"/>'),
    sym('mint', '<path d="M0 26C-21 15-21-14 0-27 21-14 21 15 0 26Z" fill="#3E9B52"/><path d="M0 24V-22M0 10L-10 1M0 1L10-8M0-9L-8-15" stroke="#2A7140" stroke-width="2" fill="none" stroke-linecap="round"/><g transform="rotate(62 0 4) translate(2 6) scale(.62)"><path d="M0 26C-21 15-21-14 0-27 21-14 21 15 0 26Z" fill="#53B566"/><path d="M0 24V-22" stroke="#2A7140" stroke-width="2.4" stroke-linecap="round"/></g>'),
    sym('starfruit', '<polygon points="' + star(5, 29, 17) + '" fill="#CFE04F" stroke="#CFE04F" stroke-width="6" stroke-linejoin="round"/><polygon points="' + star(5, 22, 12) + '" fill="#E7F08A" stroke="#E7F08A" stroke-width="3" stroke-linejoin="round"/><polygon points="' + star(5, 8, 4) + '" fill="#B7C93A"/>'),
    sym('mystery', '<circle r="28" fill="#C9A044"/><circle r="23" fill="none" stroke="#171715" stroke-width="2" stroke-dasharray="3 4"/><text y="11" text-anchor="middle" font-family="Archivo,Arial,sans-serif" font-weight="800" font-size="32" fill="#171715">?</text>'),
    sym('idea', '<path d="M0-28L6-7 28 0 6 7 0 28-6 7-28 0-6-7Z" fill="#FF8A32"/><path d="M0-14L3-3 14 0 3 3 0 14-3 3-14 0-3-3Z" fill="#FFE2A8"/><circle cx="21" cy="-21" r="3" fill="#C9A044"/><circle cx="-22" cy="20" r="2.4" fill="#C9A044"/>')
  ].join('');
  var spriteHost = el('div'); spriteHost.setAttribute('aria-hidden', 'true');
  spriteHost.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" focusable="false"><defs>' + SYMBOLS + '</defs></svg>';
  document.body.insertBefore(spriteHost, document.body.firstChild);

  var SVGNS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs) { var e = document.createElementNS(SVGNS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }
  function iconSvg(icon, color) {
    var s = svgEl('svg', { 'class': 'ic', 'aria-hidden': 'true', focusable: 'false' });
    var u = svgEl('use', { href: '#ic-' + icon }); if (color) u.style.color = color; s.appendChild(u); return s;
  }

  /* ---------------------------------------------------------------
     2 · STATE — the single source for every number on screen
     --------------------------------------------------------------- */
  var ORDER = [], ING = {};
  (CFG.categories || []).forEach(function (cat) {
    cat.items.forEach(function (it) { it.bowl = it.bowl || {}; it.category = cat.id; ING[it.id] = it; ORDER.push(it); });
  });
  var MODE = CFG.endpoint ? 'endpoint' : (CFG.formUrl ? 'form' : 'preview');
  var MAX_PER = Math.max(1, CFG.maxPerGuest || 3);
  var TARGET = Math.max(1, CFG.targetContributions || 1);
  var state = {
    base: {},        // claimed numbers typed into the config (or sample numbers)
    mine: {},        // what THIS visitor picked in this browser tab (not saved anywhere by itself)
    server: null,    // claimed numbers read from the Google Sheet (endpoint or published-CSV)
    serverFrom: '',  // 'sheet' (Apps Script, already includes this guest) or 'csv' (published sheet)
    loading: false,  // true while availability is being read from the sheet
    modeNote: '',    // message that replaces the default mode note (e.g. sheet unreachable)
    flash: {},       // brief success/failure highlight per ingredient
    name: ''
  };
  ORDER.forEach(function (ing) {
    state.base[ing.id] = Math.max(0, (CFG.sampleData && ing.sampleClaimed != null) ? ing.sampleClaimed : (ing.claimed || 0));
  });
  function mineOf(id) { return state.mine[id] || 0; }
  function claimedOf(id) {
    var ing = ING[id], n = state.server ? (state.server[id] || 0) + (state.serverFrom === 'csv' ? mineOf(id) : 0) : (state.base[id] || 0) + mineOf(id);
    return Math.max(0, Math.min(ing.portions, n));
  }
  function remainingOf(id) { return ING[id].portions - claimedOf(id); }
  function canTake(id) { return remainingOf(id) > 0 && mineOf(id) < MAX_PER; }
  function totals() {
    var claimed = 0, distinct = 0;
    ORDER.forEach(function (ing) { var c = claimedOf(ing.id); claimed += c; if (c > 0) distinct++; });
    return { claimed: claimed, distinct: distinct, left: Math.max(0, TARGET - claimed), ready: claimed >= TARGET };
  }

  /* ---------------------------------------------------------------
     3 · SUMMARY UI — counter, stats, progress bar, status, mode notes
     --------------------------------------------------------------- */
  var ui = {
    count: $('#punchCount'), stats: $('#punchStats'), bar: $('#punchBar'), status: $('#punchStatus'),
    mix: $('#punchMix'), sample: $('#punchSample'), mode: $('#punchMode'), fine: $('#punchFine'),
    mine: $('#punchMine'), hint: $('#punchHint'), grid: $('#punchGrid')
  };
  function renderSummary() {
    var t = totals();
    ui.count.innerHTML = '<b>' + pad(t.claimed) + '</b> / ' + pad(TARGET) + ' ingredients claimed' + (CFG.sampleData ? ' <em class="tag">Sample data</em>' : '');
    ui.stats.innerHTML = '';
    [['Guests', CFG.expectedGuests || 0], ['Contributions', t.claimed], ['Spots left', t.left]].forEach(function (s) {
      var d = el('div'); d.appendChild(el('dt', null, s[0])); d.appendChild(el('dd', null, pad(s[1]))); ui.stats.appendChild(d);
    });
    var pct = Math.min(100, Math.round(t.claimed / TARGET * 100));
    ui.bar.setAttribute('aria-valuenow', pct); ui.bar.setAttribute('aria-valuetext', t.claimed + ' of ' + TARGET + ' ingredients claimed');
    $('i', ui.bar).style.width = pct + '%';
    ui.status.textContent = t.ready ? 'The punch is ready.' : 'The mix is coming together...';
    ui.status.classList.toggle('is-ready', t.ready);
    ui.mix.textContent = pad(t.distinct) + ' different ingredient' + (t.distinct === 1 ? '' : 's') + ' in the mix';
    ui.sample.hidden = !CFG.sampleData;
  }
  function renderModeNotes() {
    var m = {
      preview: 'Preview mode: nothing you pick here is saved anywhere yet.',
      form: state.server ? 'Availability comes from our Google Sheet and can be a few minutes behind. Your pick goes through our Google Form: press Submit there to save it.' : 'Your pick goes through our Google Form. Press Submit there to save it.',
      endpoint: state.server ? 'Live from the party sheet. Picks are saved there.' : 'Picks are saved to the party sheet.'
    };
    ui.mode.textContent = state.modeNote || m[MODE];
    ui.mode.setAttribute('data-mode', MODE);
    ui.fine.textContent = MODE === 'endpoint'
      ? 'Availability is checked again when you confirm.'
      : (state.server ? 'Availability is read from the sheet when the page opens and can be a few minutes behind. Two guests can still pick the last portion at the same moment, and the host will sort it out.' : 'Availability is set by the host and is not live. Two guests can pick the last portion at the same moment, and the host will sort it out.');
  }
  function renderMine() {
    var ids = Object.keys(state.mine).filter(function (id) { return state.mine[id] > 0; });
    ui.mine.hidden = !ids.length; ui.mine.innerHTML = '';
    if (!ids.length) return;
    ui.mine.appendChild(el('span', 'punch__mineLabel', 'You are bringing'));
    ids.forEach(function (id) {
      var chip = el('span', 'chip'); chip.appendChild(el('span', null, ING[id].name + ' ×' + state.mine[id]));
      if (MODE !== 'endpoint') {
        var x = el('button', 'chip__x', '×'); x.type = 'button'; x.setAttribute('aria-label', 'Remove my ' + ING[id].name);
        x.addEventListener('click', function () { delete state.mine[id]; renderAll(); });
        chip.appendChild(x);
      }
      ui.mine.appendChild(chip);
    });
  }

  /* ---------------------------------------------------------------
     4 · INGREDIENT CARDS — built once, then updated in place
     --------------------------------------------------------------- */
  var cards = {};
  function buildGrid() {
    ui.grid.innerHTML = '';
    var n = 0;
    CFG.categories.forEach(function (cat) {
      n++;
      var group = el('section', 'pcat'); group.setAttribute('aria-labelledby', 'pcat-' + cat.id);
      var h = el('h4', 'pcat__title'); h.id = 'pcat-' + cat.id; h.appendChild(el('span', 'pcat__n', pad(n))); h.appendChild(document.createTextNode(cat.label));
      var list = el('div', 'pcat__list');
      cat.items.forEach(function (ing) {
        var card = el('article', 'icard'); card.setAttribute('data-id', ing.id);
        var art = el('div', 'icard__art'); art.appendChild(iconSvg(ing.icon, ing.color));
        var body = el('div', 'icard__body');
        body.appendChild(el('h5', 'icard__name', ing.name));
        body.appendChild(el('p', 'icard__desc', ing.desc || ''));
        var av = el('p', 'icard__avail'); av.appendChild(el('span', 'icard__availText')); av.appendChild(el('span', 'pips')); body.appendChild(av);
        body.appendChild(el('p', 'icard__badge'));
        var btn = el('button', 'pbtn pbtn--gold icard__btn'); btn.type = 'button';
        btn.addEventListener('click', function () { if (btn.getAttribute('aria-disabled') === 'true') return; openDialog(ing.id, btn); });
        card.appendChild(art); card.appendChild(body); card.appendChild(btn);
        list.appendChild(card); cards[ing.id] = card;
      });
      group.appendChild(h); group.appendChild(list); ui.grid.appendChild(group);
    });
  }
  function renderCards() {
    ORDER.forEach(function (ing) {
      var card = cards[ing.id], id = ing.id, rem = remainingOf(id), mine = mineOf(id), claimed = claimedOf(id);
      var st = state.loading ? 'loading' : (mine > 0 ? 'selected' : (rem <= 0 ? 'full' : 'available'));
      card.setAttribute('data-state', st);
      if (state.flash[id]) card.setAttribute('data-flash', state.flash[id]); else card.removeAttribute('data-flash');
      $('.icard__availText', card).textContent = 'Available: ' + rem + ' / ' + ing.portions;
      var pips = $('.pips', card); pips.innerHTML = '';
      var baseCount = claimed - Math.min(mine, claimed);
      for (var i = 0; i < ing.portions; i++) pips.appendChild(el('i', i < baseCount ? 'on' : (i < claimed ? 'mine' : '')));
      var badge = $('.icard__badge', card);
      badge.textContent = state.flash[id] === 'failed' ? 'Could not save. Try again.' : (mine > 0 ? 'You\u2019re bringing ×' + mine : '');
      badge.hidden = !badge.textContent;
      var btn = $('.icard__btn', card), label, off = false;
      if (state.loading) { label = 'Loading…'; off = true; }
      else if (rem <= 0 && mine === 0) { label = 'Fully claimed'; off = true; }
      else if (mine >= MAX_PER || rem <= 0) { label = 'Yours \u2713'; off = true; }
      else if (mine > 0) { label = 'Add one more'; }
      else { label = 'I\u2019ll bring this'; }
      btn.textContent = label; btn.setAttribute('aria-disabled', off ? 'true' : 'false');
      btn.classList.toggle('is-off', off);
      btn.setAttribute('aria-label', label + ': ' + ing.name);
    });
  }
  function flashCard(id, kind) {
    state.flash[id] = kind; renderCards();
    setTimeout(function () { delete state.flash[id]; renderCards(); }, 2600);
  }

  /* ---------------------------------------------------------------
     5 · THE PUNCH BOWL
     Layers (back to front): table shadow · glass foot · liquid body (+bubbles)
     · liquid surface with a rotating swirl · floating pieces · glass front.
     Everything except the glass moves independently; the swirl and the
     pieces are driven by one requestAnimationFrame loop that only runs while
     the bowl is on screen. With reduced motion the loop never starts.
     --------------------------------------------------------------- */
  var G = { W: 640, H: 540, CX: 320, RIMY: 150, RX: 250, RY: 66, BH: 300, IRX: 236, IBH: 274, BOTTOM: 450, RATIO: 0.27, BASE: 238, MAXRISE: 18 };
  function wIn(y) { var d = (y - G.RIMY) / G.IBH; return d >= 1 ? 0 : G.IRX * Math.sqrt(1 - d * d); }
  function halfEllipse(rx, bh, steps) {
    var d = '', i, a;
    for (i = 0; i <= steps; i++) { a = i / steps * Math.PI; d += (i ? 'L' : 'M') + (G.CX - rx * Math.cos(a)).toFixed(1) + ' ' + (G.RIMY + bh * Math.sin(a)).toFixed(1); }
    return d;
  }
  function glassShape() {
    var e = 'M' + (G.CX - G.RX) + ' ' + G.RIMY + 'A' + G.RX + ' ' + G.RY + ' 0 1 0 ' + (G.CX + G.RX) + ' ' + G.RIMY + 'A' + G.RX + ' ' + G.RY + ' 0 1 0 ' + (G.CX - G.RX) + ' ' + G.RIMY + 'Z';
    return halfEllipse(G.RX, G.BH, 64) + 'Z' + e;
  }
  var bowlHost = $('#punchBowl'), bowl = {};
  function buildBowl() {
    var svg = svgEl('svg', { viewBox: '0 0 ' + G.W + ' ' + G.H, 'class': 'bowl', 'aria-hidden': 'true', focusable: 'false' });
    var defs = svgEl('defs', {});
    defs.innerHTML =
      '<linearGradient id="pbLiq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF9F38"/><stop offset="1" stop-color="#E3680F"/></linearGradient>' +
      '<linearGradient id="pbGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F5E9CC" stop-opacity=".16"/><stop offset=".5" stop-color="#F5E9CC" stop-opacity=".02"/><stop offset="1" stop-color="#F5E9CC" stop-opacity=".1"/></linearGradient>' +
      '<radialGradient id="pbShadow"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
      '<clipPath id="pbIn"><path d="' + halfEllipse(G.IRX, G.IBH, 64) + 'Z"/><ellipse cx="' + G.CX + '" cy="' + G.RIMY + '" rx="' + G.IRX + '" ry="' + (G.RY - 4) + '"/></clipPath>' +
      '<clipPath id="pbLiqClip"><rect id="pbLiqRect" x="0" y="' + G.BASE + '" width="' + G.W + '" height="300"/></clipPath>' +
      '<clipPath id="pbSurfClip"><ellipse id="pbSurfClipE" cx="' + G.CX + '" cy="' + G.BASE + '" rx="200" ry="54"/></clipPath>';
    svg.appendChild(defs);
    svg.appendChild(svgEl('ellipse', { cx: G.CX, cy: 500, rx: 210, ry: 22, fill: 'url(#pbShadow)' }));
    // foot
    var foot = svgEl('g', { 'class': 'bowl__foot' });
    foot.appendChild(svgEl('path', { d: 'M296 444L288 488H352L344 444Z', fill: 'rgba(245,233,204,.1)', stroke: 'rgba(245,233,204,.45)', 'stroke-width': 2, 'stroke-linejoin': 'round' }));
    foot.appendChild(svgEl('ellipse', { cx: G.CX, cy: 490, rx: 118, ry: 17, fill: 'rgba(245,233,204,.1)', stroke: 'rgba(245,233,204,.45)', 'stroke-width': 2 }));
    svg.appendChild(foot);
    // back wall of the glass
    svg.appendChild(svgEl('path', { d: glassShape(), fill: 'rgba(245,233,204,.05)' }));
    var inner = svgEl('g', { 'clip-path': 'url(#pbIn)' });
    var liq = svgEl('g', { 'clip-path': 'url(#pbLiqClip)' });
    bowl.liqRect = svgEl('rect', { x: 0, y: G.BASE, width: G.W, height: 300, fill: 'url(#pbLiq)' });
    liq.appendChild(bowl.liqRect);
    bowl.bubbles = svgEl('g', { 'class': 'bowl__bubbles' }); liq.appendChild(bowl.bubbles);
    inner.appendChild(liq);
    bowl.surface = svgEl('ellipse', { cx: G.CX, cy: G.BASE, rx: 200, ry: 54, fill: '#FFB552' });
    inner.appendChild(bowl.surface);
    bowl.surfaceGlow = svgEl('ellipse', { cx: G.CX, cy: G.BASE, rx: 150, ry: 40, fill: 'rgba(255,236,190,.28)' });
    inner.appendChild(bowl.surfaceGlow);
    var swirlClip = svgEl('g', { 'clip-path': 'url(#pbSurfClip)' });
    bowl.swirl = svgEl('g', {});
    [[60, 'M60 0A60 60 0 0 1 0 60', 3], [105, 'M105 0A105 105 0 0 1 0 105', 4], [150, 'M150 0A150 150 0 0 1 0 150M-150 0A150 150 0 0 1 0-150', 5], [200, 'M200 0A200 200 0 0 1 0 200M-200 0A200 200 0 0 1 0-200', 6], [250, 'M250 0A250 250 0 0 1 0 250M-250 0A250 250 0 0 1 0-250', 7]].forEach(function (a) {
      bowl.swirl.appendChild(svgEl('path', { d: a[1], fill: 'none', stroke: 'rgba(255,244,214,.34)', 'stroke-width': a[2], 'stroke-linecap': 'round' }));
    });
    swirlClip.appendChild(bowl.swirl); inner.appendChild(swirlClip);
    bowl.ripples = svgEl('g', {}); inner.appendChild(bowl.ripples);
    bowl.items = svgEl('g', { 'class': 'bowl__items' }); inner.appendChild(bowl.items);
    svg.appendChild(inner);
    // glass front: tint, outline, cut-glass facets, rim, highlights
    var front = svgEl('g', { 'class': 'bowl__front', 'pointer-events': 'none' });
    front.appendChild(svgEl('path', { d: glassShape(), fill: 'url(#pbGlass)' }));
    var i, a, x, y, d = '';
    for (i = 0; i < 11; i++) {
      a = Math.PI * (0.08 + 0.84 * i / 10); x = G.CX - G.RX * 0.94 * Math.cos(a); y = G.RIMY + G.RY * 0.94 * Math.sin(a);
      d += 'M' + x.toFixed(1) + ' ' + y.toFixed(1) + 'Q' + (G.CX + (x - G.CX) * 0.62).toFixed(1) + ' ' + (y + 120).toFixed(1) + ' ' + (G.CX + (x - G.CX) * 0.22).toFixed(1) + ' ' + (G.BOTTOM - 22) + ' ';
    }
    front.appendChild(svgEl('path', { d: d, fill: 'none', stroke: 'rgba(245,233,204,.13)', 'stroke-width': 2, 'stroke-linecap': 'round' }));
    front.appendChild(svgEl('path', { d: halfEllipse(G.IRX, G.IBH, 64), fill: 'none', stroke: 'rgba(245,233,204,.22)', 'stroke-width': 1.5 }));
    front.appendChild(svgEl('path', { d: halfEllipse(G.RX, G.BH, 64), fill: 'none', stroke: 'rgba(245,233,204,.6)', 'stroke-width': 3 }));
    front.appendChild(svgEl('ellipse', { cx: G.CX, cy: G.RIMY, rx: G.RX, ry: G.RY, fill: 'none', stroke: 'rgba(245,233,204,.65)', 'stroke-width': 3 }));
    front.appendChild(svgEl('ellipse', { cx: G.CX, cy: G.RIMY, rx: G.IRX, ry: G.RY - 4, fill: 'none', stroke: 'rgba(245,233,204,.28)', 'stroke-width': 1.5 }));
    front.appendChild(svgEl('path', { d: 'M92 196C98 296 150 384 236 420', fill: 'none', stroke: 'rgba(255,255,255,.34)', 'stroke-width': 6, 'stroke-linecap': 'round' }));
    front.appendChild(svgEl('path', { d: 'M104 178C108 214 116 240 126 262', fill: 'none', stroke: 'rgba(255,255,255,.5)', 'stroke-width': 3, 'stroke-linecap': 'round' }));
    front.appendChild(svgEl('path', { d: 'M548 214C540 292 504 352 452 392', fill: 'none', stroke: 'rgba(255,255,255,.18)', 'stroke-width': 4, 'stroke-linecap': 'round' }));
    front.appendChild(svgEl('path', { d: 'M150 120Q320 84 490 120', fill: 'none', stroke: 'rgba(255,255,255,.28)', 'stroke-width': 3, 'stroke-linecap': 'round' }));
    svg.appendChild(front);
    bowlHost.innerHTML = ''; bowlHost.appendChild(svg); bowl.svg = svg;
  }

  var items = [], level = G.BASE, levelTarget = G.BASE, fizzCount = -1;
  var DECOR = [['orange', true, 54], ['lemon', true, 50], ['lime', true, 48], ['apple', true, 50], ['orange', true, 50], ['mint', true, 44], ['lemon', true, 46], ['lime', true, 44]];
  var PALETTE = { 'gummy-bears': ['#FF5D73', '#FFB627', '#3DDC84', '#FF8A32', '#B565FF'], jelly: ['#8E5BD9', '#FF5D9E', '#42C6FF'], 'sour-candy': ['#3DDC84', '#FFE14D', '#FF7A59'] };
  var seq = 0;
  function makeItem(icon, flat, size, key, color, immediate, opacity) {
    size = size * 1.4;
    var n = seq++, g = svgEl('g', {}), u = svgEl('use', { href: '#ic-' + icon, x: -size / 2, y: -size / 2, width: size, height: size });
    if (color) u.style.color = color;
    if (opacity) g.setAttribute('opacity', opacity);
    g.appendChild(u); bowl.items.appendChild(g);
    var it = {
      key: key, el: g, flat: flat, size: size, a: n * 2.399 + rnd(0, .6), f: 0.26 + 0.62 * ((n * 0.618) % 1),
      sp: rnd(0.55, 1.35) * (n % 2 ? 1 : 0.8), bobF: rnd(0.7, 1.3), ph: rnd(0, 6.28), rot: rnd(0, 360), spin: rnd(-9, 9) || 6,
      born: (immediate || reduced()) ? -1e9 : performance.now(), dying: 0, x: G.CX, y: level
    };
    items.push(it); return it;
  }
  function liveItems(key) { return items.filter(function (it) { return it.key === key && !it.dying; }); }
  function killItem(it) {
    if (reduced() || !running) { var i = items.indexOf(it); if (i > -1) { items.splice(i, 1); if (it.el.parentNode) it.el.parentNode.removeChild(it.el); } return; }
    it.dying = performance.now();
  }

  function syncBowl(immediate) {
    var cap = smallMQ.matches ? 15 : 30, decorN = smallMQ.matches ? 4 : DECOR.length;
    // decorative base pieces (always there, they are not guest contributions)
    var decor = liveItems('decor');
    while (decor.length < decorN) { var dd = DECOR[decor.length % DECOR.length]; decor.push(makeItem(dd[0], dd[1], dd[2], 'decor', null, true)); }
    while (decor.length > decorN) killItem(decor.pop());
    // pieces for claimed ingredients
    var want = [], total = 0;
    ORDER.forEach(function (ing) { var n = Math.round(claimedOf(ing.id) * (ing.bowl.perPortion || 0)); if (n > 0) { want.push([ing, n]); total += n; } else want.push([ing, 0]); });
    var room = Math.max(0, cap - decorN);
    if (total > room) want.forEach(function (w) { if (w[1] > 0) w[1] = Math.max(1, Math.floor(w[1] * room / total)); });
    want.forEach(function (w) {
      var ing = w[0], n = w[1], have = liveItems(ing.id), b = ing.bowl, pal = PALETTE[ing.id];
      while (have.length < n) {
        var c = pal ? pal[(have.length + seq) % pal.length] : ing.color;
        var it = makeItem(ing.icon, !!b.flat, b.size || 42, ing.id, c, immediate, ing.icon === 'ice' ? 0.82 : 0);
        have.push(it);
        if (!immediate && !reduced()) splash(it);
      }
      while (have.length > n) killItem(have.pop());
    });
    // drinks raise the liquid, sparkling water adds fizz
    var rise = 0, fizz = 0;
    ORDER.forEach(function (ing) { var c = claimedOf(ing.id); rise += c * (ing.bowl.rise || 0); fizz += c * (ing.bowl.fizz || 0); });
    levelTarget = G.BASE - Math.min(G.MAXRISE, rise);
    if (immediate || reduced()) level = levelTarget;
    setBubbles(Math.min(24, (smallMQ.matches ? 6 : 10) + fizz));
    bowlHost.setAttribute('aria-label', 'Punch bowl with ' + totals().distinct + ' different ingredients from guests, plus floating citrus and mint');
    if (reduced()) renderFrame(performance.now(), 0);
  }
  function setBubbles(n) {
    if (n === fizzCount) return; fizzCount = n; bowl.bubbles.innerHTML = '';
    for (var i = 0; i < n; i++) bowl.bubbles.appendChild(bubble(false));
  }
  function bubble(burst) {
    var c = svgEl('circle', { cx: rnd(G.CX - 170, G.CX + 170).toFixed(0), cy: rnd(370, 430).toFixed(0), r: rnd(burst ? 3.4 : 2.6, burst ? 7.5 : 6).toFixed(1), 'class': 'bub' + (burst ? ' bub--burst' : '') });
    c.style.setProperty('--rise', rnd(140, 215).toFixed(0) + 'px'); c.style.setProperty('--dx', rnd(-14, 14).toFixed(0) + 'px');
    c.style.animationDuration = (burst ? rnd(1.2, 2.4) : rnd(4, 8)).toFixed(2) + 's'; c.style.animationDelay = (burst ? rnd(0, .6) : rnd(0, 6)).toFixed(2) + 's';
    if (burst) c.addEventListener('animationend', function () { if (c.parentNode) c.parentNode.removeChild(c); });
    return c;
  }
  function ripple(x, y) {
    if (reduced()) return;
    var r = svgEl('ellipse', { cx: x.toFixed(0), cy: y.toFixed(0), rx: 4, ry: 1.2, 'class': 'rip' });
    r.addEventListener('animationend', function () { if (r.parentNode) r.parentNode.removeChild(r); });
    bowl.ripples.appendChild(r);
  }
  function splash(it) { var s = surfaceGeom(); ripple(s.cx + it.f * s.rx * .86 * Math.cos(it.a), s.cy + it.f * s.ry * .8 * Math.sin(it.a)); }

  function surfaceGeom() { var rx = wIn(level) - 3; return { cx: G.CX, cy: level, rx: rx, ry: rx * G.RATIO }; }
  var swirlAngle = 0, lastTs = 0, omegaIdle = 0.055, stir = { on: false, t0: 0, dur: 3600 }, lastSort = 0, nextRipple = 0, tAbs = 0;
  function easeOutBack(p) { var c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); }
  function renderFrame(now, dt) {
    var s, k, i, it, p, scale, x, y, depth, rot, sx, sy;
    level += (levelTarget - level) * Math.min(1, dt * 3.2) || 0;
    if (Math.abs(levelTarget - level) < .02) level = levelTarget;
    s = surfaceGeom();
    bowl.liqRect.setAttribute('y', level.toFixed(2)); $('#pbLiqRect').setAttribute('y', level.toFixed(2));
    ['surface', 'surfaceGlow'].forEach(function (n, j) {
      var f = j ? .75 : 1; bowl[n].setAttribute('cy', level.toFixed(2)); bowl[n].setAttribute('rx', (s.rx * f).toFixed(1)); bowl[n].setAttribute('ry', (s.ry * f).toFixed(1));
    });
    var sc = $('#pbSurfClipE'); sc.setAttribute('cy', level.toFixed(2)); sc.setAttribute('rx', s.rx.toFixed(1)); sc.setAttribute('ry', s.ry.toFixed(1));
    bowl.swirl.setAttribute('transform', 'translate(' + G.CX + ' ' + level.toFixed(2) + ') scale(1 ' + G.RATIO + ') rotate(' + (swirlAngle * 57.3).toFixed(1) + ')');
    for (i = items.length - 1; i >= 0; i--) {
      it = items[i]; scale = 1;
      if (it.dying) { p = Math.min(1, (now - it.dying) / 300); scale = 1 - p; if (p >= 1) { bowl.items.removeChild(it.el); items.splice(i, 1); continue; } }
      else if (now - it.born < 560) { p = Math.max(0, (now - it.born) / 560); scale = Math.max(0.001, easeOutBack(p)); }
      x = s.cx + it.f * s.rx * .86 * Math.cos(it.a); y = s.cy + it.f * s.ry * .8 * Math.sin(it.a) + Math.sin(tAbs * it.bobF + it.ph) * 2.2;
      depth = .84 + .26 * ((y - (s.cy - s.ry)) / (2 * s.ry));
      rot = it.flat ? it.rot + tAbs * it.spin : Math.sin(tAbs * .8 + it.ph) * 14;
      sx = scale * depth; sy = it.flat ? sx : sx;
      it.el.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')' + (it.flat ? ' scale(1 .52)' : '') + ' rotate(' + rot.toFixed(1) + ') scale(' + sx.toFixed(3) + ')');
      it.y = y;
    }
    if (now - lastSort > 600) {
      lastSort = now;
      items.slice().sort(function (a, b) { return a.y - b.y; }).forEach(function (q) { bowl.items.appendChild(q.el); });
    }
  }
  var raf = 0, running = false;
  function loop(now) {
    if (!running) return;
    var dt = Math.min(0.05, (now - (lastTs || now)) / 1000); lastTs = now;
    var boost = 0;
    if (stir.on) {
      var p = (now - stir.t0) / stir.dur;
      if (p >= 1) stir.on = false; else boost = 2.7 * Math.pow(1 - p, 2.2);
    }
    var omega = omegaIdle + boost;
    tAbs += dt; swirlAngle += omega * .9 * dt;
    for (var i = 0; i < items.length; i++) items[i].a += omega * items[i].sp * dt;
    if (now > nextRipple) { var s = surfaceGeom(); ripple(s.cx + rnd(-.6, .6) * s.rx, s.cy + rnd(-.6, .6) * s.ry); nextRipple = now + rnd(2600, 5200); }
    renderFrame(now, dt);
    raf = requestAnimationFrame(loop);
  }
  function startLoop() { if (running || reduced()) return; running = true; lastTs = 0; raf = requestAnimationFrame(loop); }
  function stopLoop() { running = false; cancelAnimationFrame(raf); }
  var onScreen = true;
  function updateLoop() { (onScreen && !document.hidden && !reduced()) ? startLoop() : stopLoop(); }

  var stirBtn = $('#punchStir');
  function stirPunch() {
    if (stir.on || stirBtn.disabled) return;
    stirBtn.disabled = true; stirBtn.setAttribute('aria-busy', 'true'); stirBtn.textContent = 'Stirring…';
    var done = function () { stir.on = false; stirBtn.disabled = false; stirBtn.removeAttribute('aria-busy'); stirBtn.textContent = 'Stir the punch!'; bowlHost.classList.remove('is-stirring'); };
    bowlHost.classList.add('is-stirring');
    if (reduced()) {      // no motion: one calm step and a brief glow instead of a spin
      items.forEach(function (it) { it.a += 1.1; }); swirlAngle += .7; renderFrame(performance.now(), 0);
      setTimeout(done, 700); return;
    }
    stir.on = true; stir.t0 = performance.now(); stir.dur = 3600;
    var n = smallMQ.matches ? 8 : 16; for (var i = 0; i < n; i++) bowl.bubbles.appendChild(bubble(true));
    setTimeout(done, stir.dur);
  }

  /* ---------------------------------------------------------------
     6 · CONTRIBUTION DIALOG
     --------------------------------------------------------------- */
  var dlg = $('#punchDialog'), form = $('#pdForm'), doneView = $('#pdDone');
  var f = { name: $('#pdName'), ing: $('#pdIngredient'), qty: $('#pdQty'), note: $('#pdNote'), submit: $('#pdSubmit'), fail: $('#pdFail') };
  var lastFocus = null, lastId = null, sending = false;
  var ERR = { pdName: 'pdNameErr', pdIngredient: 'pdIngErr', pdQty: 'pdQtyErr', pdNote: 'pdNoteErr' };
  function setErr(input, msg) {
    var p = document.getElementById(ERR[input.id]); if (p) p.textContent = msg || '';
    if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
  }
  function maxQty(id) { return Math.max(0, Math.min(MAX_PER - mineOf(id), remainingOf(id))); }
  function fillSelect(selectedId) {
    f.ing.innerHTML = '';
    ORDER.forEach(function (ing) {
      if (!canTake(ing.id)) return;
      var o = el('option', null, ing.name + ' — ' + remainingOf(ing.id) + ' left'); o.value = ing.id; f.ing.appendChild(o);
    });
    f.ing.value = selectedId;
  }
  function syncIngredientFields() {
    var id = f.ing.value, ing = ING[id]; if (!ing) return;
    var max = maxQty(id); f.qty.max = max; f.qty.min = 1;
    var q = parseInt(f.qty.value, 10); if (!q || q < 1) q = 1; if (q > max) q = max; f.qty.value = q;
    $('#pdQtyHelp').textContent = max > 0 ? 'Up to ' + max + ' ' + (max === 1 ? 'portion' : 'portions') + ' of this.' : 'No portions left.';
    $('#pdNoteLabel').textContent = ing.noteRequired ? 'What are you bringing? (required)' : 'Note (optional)';
    f.note.placeholder = ing.noteRequired ? 'Tell us your idea' : '';
    setErr(f.qty, ''); setErr(f.note, '');
  }
  function openDialog(id, opener) {
    if (!canTake(id) || state.loading) return;
    lastFocus = opener || document.activeElement; lastId = id;
    form.hidden = false; doneView.hidden = true; f.fail.hidden = true; f.fail.textContent = '';
    f.name.value = state.name; f.note.value = ''; f.qty.value = 1;
    setErr(f.name, ''); setErr(f.ing, ''); setErr(f.qty, ''); setErr(f.note, '');
    fillSelect(id); syncIngredientFields();
    $('#pdMode').textContent = {
      preview: 'Preview mode: this is not saved anywhere yet.',
      form: 'Next, our Google Form opens with your answers filled in. Press Submit there to save them.',
      endpoint: 'Your contribution is saved to the party sheet.'
    }[MODE];
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    document.documentElement.classList.add('punch-lock');
    (state.name ? f.qty : f.name).focus();
  }
  function closeDialog() { if (typeof dlg.close === 'function' && dlg.open) dlg.close(); else { dlg.removeAttribute('open'); afterClose(); } }
  function afterClose() {
    document.documentElement.classList.remove('punch-lock');
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  function validate() {
    var ok = true, first = null, id = f.ing.value, ing = ING[id], q = Number(f.qty.value);
    var name = f.name.value.trim(), note = f.note.value.trim();
    function bad(input, msg) { setErr(input, msg); ok = false; if (!first) first = input; }
    setErr(f.name, ''); setErr(f.ing, ''); setErr(f.qty, ''); setErr(f.note, '');
    if (!name) bad(f.name, 'Please tell us your name.');
    if (!ing || remainingOf(id) <= 0) bad(f.ing, 'Please choose an ingredient that is still available.');
    else {
      var max = maxQty(id);
      if (!isFinite(q) || q % 1 !== 0 || q < 1) bad(f.qty, 'Enter a whole number of portions, 1 or more.');
      else if (q > max) bad(f.qty, max > 0 ? 'You can bring up to ' + max + ' of this.' : 'No portions of this are left.');
      if (ing.noteRequired && note.length < 3) bad(f.note, 'Please tell us what you are bringing.');
    }
    if (first) first.focus();
    return ok;
  }

  /* ---------------------------------------------------------------
     7 · SAVING THE CONTRIBUTION
       endpoint  → POST to a Google Apps Script web app (writes to a Sheet)
       form      → open the Google Form pre-filled; the guest presses Submit
       preview   → only updates this page; nothing is stored anywhere
     No keys or secrets are used on the page.
     --------------------------------------------------------------- */
  function fetchJson(url, opts) {
    var ctl = new AbortController(), t = setTimeout(function () { ctl.abort(); }, 12000);
    opts.signal = ctl.signal;
    return fetch(url, opts).then(function (r) { clearTimeout(t); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .catch(function (e) { clearTimeout(t); throw e; });
  }
  function formLink(p) {
    var F = CFG.formFields || {}, url = CFG.formUrl, q = [];
    function add(key, val) { if (key) q.push(encodeURIComponent(key) + '=' + encodeURIComponent(val)); }
    add(F.name, p.name); add(F.ingredient, p.ingredient); add(F.quantity, p.quantity); add(F.note, p.note);
    if (!q.length) return url;
    return url + (url.indexOf('?') > -1 ? '&' : '?') + 'usp=pp_url&' + q.join('&');
  }
  function parseCsv(t) {
    var rows = [], row = [], f = '', q = false, i, c;
    for (i = 0; i < t.length; i++) {
      c = t[i];
      if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
      else if (c === '"') q = true;
      else if (c === ',') { row.push(f); f = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && t[i + 1] === '\n') i++; row.push(f); f = ''; rows.push(row); row = []; }
      else f += c;
    }
    if (f !== '' || row.length) { row.push(f); rows.push(row); }
    return rows;
  }
  function sumCsv(text) {         // one row per contribution -> portions taken per ingredient
    var cols = CFG.csvColumns || { ingredient: 2, quantity: 3 }, by = {}, out = {};
    ORDER.forEach(function (ing) { by[ing.name.toLowerCase()] = ing.id; by[ing.id.toLowerCase()] = ing.id; out[ing.id] = 0; });
    parseCsv(text).slice(1).forEach(function (r) {
      var id = by[String(r[cols.ingredient] || '').trim().toLowerCase()]; if (!id) return;
      var q = parseInt(r[cols.quantity], 10); out[id] += (q >= 1 ? q : 1);
    });
    return out;
  }
  function loadAvailability() {
    var csv = CFG.claimsCsvUrl;
    if (MODE !== 'endpoint' && !csv) return;
    state.loading = true; renderCards();
    var job = MODE === 'endpoint'
      ? fetchJson(CFG.endpoint + (CFG.endpoint.indexOf('?') > -1 ? '&' : '?') + 'action=claims', { method: 'GET' })
          .then(function (r) { if (!r || !r.ok || !r.claims) throw new Error('bad reply'); state.server = r.claims; state.serverFrom = 'sheet'; })
      : fetch(csv + (csv.indexOf('?') > -1 ? '&' : '?') + 't=' + Date.now(), { cache: 'no-store' })
          .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
          .then(function (t) { state.server = sumCsv(t); state.serverFrom = 'csv'; });
    job.catch(function () { state.server = null; state.modeNote = 'Could not read the party sheet. Showing the host\u2019s numbers instead.'; })
      .then(function () { state.loading = false; renderAll(); });
  }
  function showDone(payload, via) {
    var ing = ING[payload.ingredientId];
    form.hidden = true; doneView.hidden = false;
    var ico = $('#pdDoneIcon'); ico.innerHTML = ''; ico.appendChild(iconSvg(ing.icon, ing.color));
    $('#pdRecap').textContent = payload.name + ' · ' + ing.name + ' ×' + payload.quantity + (payload.note ? ' · “' + payload.note + '”' : '');
    $('#pdDoneNote').textContent = { preview: 'Preview only: this was not saved anywhere.', form: 'One more step: press Submit in the Google Form we just opened. Until you do, nothing is saved.', endpoint: 'Saved to the party sheet.' }[via];
    var link = $('#pdOpenForm'); link.hidden = via !== 'form'; if (via === 'form') link.href = formLink(payload);
    $('#pdDoneTitle').focus();
  }
  function onSubmit(e) {
    e.preventDefault(); if (sending || !validate()) return;
    var id = f.ing.value, ing = ING[id];
    var payload = { name: f.name.value.trim(), ingredientId: id, ingredient: ing.name, quantity: Number(f.qty.value), note: f.note.value.trim(), portions: ing.portions, submittedAt: new Date().toISOString() };
    state.name = payload.name; f.fail.hidden = true;
    if (MODE === 'form') {                         // must open inside the click so pop-up blockers allow it
      window.open(formLink(payload), '_blank', 'noopener');
      state.mine[id] = mineOf(id) + payload.quantity; showDone(payload, 'form'); flashCard(id, 'success'); renderAll(); return;
    }
    if (MODE === 'preview') { state.mine[id] = mineOf(id) + payload.quantity; showDone(payload, 'preview'); flashCard(id, 'success'); renderAll(); return; }
    sending = true; f.submit.disabled = true; f.submit.setAttribute('aria-busy', 'true'); f.submit.textContent = 'Sending…';
    fetchJson(CFG.endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign({ action: 'claim' }, payload)) })
      .then(function (r) {
        if (r && r.claims) state.server = r.claims;
        if (!r || !r.ok) { var err = new Error(r && r.error || 'rejected'); err.reply = r; throw err; }
        if (!r.claims) { state.server = state.server || {}; state.server[id] = (state.server[id] || 0) + payload.quantity; }
        state.mine[id] = mineOf(id) + payload.quantity; showDone(payload, 'endpoint'); flashCard(id, 'success'); renderAll();
      })
      .catch(function (err) {
        var soldOut = err.message === 'sold_out';
        f.fail.textContent = soldOut ? 'Someone just took the last portion of ' + ing.name + '. Please pick something else.' : 'Could not save your contribution. Please check your connection and try again.';
        f.fail.hidden = false; flashCard(id, 'failed'); renderAll();
        if (soldOut && canTake(id) === false) { fillSelect(ORDER.filter(function (x) { return canTake(x.id); }).map(function (x) { return x.id; })[0] || id); syncIngredientFields(); }
      })
      .then(function () { sending = false; f.submit.disabled = false; f.submit.removeAttribute('aria-busy'); f.submit.textContent = 'Confirm my contribution'; });
  }

  /* ---------------------------------------------------------------
     8 · WIRING
     --------------------------------------------------------------- */
  function renderAll() { renderSummary(); renderModeNotes(); renderCards(); renderMine(); syncBowl(false); }

  buildGrid(); buildBowl(); renderSummary(); renderModeNotes(); renderCards(); renderMine(); syncBowl(true);
  renderFrame(performance.now(), 0);

  $('#punchBuild').addEventListener('click', function (e) {
    e.preventDefault();
    var target = $('#punchIngredients'); target.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
    var h = $('#punchPickTitle'); setTimeout(function () { h.focus({ preventScroll: true }); }, reduced() ? 0 : 600);
  });
  stirBtn.addEventListener('click', stirPunch);
  $('#punchSurprise').addEventListener('click', function () {
    var pool = ORDER.filter(function (ing) { return canTake(ing.id); });
    if (!pool.length) { ui.hint.textContent = 'Everything is claimed. Come back if someone drops out.'; return; }
    var ing = pool[Math.floor(Math.random() * pool.length)];
    ui.hint.textContent = 'How about: ' + ing.name + '?';
    var card = cards[ing.id]; card.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' });
    card.classList.remove('is-suggested'); void card.offsetWidth; card.classList.add('is-suggested');
    setTimeout(function () { card.classList.remove('is-suggested'); }, 2600);
  });
  form.addEventListener('submit', onSubmit);
  f.ing.addEventListener('change', syncIngredientFields);
  f.qty.addEventListener('change', syncIngredientFields);
  $('#pdMinus').addEventListener('click', function () { f.qty.value = Math.max(1, (parseInt(f.qty.value, 10) || 1) - 1); syncIngredientFields(); });
  $('#pdPlus').addEventListener('click', function () { f.qty.value = (parseInt(f.qty.value, 10) || 0) + 1; syncIngredientFields(); });
  $('#pdClose').addEventListener('click', closeDialog);
  $('#pdDoneClose').addEventListener('click', closeDialog);
  dlg.addEventListener('close', afterClose);
  dlg.addEventListener('cancel', function () { document.documentElement.classList.remove('punch-lock'); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) closeDialog(); });

  if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { onScreen = en[0].isIntersecting; updateLoop(); }, { threshold: 0 }).observe(bowlHost);
  document.addEventListener('visibilitychange', updateLoop);
  var onMQ = function () { updateLoop(); syncBowl(true); }; (motionMQ.addEventListener ? motionMQ.addEventListener('change', onMQ) : motionMQ.addListener(onMQ));
  var smallNow = smallMQ.matches; addEventListener('resize', function () { if (smallMQ.matches !== smallNow) { smallNow = smallMQ.matches; syncBowl(true); } });
  updateLoop();
  loadAvailability();
})();
