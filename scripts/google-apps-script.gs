/**
 * Baby Shower RSVP Backend — Google Apps Script
 *
 * SETUP (one-time, ~5 minutes):
 * 1. Go to https://script.google.com → New project
 * 2. Paste this entire file, save as "Baby Shower RSVP"
 * 3. Run → setupSheet (authorize when prompted)
 * 4. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the Web App URL into js/config.js → rsvpScriptUrl
 * 6. Commit & push to GitHub
 *
 * RSVPs are stored in a Google Sheet linked to this script.
 * View the sheet directly or use admin.html on the site.
 */

const ADMIN_PASSWORD = "babyblue2026";
const SHEET_NAME = "RSVPs";

function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  const headers = ["Timestamp", "Name", "Email", "Attending", "Guests", "Message"];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  sheet.setFrozenRows(1);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getSheet_();

    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.name || "",
      data.email || "",
      data.attending || "",
      data.guests || 0,
      data.message || "",
    ]);

    return jsonResponse_({ ok: true });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}

function doGet(e) {
  const params = e.parameter || {};
  if (params.action !== "list") {
    return jsonResponse_({ ok: false, error: "Invalid action" });
  }
  if (params.password !== ADMIN_PASSWORD) {
    return jsonResponse_({ ok: false, error: "Invalid password" });
  }

  const sheet = getSheet_();
  const rows = sheet.getDataRange().getValues();
  const headers = rows.shift();
  const rsvps = rows
    .filter((row) => row[1])
    .map((row) => ({
      timestamp: row[0],
      name: row[1],
      email: row[2],
      attending: row[3],
      guests: row[4],
      message: row[5],
    }))
    .reverse();

  return jsonResponse_({ ok: true, rsvps });
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    setupSheet();
    sheet = ss.getSheetByName(SHEET_NAME);
  }
  return sheet;
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
