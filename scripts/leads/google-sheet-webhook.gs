/**
 * Express Kitchens website leads → Google Sheet (Apps Script web app).
 *
 * Accepts the JSON payload the website posts (lib/leads/payload.ts) and appends one row per
 * lead. Unlike the old landing-page script, it is schema-less: every key in the payload becomes
 * a column, new keys are added to the header row automatically, and the fixed "core" columns
 * always come first so the sheet stays readable.
 *
 * SET-UP (once, about 3 minutes)
 *  1. Create a Google Sheet (e.g. "EK Website Leads"). Optional: rename the first tab "Leads".
 *  2. Extensions → Apps Script. Replace the editor contents with this file. Save.
 *  3. Deploy → New deployment → type "Web app".
 *       Execute as: Me.   Who has access: Anyone.   Deploy, authorise when asked.
 *  4. Copy the Web app URL (ends in /exec) into the website's LEAD_WEBHOOK_URLS variable,
 *     comma-separated with the Pabbly URL. Redeploy the Apps Script (Deploy → Manage deployments
 *     → edit → New version) whenever this file changes; the URL stays the same.
 *
 * Test from a terminal:
 *   curl -L -X POST '<web app url>' -H 'Content-Type: application/json' \
 *     -d '{"form_label":"Contact","name":"Test Person","email":"test@example.com","phone":"(860) 555-1234","message":"hello"}'
 */

var SHEET_NAME = 'Leads'; // falls back to the first sheet if this tab does not exist

// Always-first columns, in this order. Anything else the payload carries is appended after.
var CORE_COLUMNS = [
  'received_at',
  'form_label',
  'name',
  'email',
  'phone',
  'zip',
  'state',
  'store',
  'message',
  'preference',
  'design_option',
  'appointmentDate',
  'time',
  'budget',
  'layout',
  'timing',
  'company',
  'projectType',
  'source',
  'page_url',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'gclid',
  'fbclid',
  'date',
  'timestamp',
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000); // two leads in the same second must not fight over the header row
  try {
    var payload = parseBody_(e);
    var sheet = getSheet_();
    var header = ensureHeader_(sheet, payload);
    var row = header.map(function (key) {
      if (key === 'received_at') return Utilities.formatDate(new Date(), 'America/New_York', 'yyyy-MM-dd HH:mm:ss');
      var v = payload[key];
      if (v === undefined || v === null) return '';
      return typeof v === 'object' ? JSON.stringify(v) : String(v);
    });
    // Write the row as plain text so ZIPs keep their leading zero (every CT ZIP starts with 0)
    // and phone numbers / ids are never reinterpreted as numbers or dates.
    var nextRow = sheet.getLastRow() + 1;
    var range = sheet.getRange(nextRow, 1, 1, row.length);
    range.setNumberFormat('@');
    range.setValues([row]);
    return json_({ ok: true, row: nextRow });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Browser GET: a quick health check.
function doGet() {
  return json_({ ok: true, sheet: getSheet_().getName(), columns: getSheet_().getLastColumn() });
}

function parseBody_(e) {
  var raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
  try {
    var data = JSON.parse(raw);
    return data && typeof data === 'object' ? data : {};
  } catch (err) {
    // Form-encoded fallback (e.parameter holds the fields)
    return (e && e.parameter) || {};
  }
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
}

/** Returns the header row (array of keys), adding columns for any payload keys not yet present. */
function ensureHeader_(sheet, payload) {
  var lastCol = sheet.getLastColumn();
  var header = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(String) : [];
  var changed = false;

  if (header.length === 0) {
    header = CORE_COLUMNS.slice();
    changed = true;
  }

  Object.keys(payload).forEach(function (key) {
    if (header.indexOf(key) === -1) {
      header.push(key);
      changed = true;
    }
  });

  if (changed) {
    sheet.getRange(1, 1, 1, header.length).setValues([header]);
    sheet.getRange(1, 1, 1, header.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return header;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
