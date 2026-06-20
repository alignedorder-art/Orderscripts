// netlify/functions/sheets-proxy.js
//
// Proxies script-history reads/writes to a Google Apps Script web app
// connected to a Google Sheet (see /google-apps-script/Code.gs).
// Set GOOGLE_SHEETS_WEBAPP_URL in Netlify env vars to your deployed
// Apps Script web app URL (ends in /exec).

export async function handler(event) {
  const url = process.env.GOOGLE_SHEETS_WEBAPP_URL;
  if (!url) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Missing GOOGLE_SHEETS_WEBAPP_URL environment variable on the server." }),
    };
  }

  try {
    if (event.httpMethod === "GET") {
      const res = await fetch(`${url}?action=list`);
      const data = await res.json();
      return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) };
    }

    if (event.httpMethod === "POST") {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: event.body,
      });
      const data = await res.json();
      return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) };
    }

    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message || "Failed to reach the Google Sheets backend." }),
    };
  }
}
