// Google Apps Script: shared leaderboards stored in the Google Sheet this script is attached to.
// One tab per module. To add a module: add a line to MODULES, then Deploy > Manage deployments > Edit > New version.
const MODULES = {
  'case-drill':  { sheet: 'Scores',             cap: 90, legacy: 30 },   // module 1 (also used when no module is sent); rows saved before max existed were out of 30
  'irregular47': { sheet: 'Scores_irregular47', cap: 100 },   // module 2
  'regular-verbs': { sheet: 'Scores_regular',   cap: 40  },    // module 3 (old combined version, kept so its scores stay readable)
  'praeteritum':   { sheet: 'Scores_praeteritum', cap: 40 },    // module 3a
  'perfekt':       { sheet: 'Scores_perfekt',   cap: 40  },    // module 3b
  'cafe':          { sheet: 'Scores_cafe',      cap: 40  }     // module 4 (Café Deutsch)
};
function mod_(name) { return MODULES[name || 'case-drill']; }
function sheet_(m) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(m.sheet);
  if (!s) { s = ss.insertSheet(m.sheet); s.appendRow(['t', 'name', 'score', 'pct', 'max']); }
  return s;
}
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function doGet(e) {
  const m = mod_(e && e.parameter && e.parameter.module);
  if (!m) return out_([]);
  const rows = sheet_(m).getDataRange().getValues().slice(1)
    .map(r => ({ t: Number(r[0]), name: String(r[1]), score: Number(r[2]), pct: Number(r[3]), max: Number(r[4]) || m.legacy || m.cap }))
    .filter(r => r.name && isFinite(r.score));
  rows.sort((a, b) => b.pct - a.pct || b.score - a.score || a.t - b.t);   // best % first; ties: higher score, then earlier run
  return out_(rows.slice(0, 10));
}
function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    const m = mod_(d.module);
    if (!m) return out_({ ok: false });
    let name = String(d.name || '').trim().slice(0, 20);
    const score = Number(d.score);
    const max = d.max === undefined ? m.cap : Number(d.max);
    if (!name || !(max > 0 && max <= m.cap) || !(score >= 0 && score <= max)) return out_({ ok: false });
    if (/^[=+\-@]/.test(name)) name = "'" + name;          // stop spreadsheet formula injection
    let t = Number(d.t); if (!isFinite(t) || Math.abs(t - Date.now()) > 864e5) t = Date.now();
    const lock = LockService.getScriptLock(); lock.waitLock(5000);
    sheet_(m).appendRow([t, name, score, Math.round(score / max * 100), max]);
    lock.releaseLock();
    return out_({ ok: true });
  } catch (err) { return out_({ ok: false }); }
}
