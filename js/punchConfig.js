/* =====================================================================
   PUNCH! CLUB — settings and ingredient list.
   This is the ONLY file you edit for the punch section.
   The code that draws and animates it lives in js/punch.js.

   HOW CONTRIBUTIONS ARE COLLECTED (pick one, in this order of priority):
     1. endpoint  — a Google Apps Script web app that writes to a Google Sheet
                    and can reserve portions without two guests colliding.
                    (see README → "Punch! Club → Option B")
     2. formUrl   — a Google Form. The guest's answers are pre-filled and the
                    form opens in a new tab; the guest presses Submit there.
                    Add claimsCsvUrl and the page also shows what is taken.
     3. neither   — PREVIEW MODE. Everything works on screen, but NOTHING is
                    saved anywhere. The page says so.

   IMPORTANT — what is real and what is not:
     • "claimed" below is a number YOU type in (e.g. copied from your Sheet).
       With only a Google Form the page cannot update it by itself, and it
       cannot stop two guests from taking the same last portion.
     • sampleData: true shows invented numbers (sampleClaimed) with a visible
       "SAMPLE DATA" label. Keep it false for the real party.
   ===================================================================== */
window.PUNCH_CONFIG = {

  /* ---------- numbers shown in the progress area ---------- */
  expectedGuests: 14,        // placeholder: set to the real number of guests
  targetContributions: 14,   // portions needed for "THE PUNCH IS READY."
  maxPerGuest: 3,            // most portions one guest can take of one ingredient

  sampleData: false,         // true = show sampleClaimed numbers, labelled "SAMPLE DATA"

  /* ---------- where contributions go ---------- */
  formUrl: "",               // paste your Google Form link here (the long ".../viewform" link)
  formFields: {              // optional "entry.123456789" ids, to pre-fill the form
    name: "",                //   see README → "Punch! Club → Option A" for how to find them
    ingredient: "",
    quantity: "",
    note: "",
  },
  endpoint: "",              // paste your Google Apps Script web-app URL here (optional)

  /* Optional, works together with formUrl: lets the page SHOW what is already taken.
     Open the Form's responses sheet → File → Share → Publish to web → choose that sheet
     and "Comma-separated values (.csv)" → Publish → paste the link here.
     csvColumns = which sheet columns hold the ingredient and the portions (counting from 0;
     0 = Timestamp, 1 = first question, 2 = second question, ...). */
  claimsCsvUrl: "",
  csvColumns: { ingredient: 2, quantity: 3 },

  /* ---------- ingredients ----------
     id            unique, no spaces
     name, desc    shown on the card
     icon          one of: orange lemon lime apple pineapple strawberry grapes gummy jelly
                   marshmallow sour glass bottle ice mint starfruit mystery idea
     color         tint for icons that use one (gummy, jelly, sour, glass, bottle)
     portions      how many guests can bring it
     claimed       portions already taken (real number, set by you)
     sampleClaimed portions shown ONLY when sampleData is true
     bowl.perPortion  how many pieces appear in the bowl per claimed portion
     bowl.flat     true = slice that floats flat on the surface
     bowl.size     size of one piece in the bowl
     bowl.rise     (drinks) how much one portion raises the liquid level
     bowl.fizz     (sparkling water) extra bubbles per portion
     noteRequired  true = the guest must write something in the note field
  */
  categories: [
    { id: "fruits", label: "Fruits", items: [
      { id: "oranges",      name: "Oranges",      desc: "Fresh citrus for the ultimate punch.", icon: "orange",     portions: 4, claimed: 0, sampleClaimed: 2, bowl: { perPortion: 2, flat: true,  size: 54 } },
      { id: "lemons",       name: "Lemons",       desc: "Bright, sharp and very necessary.",    icon: "lemon",      portions: 3, claimed: 0, sampleClaimed: 1, bowl: { perPortion: 2, flat: true,  size: 50 } },
      { id: "limes",        name: "Limes",        desc: "A green kick for the glass.",          icon: "lime",       portions: 2, claimed: 0, sampleClaimed: 0, bowl: { perPortion: 2, flat: true,  size: 48 } },
      { id: "apples",       name: "Apples",       desc: "Thin crisp slices that float.",        icon: "apple",      portions: 2, claimed: 0, sampleClaimed: 0, bowl: { perPortion: 2, flat: true,  size: 50 } },
      { id: "pineapple",    name: "Pineapple",    desc: "Tropical rings and chunks.",           icon: "pineapple",  portions: 2, claimed: 0, sampleClaimed: 0, bowl: { perPortion: 2, flat: true,  size: 52 } },
      { id: "strawberries", name: "Strawberries", desc: "Sweet, red, impossible to miss.",      icon: "strawberry", portions: 2, claimed: 0, sampleClaimed: 0, bowl: { perPortion: 2, flat: false, size: 44 } },
      { id: "grapes",       name: "Grapes",       desc: "Little purple bobbers.",               icon: "grapes",     portions: 1, claimed: 0, sampleClaimed: 0, bowl: { perPortion: 2, flat: false, size: 46 } },
    ]},
    { id: "sweets", label: "Sweets", items: [
      { id: "gummy-bears",  name: "Gummy bears",    desc: "Tiny swimmers in every colour.",      icon: "gummy",       color: "#FF5D73", portions: 3, claimed: 0, sampleClaimed: 2, bowl: { perPortion: 3, flat: false, size: 40 } },
      { id: "jelly",        name: "Jelly candies",  desc: "Soft, shiny and fruity.",             icon: "jelly",       color: "#8E5BD9", portions: 2, claimed: 0, sampleClaimed: 0, bowl: { perPortion: 3, flat: false, size: 36 } },
      { id: "marshmallows", name: "Marshmallows",   desc: "Fluffy clouds on the surface.",       icon: "marshmallow",               portions: 1, claimed: 0, sampleClaimed: 0, bowl: { perPortion: 3, flat: false, size: 38 } },
      { id: "sour-candy",   name: "Sour candy",     desc: "For guests who like a plot twist.",   icon: "sour",        color: "#3DDC84", portions: 2, claimed: 0, sampleClaimed: 0, bowl: { perPortion: 3, flat: false, size: 38 } },
    ]},
    { id: "drinks", label: "Drinks & essentials", items: [
      { id: "orange-juice",    name: "Orange juice",    desc: "The sunny base of the punch.",     icon: "glass",  color: "#FF9A2E", portions: 2, claimed: 0, sampleClaimed: 1, bowl: { perPortion: 0, rise: 3 } },
      { id: "pineapple-juice", name: "Pineapple juice", desc: "Sweet and a little tropical.",     icon: "glass",  color: "#F6D04D", portions: 1, claimed: 0, sampleClaimed: 0, bowl: { perPortion: 0, rise: 3 } },
      { id: "lemonade",        name: "Lemonade",        desc: "Sour, sweet, ice cold.",           icon: "glass",  color: "#F3E27A", portions: 2, claimed: 0, sampleClaimed: 0, bowl: { perPortion: 0, rise: 3 } },
      { id: "sparkling-water", name: "Sparkling water", desc: "Adds the fizz.",                   icon: "bottle", color: "#8FD3F4", portions: 3, claimed: 0, sampleClaimed: 0, bowl: { perPortion: 0, rise: 2, fizz: 4 } },
      { id: "ice",             name: "Ice",             desc: "A big bag keeps it cold.",         icon: "ice",                     portions: 3, claimed: 0, sampleClaimed: 1, bowl: { perPortion: 2, flat: false, size: 40 } },
    ]},
    { id: "wild", label: "Wild cards", items: [
      { id: "mint",            name: "Mint leaves",       desc: "Fresh green for the finish.",            icon: "mint",      portions: 2, claimed: 0, sampleClaimed: 1, bowl: { perPortion: 2, flat: true,  size: 44 } },
      { id: "decorative-fruit",name: "Decorative fruit",  desc: "Star fruit, kumquats, anything pretty.", icon: "starfruit", portions: 1, claimed: 0, sampleClaimed: 0, bowl: { perPortion: 2, flat: true,  size: 46 } },
      { id: "mystery",         name: "A mystery ingredient", desc: "Surprise us. Within reason.",         icon: "mystery",   portions: 2, claimed: 0, sampleClaimed: 0, bowl: { perPortion: 1, flat: false, size: 40 } },
      { id: "own-idea",        name: "Bring your own idea",  desc: "Tell us what you have in mind.",      icon: "idea",      portions: 3, claimed: 0, sampleClaimed: 0, noteRequired: true, bowl: { perPortion: 1, flat: false, size: 38 } },
    ]},
  ],
};
