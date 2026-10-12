/* =====================================================================
   SITE CONFIG — the ONLY file you need to edit for content.
   Change text, date, venue, photos, colors and motion here.
   Anything left as "" shows a clearly labelled "to be announced"
   placeholder on the page — nothing is invented for you.
   ===================================================================== */
window.SITE_CONFIG = {

  /* ---------- WHO ---------- */
  host: {
    name: "Jang Max",         // e.g. "Anna" — shown as "Hosted by Anna"; leave "" to hide
    monogram: "JM",           // small mark in the top-left of the navigation
  },

  /* ---------- THE EVENT ---------- */
  event: {
    title: ["Birthday", "Night"],          // two lines of the giant headline
    tagline: "Let's play",                 // handwritten line under the title
    subtitle: "Pool · Drinks · Good company",
    dateISO: "2026-10-16",   // Friday, 16 October 2026 (YYYY-MM-DD). Powers the date + calendar button.
    startTime: "20:00",     // 8 PM
    endTime: "",              // optional. Empty = calendar event lasts 4 hours. Example: "23:30"
    venueName: "The Red Felt & Vinyl Club", // e.g. "The Cue Club"
    address: "서울 마포구 서교동 399-27 3층", // full street address
    dressCode: "",            // optional, e.g. "Dark colours. Red if you dare."
    notes: "",                // optional, e.g. "Bring good energy. Cake at 22:00."
    mapsUrl: "https://map.naver.com/p/entry/address/3zf8RR,2ALjve,%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C%20%EB%A7%88%ED%8F%AC%EA%B5%AC%20%EC%84%9C%EA%B5%90%EB%8F%99%20399-27?c=15.00,0,0,0,dh", // Naver Map link (Seogyo-dong 399-27)
    locale: "en-GB",          // date language/format: "en-US", "ko-KR", "ru-RU" ...
  },

  /* ---------- COUNTDOWN + VIP PASS (the ticket at the end) ---------- */
  ticket: {
    heading: ["Doors", "open in"],   // giant headline above the countdown
    badge: "VIP admission",
    title: "Jang Max's 21st",
    sub: "Pool 8 • Drinks • Games",
    pass: "Pass #2026-VIP",     // decorative label under the code
    countdownLabels: { days: "Days", hours: "Hours", minutes: "Minutes", seconds: "Seconds" },
    liveText: "It's happening now.",
  },

  /* ---------- COPY ---------- */
  copy: {
    heroInvite: "You are invited",
    introLabel: "01 — The mood",
    intro: "Low lights. Red felt. One more year and the same old table — only the stakes are higher. Come break the rack with me.",
    roomLabel: "02 — The room",
    roomHeading: ["Dim lights.", "Red felt."],
    roomCaption: "One table, a few good lamps and everyone you like in the same room.",
    galleryLabel: "03 — The details",
    galleryHeading: "Look closer",
    typeLines: ["Pool", "Drinks", "Good company"],   // giant scrolling words
    inviteLabel: "05 — The invitation",
    inviteHeading: ["You're", "invited"],
    inviteLead: "Save the night. Everything you need is below.",
    breakLabel: "04 — Warm-up",
    breakHeading: "Break the rack",
    breakHint: "Tap the table to shoot the white ball.",
    breakButton: "Re-rack",
    finaleLine: "Let's play",
    finaleSub: "See you at the table.",
  },

  /* ---------- LABELS FOR THE DETAILS (change language here) ---------- */
  labels: {
    date: "Date", time: "Time", venue: "Venue", address: "Address",
    dressCode: "Dress code", notes: "Notes",
    tbd: "To be announced",
    openMaps: "Open in Naver Map",
    register: "Get your ticket",
    addCalendar: "Add to calendar",
    backToDetails: "Back to the ticket",
  },

  /* ---------- REGISTRATION (Google Form) ----------
     Guests press "Get your ticket" (on the ticket) and fill this form. */
  rsvp: {
    formUrl: "https://forms.gle/Zx8kpmZYu1GF1kp38",
    labels: {},
  },

  /* ---------- LINKS (leave url "" to hide) ---------- */
  social: [
    { label: "Instagram", url: "" },
    { label: "Telegram",  url: "" },
  ],

  /* ---------- SCROLLING TICKER ---------- */
  ticker: ["Birthday Night", "Let's play", "Pool", "Drinks", "Good company"],

  /* ---------- PHOTOS (files live in the images/ folder) ----------
     Replace a file with the same name, or point to a new one.        */
  images: {
    hero:    { src: "images/hero-panel.jpg",       alt: "A pool table with red felt under warm hanging lamps in a dark room" },
    room:    { src: "images/room-wide.jpg",        alt: "Pool table seen from the side, balls racked on red felt" },
    introA:  { src: "images/lamps.jpg",            alt: "Three warm pendant lamps over the table" },
    introB:  { src: "images/cocktails.jpg",         alt: "Hands holding cocktails with olives and ice in a dark bar" },
    stripA:  { src: "images/cocktails.jpg",         alt: "Hands holding cocktails with olives and ice" },
    stripB:  { src: "images/crowd.jpg",             alt: "Guests dancing at a crowded bar party" },
    stripC:  { src: "images/casino.jpg",            alt: "Playing cards, casino chips and a roulette wheel" },
    poster:  { src: "images/poster-with-text.jpg", alt: "Invitation poster: Birthday Night, Let's play" },
    finale:  { src: "images/room-wide.jpg",        alt: "The pool table, waiting" },
  },
  gallery: [   // order here = order on the page. size: "wide" | "tall" | "square"
    { src: "images/lamps.jpg",            alt: "Pendant lamps",            caption: "Light",  size: "wide" },
    { src: "images/poster-with-text.jpg", alt: "The invitation poster",    caption: "The invite", size: "tall" },
    { src: "images/crowd.jpg",            alt: "Guests dancing at a bar party", caption: "The crowd", size: "wide" },
    { src: "images/wall.jpg",             alt: "Wall posters and shelves", caption: "The wall", size: "wide" },
    { src: "images/cocktails.jpg",        alt: "Hands holding cocktails",  caption: "Drinks", size: "tall" },
    { src: "images/corner.jpg",           alt: "Wood and brass table corner", caption: "Brass", size: "square" },
    { src: "images/casino.jpg",           alt: "Cards, chips and roulette", caption: "Games", size: "wide" },
    { src: "images/pool-brick.jpg",       alt: "Pool table against a brick wall", caption: "The table", size: "wide" },
    { src: "images/balls.jpg",            alt: "Racked balls",             caption: "The rack", size: "wide" },
  ],

  /* ---------- COLOURS ---------- */
  theme: {
    ink:   "#0b0908",   // near-black background
    cream: "#eadfcb",   // main text on dark
    felt:  "#a8121b",   // red (felt)
    hot:   "#d6131d",   // loud red of the countdown + pass page
    amber: "#d9a45b",   // lamp-light accents
    paper: "#e9e3d6",   // light invitation section
  },

  /* ---------- MOTION ---------- */
  motion: {
    enabled: true,      // false = no scroll animation at all
    intensity: 1,       // 0.5 calmer … 1.5 more dramatic
    // Extra effects — switch any of them off individually:
    effects: {
      spotlight: true,       // warm lamp-light follows the pointer over hero + finale photos (desktop)
      ballProgress: true,    // an 8-ball rolls along the bottom edge as you scroll
      rackBreak: true,       // playable pool-break animation
      scramble: true,        // date / venue "decode" into place
      tickerVelocity: true,  // ticker speeds up (and reverses) with your scroll
      cardTilt: true,        // gallery cards tilt in 3D under the pointer (desktop)
      heroParallax: true,    // hero photo and title drift against the pointer (desktop)
      confetti: true,        // short paper burst when someone answers "I'm in"
    },
  },

  /* ---------- OPTIONAL SECTIONS (true / false) ---------- */
  sections: { intro: true, room: true, gallery: true, rackBreak: true, typeBand: true, invitation: true, punch: true, ticket: true, finale: true },
};
