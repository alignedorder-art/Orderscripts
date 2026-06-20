/**
 * Code.gs — Undertow Script Lab backend
 *
 * Deploy this attached to a Google Sheet:
 *   1. In the Sheet: Extensions > Apps Script
 *   2. Paste this file's contents in, replacing the default code
 *   3. Deploy > New deployment > type "Web app"
 *        - Execute as: Me
 *        - Who has access: Anyone with the link
 *   4. Copy the Web app URL (ends in /exec) into Netlify as
 *      GOOGLE_SHEETS_WEBAPP_URL
 *
 * A "Scripts" tab is created automatically on first use.
 */

const SHEET_NAME = "Scripts";
const HEADERS = [
  "id", "savedAt", "themeId", "themeLabel", "triggerId", "triggerLabel",
  "durationId", "durationLabel", "title", "hook", "body", "cta",
  "onScreenText", "caption"
];

function doGet(e) {
  const action = e.parameter.action;
  if (action === "list") return jsonOut(listScripts());
  return jsonOut({ error: "Unknown action" });
}

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonOut({ error: "Invalid request body" });
  }
  if (body.action === "save") return jsonOut(saveScript(body.record));
  if (body.action === "delete") return jsonOut(deleteScript(body.id));
  return jsonOut({ error: "Unknown action" });
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
  }
  return sheet;
}

function listScripts() {
  const sheet = getSheet();
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return { items: [] };
  const headers = values[0];
  const items = values.slice(1)
    .filter((row) => row[0] !== "")
    .map((row) => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i]; });
      obj.onScreenText = obj.onScreenText ? String(obj.onScreenText).split("|||") : [];
      return obj;
    });
  items.sort((a, b) => (Number(b.savedAt) || 0) - (Number(a.savedAt) || 0));
  return { items };
}

function saveScript(record) {
  if (!record || !record.id) return { error: "Missing record" };
  const sheet = getSheet();
  sheet.appendRow([
    record.id,
    record.savedAt,
    record.themeId || "",
    record.themeLabel || "",
    record.triggerId || "",
    record.triggerLabel || "",
    record.durationId || "",
    record.durationLabel || "",
    record.title || "",
    record.hook || "",
    record.body || "",
    record.cta || "",
    (record.onScreenText || []).join("|||"),
    record.caption || "",
  ]);
  return { ok: true };
}

function deleteScript(id) {
  if (!id) return { error: "Missing id" };
  const sheet = getSheet();
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
  return { ok: true };
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
