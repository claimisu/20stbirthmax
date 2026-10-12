# Birthday Night — invitation site

No build step. Open `index.html` in a browser (or run `python3 -m http.server` in this folder and visit localhost:8000).

## Edit
- **All text, date, time, venue, address, colours, motion:** `js/siteConfig.js` (one file, commented).
- **Photos:** `images/`. Replace a file with the same name, or change the path in `siteConfig.js` (`images` and `gallery`). Gallery order = order of the list.
- **Date/time:** `event.dateISO` ("2026-10-16") and `event.startTime` ("20:00"). The calendar button works as soon as both are set.
- **Maps button:** paste a share link into `event.mapsUrl`, or just fill venue + address.
- **Turn sections off:** `sections: { gallery: false }`.
- **Calmer/stronger motion:** `motion.intensity` (0.5–1.5) or `motion.enabled: false`.

## Tickets / registration (Google Form)
`rsvp.formUrl` in `siteConfig.js` holds the Google Form link. When it is set, the "Get your ticket" button on the ticket opens the form. The address is set in `event.address` and the map button in `event.mapsUrl`.

## Publish on GitHub Pages
1. Create a new repository on GitHub (e.g. `birthday-invitation`) and upload everything from this folder so that `index.html` is in the **root** of the repo.
2. Open **Settings → Pages**. Under **Build and deployment** choose **Deploy from a branch**, branch `main`, folder `/ (root)`, then **Save**.
3. After a minute the site is live at `https://<your-username>.github.io/<repo-name>/`.

Notes:
- All paths are relative, so the site works both from a repo subfolder URL and from a custom domain.
- File names are case-sensitive on GitHub (`images/Crowd.jpg` ≠ `images/crowd.jpg`).
- The repo is public on a free account, so everything in `siteConfig.js` (name, venue, address) is public. Don't put a private home address in it if the repo is public.
- Other hosts also work: Netlify Drop, Vercel, Cloudflare Pages.

## Better photos
The pool image was low-resolution, so crops are soft. Drop in full-size originals (JPG, ~2000px wide, under 400 KB each) with the same file names for a sharper result.

## Extra animations (v2)
All can be switched off one by one in `siteConfig.js` → `motion.effects`:
spotlight (lamp light follows the pointer), ballProgress (8-ball rolls along the bottom as you scroll), rackBreak (playable pool break — tap the table to shoot), scramble (date/venue decode), tickerVelocity (ticker reacts to scroll speed/direction), cardTilt, heroParallax, confetti (on "I'm in"). Hero/section titles also enter letter by letter.

## Countdown + VIP pass
Section near the end (countdown to `event.dateISO` + `event.startTime`, plus a ticket). Texts live in `siteConfig.js` → `ticket`. Turn off with `sections.ticket: false`. The 8-ball on the ticket is decorative.

## Fonts
Headings: Archivo (condensed, heavy sans) via `--display` at the top of `css/style.css`; body: Jost; Korean text: Noto Sans KR. To change one, edit the Google Fonts link in `index.html` and the `--display` / `--sans` variables. The handwritten "Let's play" uses `--script`.

## Punch! Club (communal punch + ingredient claiming)
A section between the invitation and the ticket. Files: `js/punchConfig.js` (all settings and the ingredient list — the only file you edit), `js/punch.js` (logic and bowl animation), `css/punch.css`. Turn it off with `sections.punch: false` in `siteConfig.js`.

**Edit the ingredients.** In `punchConfig.js`, each item has `name`, `desc`, `icon`, `portions` (how many guests can bring it) and `claimed` (how many are already taken). Add or remove lines freely; icons are listed in the comment at the top of that file. Numbers in the progress area: `expectedGuests`, `targetContributions`, `maxPerGuest`.

**What is real and what is not.** The page shows the `claimed` numbers you type in. With only a Google Form it cannot read new answers back, so those numbers do not update by themselves, and two guests can pick the last portion at the same moment. `sampleData: true` shows invented numbers with a "SAMPLE DATA" label — keep it `false` for the real party. If neither `formUrl` nor `endpoint` is set, the section runs in preview mode and says nothing is saved.

**Option A — Google Form (simplest).** Create a form with 4 questions: name, ingredient (short answer), portions (short answer), note (optional). Copy its link (the long `.../viewform` one) into `formUrl`. To pre-fill the answers: in the form menu (⋮) choose **Get pre-filled link**, type any text in each field, press **Get link**, and copy it. In that link you will see `entry.123456789=...` for each question — put those ids into `formFields` (`name`, `ingredient`, `quantity`, `note`). When a guest confirms, the form opens in a new tab with their answers filled in, and they press Submit there. Until they do, nothing is saved. **Where you track it.** In the form, open **Responses → Link to Sheets**. That Google Sheet is your permanent list of who brings what (bookmark it). For totals per ingredient, add a tab with `=QUERY('Form responses 1'!C:D,"select C, sum(D) where C is not null group by C label sum(D) 'Portions'",1)`.

**Make the page show what is already taken (no code).** In that responses sheet choose **File → Share → Publish to web**, pick the sheet and **Comma-separated values (.csv)**, press Publish, and paste the link into `claimsCsvUrl`. If your form questions are not in the order name, ingredient, portions, note, change `csvColumns` (counted from 0; column 0 is the timestamp). The page reads the sheet when it opens, matches the ingredient column to the ingredient names, and fills the "Available" numbers from it. Published sheets can be a few minutes behind, and two guests can still pick the same last portion at once. Not tested against a live published sheet.

**Option B — Google Sheet with a small script (recommended if you want live availability).** Follow the steps at the top of `docs/google-sheets/Code.gs`, then paste the web-app URL into `endpoint`. The page then reads the taken portions from the sheet when it loads and saves each contribution into it, without sending the guest away. The script also creates a "Summary" tab with totals per ingredient; the "Contributions" tab is your list of guests. The script checks the remaining portions inside a lock, so two guests cannot take the same last portion; the second one gets a "someone just took it" message. (Written to the Apps Script docs but not tested against a live deployment — try it with a test sheet first.) No API keys are involved; the web-app URL is meant to be public.
