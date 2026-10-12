/* =====================================================================
   PUNCH! CLUB — Google Apps Script (the Google Sheet is the source of truth)

   SETUP
   1. Create a new Google Sheet.  Extensions → Apps Script.
   2. Delete the sample code and paste this whole file.  Save.
   3. Deploy → New deployment → type "Web app".
        Execute as: Me      Who has access: Anyone
      Authorise when asked, then copy the Web app URL.
   4. Paste that URL into  endpoint: ""  in js/punchConfig.js.
   5. After you change this script, use Deploy → Manage deployments → Edit →
      "New version", otherwise the old version keeps running.

   WHAT IT DOES
   - doGet  → returns how many portions of each ingredient are taken.
   - The first run also creates a "Summary" tab: totals per ingredient, always up to date.
     The "Contributions" tab lists every guest, what they bring and their note.
   - doPost → checks the remaining portions and writes the row inside a lock,
              so two guests cannot take the same last portion.
   Note: "portions" is sent by the web page (from punchConfig.js). That is fine
   for a private party; it is not meant to resist a determined attacker.
   Not tested against a live deployment in the project where this was written.
   ===================================================================== */
var SHEET_NAME = 'Contributions';

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) { sh = ss.insertSheet(SHEET_NAME); sh.appendRow(['Time', 'Name', 'Ingredient ID', 'Ingredient', 'Quantity', 'Note', 'Portions available']); }
  if (!ss.getSheetByName('Summary')) {      // host view: who brings what, and totals per ingredient
    var sum = ss.insertSheet('Summary');
    sum.getRange('A1').setFormula('=QUERY(Contributions!D:E,"select D, sum(E) where D is not null group by D label sum(E) \'Portions taken\'",1)');
  }
  return sh;
}
function claims_(sh) {
  var rows = sh.getDataRange().getValues(), out = {};
  for (var i = 1; i < rows.length; i++) { var id = rows[i][2]; if (id) out[id] = (out[id] || 0) + Number(rows[i][4] || 0); }
  return out;
}
function clean_(v, max) {            // stop text that starts with = + - @ from being read as a formula
  var s = String(v == null ? '' : v).slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function doGet() { return json_({ ok: true, claims: claims_(sheet_()) }); }

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var p = JSON.parse(e.postData.contents), sh = sheet_(), claims = claims_(sh);
    var qty = Math.floor(Number(p.quantity)), portions = Math.floor(Number(p.portions));
    if (!p.name || !p.ingredientId || !(qty >= 1) || !(portions >= 1)) return json_({ ok: false, error: 'bad_request', claims: claims });
    if ((claims[p.ingredientId] || 0) + qty > portions) return json_({ ok: false, error: 'sold_out', claims: claims });
    sh.appendRow([new Date(), clean_(p.name, 60), clean_(p.ingredientId, 60), clean_(p.ingredient, 60), qty, clean_(p.note, 200), portions]);
    claims[p.ingredientId] = (claims[p.ingredientId] || 0) + qty;
    return json_({ ok: true, claims: claims });
  } catch (err) {
    return json_({ ok: false, error: 'server_error' });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}
