/* =====================================================================
   main.js — builds the page from siteConfig.js and runs the motion.
   You normally never need to edit this file.
   Sections: 1 helpers · 2 content · 3 interactions · 4 motion
   ===================================================================== */
(function () {
  'use strict';
  var C = window.SITE_CONFIG;
  if (!C) { console.warn('siteConfig.js missing'); return; }
  var doc = document, root = doc.documentElement;
  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
  function get(obj, path) { return path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, obj); }
  function el(tag, cls, html) { var e = doc.createElement(tag); if (cls) e.className = cls; if (html != null) e.textContent = html; return e; }

  /* ---------- 1 · theme ---------- */
  var T = C.theme || {};
  ['ink', 'cream', 'felt', 'amber', 'paper', 'hot'].forEach(function (k) { if (T[k]) root.style.setProperty('--' + k, T[k]); });
  var tone = { ink: ['var(--ink)', 'var(--cream)'], felt: ['var(--felt)', 'var(--cream)'], hot: ['var(--hot)', 'var(--cream)'], paper: ['var(--paper)', 'var(--ink)'] };

  /* ---------- 2 · content ---------- */
  var ev = C.event, L = C.labels, S = C.sections || {};
  var tbd = L.tbd;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EF = (C.motion && C.motion.effects) || {};

  function parseTime(str) {
    if (!str) return null;
    var m = /^\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*$/i.exec(str);
    if (!m) return null;
    var h = +m[1], min = +(m[2] || 0), ap = (m[3] || '').toLowerCase();
    if (ap === 'pm' && h < 12) h += 12; if (ap === 'am' && h === 12) h = 0;
    return (h > 23 || min > 59) ? null : { h: h, m: min };
  }
  function dateObj() {
    if (!ev.dateISO) return null;
    var p = ev.dateISO.split('-').map(Number);
    var d = new Date(p[0], p[1] - 1, p[2]);
    return isNaN(d) ? null : d;
  }
  var d0 = dateObj();
  var view = {
    date: d0 ? d0.toLocaleDateString(ev.locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : null,
    dateShort: d0 ? d0.toLocaleDateString(ev.locale, { day: 'numeric', month: 'short' }) : null,
    time: ev.startTime ? (ev.endTime ? ev.startTime + ' – ' + ev.endTime : ev.startTime) : null,
    venue: ev.venueName || null,
    address: ev.address || null,
    hostLine: C.host.name ? 'Hosted by ' + C.host.name : '',
    dateISO: ev.dateISO || null,
    footerName: C.host.name ? '© ' + C.host.name : '© ' + ev.title.join(' ')
  };
  doc.title = ev.title.join(' ') + (C.host.name ? ' — ' + C.host.name : '');

  $$('[data-c]').forEach(function (n) { var v = get(C, n.getAttribute('data-c')); if (v != null) n.textContent = v; });
  $$('[data-v]').forEach(function (n) {
    var k = n.getAttribute('data-v'), v = view[k];
    if (v) { n.textContent = v; }
    else if (k === 'hostLine' || k === 'footerName' || k === 'dateShort') { n.textContent = ''; }
    else { n.textContent = tbd; n.classList.add('tbd'); }
  });
  $$('[data-img]').forEach(function (img) {
    var d = C.images[img.getAttribute('data-img')]; if (!d) return;
    img.src = d.src; img.alt = d.alt || '';
  });

  /* optional sections */
  $$('[data-section]').forEach(function (s) { if (S[s.getAttribute('data-section')] === false) s.remove(); });
  if (S.typeBand === false) { var tk = $('.ticker'); if (S.intro === false && tk) tk.remove(); }

  /* ticker */
  var tt = $('#tickerTrack');
  if (tt) {
    var set = (C.ticker || []).map(function (t) { return '<span>' + t.replace(/</g, '&lt;') + '</span><b>✦</b>'; }).join('');
    tt.innerHTML = set + set + set + set;
  }

  /* intro words */
  var it = $('#introText');
  if (it) {
    var words = it.textContent.trim().split(/\s+/);
    it.setAttribute('aria-label', words.join(' '));
    it.innerHTML = '';
    words.forEach(function (w) { var s = el('span', 'w', w + ' '); s.setAttribute('aria-hidden', 'true'); it.appendChild(s); });
  }

  /* type band */
  var tb = $('#typeBand');
  if (tb) (C.copy.typeLines || []).forEach(function (t) { tb.appendChild(el('p', 'typeband__row', t)); });

  /* gallery */
  var gt = $('#galleryTrack');
  if (gt) (C.gallery || []).forEach(function (g) {
    var f = el('figure', 'card card--' + (g.size || 'wide'));
    var i = el('img'); i.src = g.src; i.alt = g.alt || ''; i.loading = 'lazy'; i.decoding = 'async';
    f.appendChild(i); if (g.caption) f.appendChild(el('figcaption', '', g.caption));
    gt.appendChild(f);
  });
  if (!gt || !(C.gallery || []).length) { var gs = $('#gallery'); if (gs) gs.remove(); }

  /* facts table */
  var facts = $('#facts');
  if (facts) {
    [['date', 'date'], ['time', 'time'], ['venue', 'venue'], ['address', 'address']].forEach(function (p) {
      var row = el('div'), dt = el('dt', '', L[p[0]]), dd = el('dd', '', view[p[1]] || tbd);
      if (!view[p[1]]) dd.className = 'tbd'; row.appendChild(dt); row.appendChild(dd); facts.appendChild(row);
    });
    [['dressCode', ev.dressCode], ['notes', ev.notes]].forEach(function (p) {
      if (!p[1]) return; var row = el('div'); row.appendChild(el('dt', '', L[p[0]])); row.appendChild(el('dd', '', p[1])); facts.appendChild(row);
    });
  }

  /* practical */
  var pr = $('#practical');
  if (pr) (C.practical || []).forEach(function (p) {
    var li = el('li'); li.appendChild(el('b', '', p.label)); li.appendChild(el('span', '', p.text)); pr.appendChild(li);
  });
  if (pr && !(C.practical || []).length) pr.remove();

  /* socials */
  var so = $('#socials');
  (C.social || []).forEach(function (s) {
    if (!s.url) return; var a = el('a', '', s.label); a.href = s.url; a.target = '_blank'; a.rel = 'noopener'; so.appendChild(a);
  });

  /* buttons text */
  $$('[data-lbl]').forEach(function (n) { n.textContent = L[n.getAttribute('data-lbl')] || ''; });
  $$('[data-lbl-cd]').forEach(function (n) { n.textContent = (C.ticket.countdownLabels || {})[n.getAttribute('data-lbl-cd')] || ''; });
  if ($('#backBtn')) $('#backBtn').textContent = L.backToDetails;
  if ($('#backBtn')) $('#backBtn').setAttribute('href', $('#pass') ? '#pass' : '#invitation');
  var R = (C.rsvp && C.rsvp.labels) || {};
  var map = { lblYes: R.yes, lblNo: R.no, lblName: R.name, lblMsg: R.message, rsvpSend: R.send, rsvpChange: R.change };
  Object.keys(map).forEach(function (id) { var n = doc.getElementById(id); if (n) n.textContent = map[id]; });

  /* ---------- 3 · interactions ---------- */
  // Maps
  function hintEl(btn) { var sec = btn.closest('section'); return (sec && sec.querySelector('.hint')) || { textContent: '' }; }
  var mapsUrl = ev.mapsUrl || ((ev.venueName || ev.address) ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent((ev.venueName + ' ' + ev.address).trim()) : '');
  $$('[data-act="maps"]').forEach(function (mapsBtn) {
    if (mapsUrl) mapsBtn.href = mapsUrl;
    else mapsBtn.addEventListener('click', function (e) {
      e.preventDefault(); hintEl(mapsBtn).textContent = 'Add the venue and address in siteConfig.js to enable this button.';
    });
  });
  // Registration via Google Form (ticket)
  var formUrl = (C.rsvp && C.rsvp.formUrl) || '';
  $$('[data-act="register"]').forEach(function (b) { if (formUrl) b.href = formUrl; else b.hidden = true; });
  // Calendar (.ics download)
  function pad(n) { return String(n).padStart(2, '0'); }
  function icsStamp(d) { return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + 'T' + pad(d.getHours()) + pad(d.getMinutes()) + '00'; }
  function esc(s) { return String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n'); }
  $$('[data-act="cal"]').forEach(function (calBtn) { calBtn.addEventListener('click', function () {
    var dHint = hintEl(calBtn);
    var st = parseTime(ev.startTime);
    if (!d0 || !st) { dHint.textContent = 'Add the date and a start time (like 20:00) in siteConfig.js to enable the calendar button.'; return; }
    var start = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate(), st.h, st.m);
    var et = parseTime(ev.endTime), end;
    if (et) { end = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate(), et.h, et.m); if (end <= start) end.setDate(end.getDate() + 1); }
    else end = new Date(start.getTime() + 4 * 3600 * 1000);
    var title = ev.title.join(' ');
    var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Birthday Invitation//EN', 'BEGIN:VEVENT',
      'UID:' + Date.now() + '@birthday-invitation', 'DTSTAMP:' + icsStamp(new Date()),
      'DTSTART:' + icsStamp(start), 'DTEND:' + icsStamp(end), 'SUMMARY:' + esc(title),
      'LOCATION:' + esc([ev.venueName, ev.address].filter(Boolean).join(', ')),
      'DESCRIPTION:' + esc([ev.tagline, ev.dressCode && (L.dressCode + ': ' + ev.dressCode), ev.notes].filter(Boolean).join('\n')),
      'END:VEVENT', 'END:VCALENDAR'];
    var blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    var a = doc.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'birthday-night.ics';
    doc.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
    dHint.textContent = '';
  }); });

  // Countdown + pass
  (function () {
    var cd = $('#countdown'); if (!cd) return;
    var st0 = parseTime(ev.startTime);
    if (!d0) { cd.hidden = true; return; }
    var target = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate(), st0 ? st0.h : 0, st0 ? st0.m : 0).getTime();
    var els = { d: $('#cdD'), h: $('#cdH'), m: $('#cdM'), s: $('#cdS') }, prev = {}, live = $('#cdLive');
    function set(k, v) { if (prev[k] === v) return; prev[k] = v; els[k].textContent = v; if (!reduced && prev.init) { els[k].classList.remove('tick'); void els[k].offsetWidth; els[k].classList.add('tick'); } }
    function upd() {
      var diff = Math.max(0, target - Date.now()), t = Math.floor(diff / 1000);
      set('d', String(Math.floor(t / 86400))); set('h', String(Math.floor(t % 86400 / 3600)).padStart(2, '0'));
      set('m', String(Math.floor(t % 3600 / 60)).padStart(2, '0')); set('s', String(t % 60).padStart(2, '0'));
      prev.init = true; live.textContent = diff === 0 ? (C.ticket.liveText || '') : '';
    }
    upd(); setInterval(upd, 1000);
  })();
  (function () {
    var t = $('#tkTitle'); if (!t) return;
    if (reduced || EF.ticketScan === false) return;
    var txt = t.textContent; t.setAttribute('aria-label', txt); t.textContent = '';
    var chars = [];
    txt.split(' ').forEach(function (word, wi, arr) {
      var w = el('span'); w.style.cssText = 'display:inline-block;white-space:nowrap'; w.setAttribute('aria-hidden', 'true');
      word.split('').forEach(function (c) { var s = el('span', 'ch', c); w.appendChild(s); chars.push(s); });
      t.appendChild(w); if (wi < arr.length - 1) t.appendChild(doc.createTextNode(' '));
    });
    var i = 0, vis = false;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { vis = en[0].isIntersecting; }, { threshold: .3 }).observe(t);
    setInterval(function () {
      if (!vis) return; chars.forEach(function (c) { c.classList.remove('hl'); });
      i = (i + 1) % chars.length; chars[i].classList.add('hl');
    }, 520);
  })();

  // RSVP
  var form = $('#rsvpForm'), done = $('#rsvpDone'), hint = $('#rsvpHint');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var answer = (form.elements.answer || {}).value;
      if (!answer) { hint.textContent = R.chooseFirst; return; }
      var data = { answer: answer, name: form.elements.name.value.trim(), message: form.elements.message.value.trim() };
      var cfg = C.rsvp, mode = 'preview', btn = $('#rsvpSend');
      function finish() {
        $('#doneTitle').textContent = answer === 'yes' ? R.yesTitle : R.noTitle;
        $('#doneText').textContent = answer === 'yes' ? R.yesText : R.noText;
        $('#doneNote').textContent = mode === 'preview' ? R.previewNote : '';
        form.hidden = true; done.hidden = false; hint.textContent = '';
        if (window.gsap && !matchMedia('(prefers-reduced-motion: reduce)').matches)
          gsap.from(done.children, { y: 30, autoAlpha: 0, stagger: .1, duration: .8, ease: 'power3.out' });
        done.focus({ preventScroll: true });
        if (answer === 'yes') confetti();
        if (window.ScrollTrigger) setTimeout(function () { ScrollTrigger.refresh(); }, 100);
      }
      if (cfg.endpoint) {
        var fn = cfg.fieldNames || {}, body = new URLSearchParams();
        body.append(fn.answer || 'answer', answer === 'yes' ? (R.yes) : (R.no));
        body.append(fn.name || 'name', data.name); body.append(fn.message || 'message', data.message);
        btn.disabled = true;
        fetch(cfg.endpoint, { method: 'POST', mode: cfg.noCors ? 'no-cors' : 'cors', headers: cfg.noCors ? undefined : { Accept: 'application/json' }, body: body })
          .then(function (r) { if (!cfg.noCors && !r.ok) throw new Error('bad status'); mode = 'sent'; finish(); })
          .catch(function () { hint.textContent = R.error; })
          .then(function () { btn.disabled = false; });
      } else if (cfg.email) {
        mode = 'mail';
        var sub = encodeURIComponent('RSVP — ' + ev.title.join(' ') + ': ' + (answer === 'yes' ? R.yes : R.no));
        var bod = encodeURIComponent((data.name ? data.name + '\n\n' : '') + data.message);
        window.location.href = 'mailto:' + cfg.email + '?subject=' + sub + '&body=' + bod;
        finish();
      } else { finish(); }
    });
    $('#rsvpChange').addEventListener('click', function () { done.hidden = true; form.hidden = false; $('#lblYes').focus(); if (window.ScrollTrigger) ScrollTrigger.refresh(); });
  }

  // background tone per section (IntersectionObserver — independent of GSAP)
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var t = tone[en.target.getAttribute('data-bg')] || tone.ink;
        root.style.setProperty('--bg', t[0]); root.style.setProperty('--fg', t[1]);
      });
    }, { rootMargin: '-50% 0px -50% 0px' });
    $$('[data-bg]').forEach(function (s) { io.observe(s); });
  }

  // nav hide on scroll down, show on up
  var nav = $('#nav'), lastY = 0;
  addEventListener('scroll', function () {
    var y = scrollY; nav.classList.toggle('is-hidden', y > lastY && y > 400); lastY = y;
  }, { passive: true });


  /* ---------- 3b · extra effects (work without GSAP) ---------- */
  function on(name) { return EF[name] !== false && C.motion && C.motion.enabled !== false && !reduced; }
  var finePointer = matchMedia('(hover:hover) and (pointer:fine)').matches;

  // rolling 8-ball scroll progress
  var bp = $('.ballprogress');
  if (bp && on('ballProgress')) {
    var ball = $('i', bp), ticking = false;
    var upd = function () {
      ticking = false;
      var max = Math.max(1, root.scrollHeight - innerHeight), p = Math.min(1, Math.max(0, scrollY / max));
      root.style.setProperty('--p', p.toFixed(4));
      ball.style.transform = 'rotate(' + (p * innerWidth / 69 * 360).toFixed(1) + 'deg)';
      bp.classList.toggle('on', scrollY > 60);
    };
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
    addEventListener('resize', upd); upd();
  } else if (bp) bp.remove();

  // lamp-light spotlight following the pointer
  if (on('spotlight') && finePointer) {
    $$('.hero, .finale').forEach(function (sec) {
      var spot = $('.spot', sec); if (!spot) return;
      var raf = 0, px = 0, py = 0;
      sec.addEventListener('pointermove', function (e) {
        var r = sec.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top;
        if (!raf) raf = requestAnimationFrame(function () { raf = 0; spot.style.setProperty('--mx', px + 'px'); spot.style.setProperty('--my', py + 'px'); });
        spot.classList.add('on');
      });
      sec.addEventListener('pointerleave', function () { spot.classList.remove('on'); });
    });
  }

  // playable rack break (canvas, simple 2D physics)
  var cv = $('#breakCanvas');
  if (cv) (function () {
    var ctx = cv.getContext('2d'), W = 0, H = 0, R = 14, RIM = 18, balls = [], cue = null, dpr = 1;
    var visible = false, running = false, last = 0, autoDone = false, cueTimer = 0;
    var cols = ['#f2c230', '#1d4fa8', '#c9262c', '#5b2a86', '#e8742a', '#1d7a46', '#7a1f1f', '#111111'];
    function size() {
      var r = cv.getBoundingClientRect(); dpr = Math.min(devicePixelRatio || 1, 2);
      cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      W = r.width; H = r.height; R = Math.max(11, Math.min(24, W / 36)); RIM = Math.max(12, R * 1.1);
    }
    function pockets() {
      var m = RIM * .55; return [[m, m], [W / 2, m * .7], [W - m, m], [m, H - m], [W / 2, H - m * .7], [W - m, H - m]];
    }
    function rack() {
      balls = []; var vert = W < H, d = R * 2 + 1, n = 0, order = [1, 9, 2, 10, 8, 3, 11, 4, 12, 5, 13, 6, 14, 7, 15];
      var cx = vert ? W / 2 : W * .68, cy = vert ? H * .36 : H / 2;
      for (var r = 0; r < 5; r++) for (var k = 0; k <= r; k++) {
        var num = order[n++], x, y;
        if (vert) { x = cx + (k - r / 2) * d; y = cy - r * d * .866; } else { x = cx + r * d * .866; y = cy + (k - r / 2) * d; }
        balls.push({ x: x, y: y, vx: 0, vy: 0, n: num, c: num === 8 ? cols[7] : cols[(num - 1) % 7], stripe: num > 8, gone: 0, sc: 1 });
      }
      cue = { x: vert ? W / 2 : W * .2, y: vert ? H * .8 : H / 2 + 1, vx: 0, vy: 0, n: 0, c: '#f4efe4', gone: 0, sc: 1, cue: true };
      balls.push(cue);
    }
    function moving() { return balls.some(function (b) { return !b.gone && (b.vx || b.vy); }); }
    function shoot(tx, ty, sp) {
      if (cue.gone || moving()) return;
      var dx = tx - cue.x, dy = ty - cue.y, d = Math.hypot(dx, dy) || 1; cue.vx = dx / d * sp; cue.vy = dy / d * sp; start();
    }
    function autoBreak() { var vert = W < H; shoot(vert ? W / 2 : W * .68, vert ? H * .36 : H / 2, Math.min(34, W / 30)); }
    function physics(dt) {
      var L = RIM + R, Rr = W - RIM - R, T = RIM + R, B = H - RIM - R, P = pockets(), PR = R * 1.75, i, j, b;
      var maxv = 0; balls.forEach(function (q) { maxv = Math.max(maxv, Math.hypot(q.vx, q.vy)); });
      var sub = Math.max(1, Math.ceil(maxv * dt / (R * .6))), h = dt / sub;
      for (var s2 = 0; s2 < sub; s2++) {
        for (i = 0; i < balls.length; i++) {
          b = balls[i]; if (b.gone) continue;
          b.x += b.vx * h; b.y += b.vy * h;
          for (j = 0; j < 6; j++) if (Math.hypot(b.x - P[j][0], b.y - P[j][1]) < PR) { b.gone = 1; b.vx = b.vy = 0; b.x = P[j][0]; b.y = P[j][1]; break; }
          if (b.gone) { if (b.cue) { clearTimeout(cueTimer); cueTimer = setTimeout(respawn, 1100); } continue; }
          if (b.x < L) { b.x = L; b.vx = Math.abs(b.vx) * .9; } if (b.x > Rr) { b.x = Rr; b.vx = -Math.abs(b.vx) * .9; }
          if (b.y < T) { b.y = T; b.vy = Math.abs(b.vy) * .9; } if (b.y > B) { b.y = B; b.vy = -Math.abs(b.vy) * .9; }
        }
        for (i = 0; i < balls.length; i++) for (j = i + 1; j < balls.length; j++) {
          var a = balls[i], c = balls[j]; if (a.gone || c.gone) continue;
          var dx = c.x - a.x, dy = c.y - a.y, dd = Math.hypot(dx, dy);
          if (dd < 2 * R && dd > 0) {
            var nx = dx / dd, ny = dy / dd, ov = 2 * R - dd; a.x -= nx * ov / 2; a.y -= ny * ov / 2; c.x += nx * ov / 2; c.y += ny * ov / 2;
            var rv = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny;
            if (rv < 0) { var imp = -(1 + .96) * rv / 2; a.vx -= imp * nx; a.vy -= imp * ny; c.vx += imp * nx; c.vy += imp * ny; }
          }
        }
      }
      var f = Math.pow(.987, dt);
      balls.forEach(function (q) { q.vx *= f; q.vy *= f; if (Math.hypot(q.vx, q.vy) < .05) q.vx = q.vy = 0; });
    }
    function respawn() { if (!cue.gone) return; var vert = W < H; cue.x = vert ? W / 2 : W * .2; cue.y = vert ? H * .8 : H / 2 + 1; cue.vx = cue.vy = 0; cue.gone = 0; cue.sc = 0; draw(); start(); }
    function ballGfx(b) {
      var x = b.x, y = b.y, r = R * b.sc; if (r <= .5) return;
      ctx.save(); ctx.translate(x, y);
      ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(r * .25, r * .45, r, r * .85, 0, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.clip();
      ctx.fillStyle = b.stripe ? '#f4efe4' : b.c; ctx.fillRect(-r, -r, 2 * r, 2 * r);
      if (b.stripe) { ctx.fillStyle = b.c; ctx.fillRect(-r, -r * .5, 2 * r, r); }
      if (b.n) { ctx.fillStyle = '#f4efe4'; ctx.beginPath(); ctx.arc(0, 0, r * .46, 0, 7); ctx.fill(); ctx.fillStyle = '#111'; ctx.font = '600 ' + Math.round(r * .62) + 'px Jost,Arial,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(b.n, 0, r * .04); }
      var g = ctx.createRadialGradient(-r * .35, -r * .4, r * .05, 0, 0, r); g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(.35, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,.38)');
      ctx.fillStyle = g; ctx.fillRect(-r, -r, 2 * r, 2 * r); ctx.restore();
    }
    function draw() {
      var felt = getComputedStyle(root).getPropertyValue('--felt').trim() || '#a8121b';
      ctx.clearRect(0, 0, W, H);
      var wood = ctx.createLinearGradient(0, 0, 0, H); wood.addColorStop(0, '#6a3b1c'); wood.addColorStop(.5, '#4a2810'); wood.addColorStop(1, '#5c3317');
      ctx.fillStyle = wood; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(0, 0, W, H, 18) : ctx.rect(0, 0, W, H); ctx.fill();
      var fg = ctx.createRadialGradient(W / 2, H / 2, H * .1, W / 2, H / 2, W * .6); fg.addColorStop(0, felt); fg.addColorStop(1, '#5a0a10');
      ctx.fillStyle = fg; ctx.fillRect(RIM * .55, RIM * .55, W - RIM * 1.1, H - RIM * 1.1);
      ctx.fillStyle = '#080605'; pockets().forEach(function (p) { ctx.beginPath(); ctx.arc(p[0], p[1], R * 1.35, 0, 7); ctx.fill(); });
      ctx.strokeStyle = 'rgba(217,164,91,.55)'; ctx.lineWidth = 1; ctx.strokeRect(RIM * .55, RIM * .55, W - RIM * 1.1, H - RIM * 1.1);
      balls.forEach(function (b) { if (b.gone && b.sc <= 0) return; ballGfx(b); });
    }
    function frame(t) {
      var dt = Math.min(2.5, (t - last) / 16.667 || 1); last = t;
      physics(dt);
      balls.forEach(function (b) { if (b.gone) b.sc = Math.max(0, b.sc - .12 * dt); else if (b.sc < 1) b.sc = Math.min(1, b.sc + .08 * dt); });
      draw();
      if (visible && (moving() || balls.some(function (b) { return (b.gone && b.sc > 0) || (!b.gone && b.sc < 1); }))) requestAnimationFrame(frame); else running = false;
    }
    function start() { if (running) return; running = true; last = performance.now(); requestAnimationFrame(frame); }
    function reset(auto) { clearTimeout(cueTimer); size(); rack(); draw(); if (auto && !reduced) setTimeout(autoBreak, 450); }
    reset(false);
    if (!on('rackBreak')) { /* static rack, still clickable */ }
    cv.addEventListener('pointerdown', function (e) { var r = cv.getBoundingClientRect(); shoot(e.clientX - r.left, e.clientY - r.top, Math.min(26, W / 38)); });
    var bb = $('#breakBtn'); if (bb) { bb.textContent = C.copy.breakButton; bb.addEventListener('click', function () { reset(true); }); }
    var tmr; addEventListener('resize', function () { clearTimeout(tmr); tmr = setTimeout(function () { reset(false); }, 250); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) {
      visible = en[0].isIntersecting;
      if (visible && !autoDone && on('rackBreak')) { autoDone = true; setTimeout(autoBreak, 600); }
      if (visible) { draw(); if (moving()) start(); }
    }, { threshold: .5 }).observe(cv);
  })();

  // short paper-confetti burst
  function confetti() {
    if (!on('confetti')) return;
    var c = doc.createElement('canvas'); c.setAttribute('aria-hidden', 'true');
    c.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:95';
    doc.body.appendChild(c); var x = c.getContext('2d'), w = c.width = innerWidth, h = c.height = innerHeight;
    var cl = [T.cream || '#eadfcb', T.felt || '#a8121b', T.amber || '#d9a45b', '#f4efe4'];
    var ps = Array.from({ length: 110 }, function () { var a = -Math.PI / 2 + (Math.random() - .5) * 1.5, v = 10 + Math.random() * 13;
      return { x: w / 2, y: h * .72, vx: Math.cos(a) * v, vy: Math.sin(a) * v, s: 5 + Math.random() * 7, r: Math.random() * 6, vr: (Math.random() - .5) * .4, c: cl[Math.floor(Math.random() * cl.length)] }; });
    var t0 = performance.now();
    (function loop(t) {
      var k = (t - t0) / 2600; x.clearRect(0, 0, w, h); x.globalAlpha = Math.max(0, 1 - Math.max(0, k - .6) / .4);
      ps.forEach(function (p) { p.vy += .38; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.r += p.vr; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); x.restore(); });
      if (k < 1) requestAnimationFrame(loop); else c.remove();
    })(t0);
  }

  // text helpers
  function splitChars(n) {
    if (!n || n.getAttribute('data-split')) return;
    var txt = n.textContent; n.setAttribute('aria-label', txt); n.setAttribute('data-split', '1'); n.textContent = '';
    txt.split(' ').forEach(function (word, wi, arr) {
      var wsp = el('span'); wsp.style.cssText = 'display:inline-block;white-space:nowrap'; wsp.setAttribute('aria-hidden', 'true');
      word.split('').forEach(function (ch) { wsp.appendChild(el('span', 'ch', ch)); });
      n.appendChild(wsp); if (wi < arr.length - 1) n.appendChild(doc.createTextNode(' '));
    });
  }
  function scramble(n, dur) {
    var fin = n.textContent, pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', t0 = performance.now();
    n.setAttribute('aria-label', fin);
    (function loop(t) {
      var k = Math.min(1, (t - t0) / dur), out = '';
      for (var i = 0; i < fin.length; i++) { var c = fin[i]; out += (/[\s,.\-–:\/]/.test(c) || i < fin.length * k) ? c : pool[Math.floor(Math.random() * pool.length)]; }
      n.textContent = out; if (k < 1) requestAnimationFrame(loop); else n.removeAttribute('aria-label');
    })(t0);
  }

  /* ---------- 4 · motion ---------- */
  var M = C.motion || {};
  function motion() {
    if (!window.gsap || !window.ScrollTrigger || M.enabled === false) { root.classList.remove('pending'); return; }
    gsap.registerPlugin(ScrollTrigger);
    var I = M.intensity == null ? 1 : M.intensity;
    if (!reduced) {
      ['.hero .line__in', '.invite__heading .line__in'].forEach(function (q) { $$(q).forEach(splitChars); });
      ['.gallery__title', '.details__title', '.rsvp__title', '.break__title'].forEach(function (q) { var n = $(q); if (n) { splitChars(n); n.classList.add('split-mask'); } });
    }
    var mm = gsap.matchMedia();

    mm.add({ desktop: '(min-width: 800px)', mobile: '(max-width: 799px)', ok: '(prefers-reduced-motion: no-preference)' }, function (ctx) {
      var desktop = ctx.conditions.desktop;
      if (!ctx.conditions.ok) { root.classList.remove('pending'); return; }
      var cleanup = [];

      /* hero entrance */
      gsap.set('.hero__frame', { clipPath: 'inset(100% 0% 0% 0%)' });
      gsap.set('.hero__img', { scale: 1 + .35 * I });
      gsap.set('.hero .ch', { yPercent: 125, rotateX: -95, transformOrigin: '50% 100%', transformPerspective: 700 });
      gsap.set(['.hero__host', '.hero__script', '.hero__sub', '.hero__meta', '.scrollcue'], { autoAlpha: 0, y: 24 });
      root.classList.remove('pending');
      gsap.timeline({ defaults: { ease: 'power4.out' } })
        .to('.hero__frame', { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.7, ease: 'expo.inOut' }, 0)
        .to('.hero__img', { scale: 1, duration: 2.6, ease: 'power3.out' }, 0)
        .to('.hero .ch', { yPercent: 0, rotateX: 0, duration: 1.3, stagger: { each: .05, from: 'start' } }, .75)
        .to('.hero__script', { autoAlpha: 1, y: 0, duration: 1.3 }, 1.5)
        .to(['.hero__host', '.hero__sub', '.hero__meta', '.scrollcue'], { autoAlpha: 1, y: 0, duration: 1, stagger: .1 }, 1.8);

      /* hero scroll: image drifts, title lifts */
      gsap.to('.hero__frame', { yPercent: desktop ? 6 * I : 0, scale: 1 + .05 * I, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.hero__title', { yPercent: -28 * I, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to(['.hero__script', '.hero__sub'], { yPercent: -60 * I, autoAlpha: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: '15% top', end: '80% top', scrub: true } });

      /* intro words scrub */
      var words = $$('#introText .w');
      if (words.length) gsap.fromTo(words, { opacity: .12 }, { opacity: 1, stagger: .12, ease: 'none', scrollTrigger: { trigger: '#introText', start: 'top 82%', end: 'bottom 52%', scrub: true } });

      /* parallax images (image moves inside its mask) */
      $$('[data-parallax]').forEach(function (img) {
        var sp = +img.getAttribute('data-parallax') * I;
        gsap.fromTo(img, { yPercent: -sp }, { yPercent: sp * .4, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
        gsap.from(img.parentElement, { clipPath: 'inset(0 0 100% 0)', duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: img.parentElement, start: 'top 88%' } });
      });

      /* room: pinned clip-path reveal */
      if ($('.room')) {
        var rt = gsap.timeline({ scrollTrigger: { trigger: '.room', start: 'top top', end: desktop ? '+=130%' : '+=75%', pin: true, scrub: .6, anticipatePin: 1 } });
        rt.fromTo('.room__media', { clipPath: desktop ? 'inset(24% 30% 24% 30% round 28px)' : 'inset(22% 12% 22% 12% round 22px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', duration: 1 }, 0)
          .fromTo('.room__img', { scale: 1 + .4 * I }, { scale: 1, ease: 'none', duration: 1 }, 0)
          .fromTo('.room__label', { autoAlpha: 0 }, { autoAlpha: 1, duration: .3 }, .45)
          .fromTo('#roomW1', { xPercent: -40 * I, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, ease: 'power2.out', duration: .5 }, .4)
          .fromTo('#roomW2', { xPercent: 40 * I, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, ease: 'power2.out', duration: .5 }, .55)
          .fromTo('.room__caption', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: .35 }, .8);
      }

      /* gallery: desktop pins and scrolls sideways; mobile keeps native swipe */
      var gal = $('#gallery'), vp = $('#galleryViewport'), tr = $('#galleryTrack');
      if (gal && desktop && tr) {
        gal.classList.add('gallery--pinned');
        var dist = function () { return Math.max(0, tr.scrollWidth - (innerWidth - parseFloat(getComputedStyle(vp).paddingLeft) * 2)); };
        var gtween = gsap.to(tr, { x: function () { return -dist(); }, ease: 'none', scrollTrigger: { trigger: gal, start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: .5, invalidateOnRefresh: true, anticipatePin: 1 } });
        $$('.card img', tr).forEach(function (im) {
          gsap.fromTo(im, { scale: 1.25 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: im.parentElement, containerAnimation: gtween, start: 'left 95%', end: 'left 35%', scrub: true } });
        });
        cleanup.push(function () { gal.classList.remove('gallery--pinned'); });
      } else if (gal) {
        gsap.from('.card', { y: 50, autoAlpha: 0, duration: 1, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: gal, start: 'top 70%' } });
      }

      /* type band: rows slide in opposite directions */
      $$('.typeband__row').forEach(function (row, i) {
        gsap.fromTo(row, { x: (i % 2 ? -1 : 1) * 18 * I + 'vw' }, { x: (i % 2 ? 1 : -1) * 18 * I + 'vw', ease: 'none', scrollTrigger: { trigger: '.typeband', start: 'top bottom', end: 'bottom top', scrub: true } });
      });

      /* invitation */
      if ($('.invite')) {
        gsap.from('.invite__heading .ch', { yPercent: 120, rotateX: -80, transformOrigin: '50% 100%', transformPerspective: 700, duration: 1.2, stagger: .045, ease: 'power4.out', scrollTrigger: { trigger: '.invite__heading', start: 'top 82%' } });
        gsap.from('.facts div', { autoAlpha: 0, y: 30, stagger: .1, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.facts', start: 'top 85%' } });
        gsap.fromTo('.poster-tilt', { rotation: 7 * I, y: 80, scale: .92 }, { rotation: -2 * I, y: -30, scale: 1, ease: 'none', scrollTrigger: { trigger: '.invite__poster', start: 'top bottom', end: 'bottom top', scrub: true } });
        if (matchMedia('(hover:hover)').matches) {
          var pt = $('.poster-tilt');
          var qx = gsap.quickTo(pt, 'rotationY', { duration: .6 }), qy = gsap.quickTo(pt, 'rotationX', { duration: .6 });
          var host = $('.invite__poster');
          host.addEventListener('pointermove', function (e) { var r = host.getBoundingClientRect(); qx(((e.clientX - r.left) / r.width - .5) * 14); qy(-((e.clientY - r.top) / r.height - .5) * 10); });
          host.addEventListener('pointerleave', function () { qx(0); qy(0); });
        }
      }

      /* details / rsvp / finale entrances */
      ['.gallery__title', '.details__title', '.rsvp__title', '.break__title'].forEach(function (q) {
        if ($(q + ' .ch')) gsap.from(q + ' .ch', { yPercent: 115, rotate: 7, duration: 1.1, stagger: .035, ease: 'power4.out', scrollTrigger: { trigger: q, start: 'top 88%' } });
      });
      if ($('.details__grid')) gsap.from('.details__main > *, .practical li', { y: 36, autoAlpha: 0, stagger: .09, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.details__grid', start: 'top 82%' } });
      if ($('.rsvp__form')) gsap.from('.choices label, .field, .rsvp__form .btn', { y: 36, autoAlpha: 0, stagger: .08, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.rsvp__form', start: 'top 85%' } });
      if ($('.finale')) {
        var fl = gsap.timeline({ scrollTrigger: { trigger: '.finale', start: 'top 75%', end: 'bottom bottom', scrub: .8 } });
        fl.fromTo('.finale__img', { scale: 1 + .35 * I }, { scale: 1, ease: 'none' }, 0)
          .fromTo('.finale__script', { scale: .78, autoAlpha: .2 }, { scale: 1, autoAlpha: 1, ease: 'none' }, 0)
          .fromTo(['.finale__sub', '.finale__btn'], { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, stagger: .1, ease: 'none' }, .5);
      }

      /* pass page: heading, photo strip, countdown cards */
      if ($('.pass')) {
        $$('.pass__heading .line__in').forEach(splitChars);
        gsap.from('.pass__heading .ch', { yPercent: 120, rotateX: -80, transformOrigin: '50% 100%', transformPerspective: 700, duration: 1.1, stagger: .04, ease: 'power4.out', scrollTrigger: { trigger: '.pass__heading', start: 'top 85%' } });
        gsap.from('.cd', { y: 40, autoAlpha: 0, stagger: .1, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.countdown', start: 'top 88%' } });
        gsap.from('.strip figure', { clipPath: 'inset(100% 0 0 0)', duration: 1.2, stagger: .15, ease: 'expo.out', scrollTrigger: { trigger: '.strip', start: 'top 85%' } });
        gsap.from('.ticket', { y: 80, autoAlpha: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.ticket', start: 'top 88%' } });
      }

      /* magnetic buttons (pointer devices only) */
      if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
        $$('.magnetic').forEach(function (b) {
          var xTo = gsap.quickTo(b, 'x', { duration: .5, ease: 'power3' }), yTo = gsap.quickTo(b, 'y', { duration: .5, ease: 'power3' });
          function mv(e) { var r = b.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * .28); yTo((e.clientY - r.top - r.height / 2) * .28); }
          function lv() { xTo(0); yTo(0); }
          b.addEventListener('pointermove', mv); b.addEventListener('pointerleave', lv);
          cleanup.push(function () { b.removeEventListener('pointermove', mv); b.removeEventListener('pointerleave', lv); });
        });
      }

      /* ticker speeds up with scroll velocity and reverses with direction */
      var track = $('#tickerTrack');
      if (track && on('tickerVelocity')) {
        $('.ticker').classList.add('ticker--gsap');
        var tw = gsap.fromTo(track, { x: 0 }, { x: function () { return -track.scrollWidth / 2; }, duration: 38, ease: 'none', repeat: -1, invalidateOnRefresh: true });
        tw.totalTime(tw.duration() * 40);
        var boost = 0, dirv = 1;
        ScrollTrigger.create({ onUpdate: function (self) { boost = Math.min(Math.abs(self.getVelocity()) / 220, 9); dirv = self.direction; } });
        var tick = function () { boost *= .94; tw.timeScale(dirv * (1 + boost)); };
        gsap.ticker.add(tick);
        cleanup.push(function () { gsap.ticker.remove(tick); tw.kill(); $('.ticker').classList.remove('ticker--gsap'); gsap.set(track, { clearProps: 'transform' }); });
      }

      /* date / venue decode into place */
      if (on('scramble')) $$('.details__venue, .details__when span:not(.sep), .facts dd').forEach(function (n) {
        if (n.classList.contains('tbd') || !n.textContent.trim()) return;
        ScrollTrigger.create({ trigger: n, start: 'top 88%', once: true, onEnter: function () { scramble(n, 900); } });
      });

      /* pointer-driven effects (desktop only) */
      if (finePointer && desktop) {
        if (on('cardTilt')) $$('.card').forEach(function (c) {
          var rx = gsap.quickTo(c, 'rotationX', { duration: .5, ease: 'power3' }), ry = gsap.quickTo(c, 'rotationY', { duration: .5, ease: 'power3' });
          gsap.set(c, { transformPerspective: 900 });
          function mv(e) { var r = c.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - .5) * 14); rx(-((e.clientY - r.top) / r.height - .5) * 12); }
          function lv() { rx(0); ry(0); }
          c.addEventListener('pointermove', mv); c.addEventListener('pointerleave', lv);
          cleanup.push(function () { c.removeEventListener('pointermove', mv); c.removeEventListener('pointerleave', lv); gsap.set(c, { clearProps: 'transform' }); });
        });
        if (on('heroParallax')) {
          var hs = $('.hero'), fx = gsap.quickTo('.hero__frame', 'x', { duration: 1, ease: 'power3' }), fy = gsap.quickTo('.hero__img', 'y', { duration: 1, ease: 'power3' }), tx = gsap.quickTo('.hero__title', 'x', { duration: 1.2, ease: 'power3' });
          function hm(e) { var nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5; fx(-nx * 28 * I); fy(-ny * 24 * I); tx(nx * 36 * I); }
          hs.addEventListener('pointermove', hm);
          cleanup.push(function () { hs.removeEventListener('pointermove', hm); });
        }
      }

      return function () { cleanup.forEach(function (f) { f(); }); };
    });

    addEventListener('load', function () { ScrollTrigger.refresh(); });
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }

  if (doc.readyState === 'complete') motion(); else addEventListener('load', motion);
  // if GSAP is slow/blocked, never leave content hidden
  setTimeout(function () { if (!window.gsap) root.classList.remove('pending'); }, 3500);
})();
