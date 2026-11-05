// Google Apps Script: shared leaderboard stored in the Google Sheet this script is attached to.
const SHEET = 'Scores', MAX = 30;
function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(SHEET);
  if (!s) { s = ss.insertSheet(SHEET); s.appendRow(['t', 'name', 'score', 'pct']); }
  return s;
}
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function doGet() {
  const rows = sheet_().getDataRange().getValues().slice(1)
    .map(r => ({ t: Number(r[0]), name: String(r[1]), score: Number(r[2]), pct: Number(r[3]) }))
    .filter(r => r.name && isFinite(r.score));
  rows.sort((a, b) => b.score - a.score || a.t - b.t);   // best first; ties: earlier run ranks higher
  return out_(rows.slice(0, 10));
}
function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    let name = String(d.name || '').trim().slice(0, 20);
    const score = Number(d.score);
    if (!name || !(score >= 0 && score <= MAX)) return out_({ ok: false });
    if (/^[=+\-@]/.test(name)) name = "'" + name;          // stop spreadsheet formula injection
    let t = Number(d.t); if (!isFinite(t) || Math.abs(t - Date.now()) > 864e5) t = Date.now();
    const lock = LockService.getScriptLock(); lock.waitLock(5000);
    sheet_().appendRow([t, name, score, Math.round(score / MAX * 100)]);
    lock.releaseLock();
    return out_({ ok: true });
  } catch (err) { return out_({ ok: false }); }
}
