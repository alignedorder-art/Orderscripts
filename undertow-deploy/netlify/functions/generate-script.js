// netlify/functions/generate-script.js
//
// Proxies script-generation requests to the Anthropic API.
// Keeps the API key server-side (set ANTHROPIC_API_KEY in Netlify env vars).

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Missing ANTHROPIC_API_KEY environment variable on the server." }),
    };
  }

  let system, message;
  try {
    const parsed = JSON.parse(event.body || "{}");
    system = parsed.system;
    message = parsed.message || "Write the script now.";
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid request body." }) };
  }

  if (!system) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing system prompt." }) };
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2048,
        system,
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await res.json();
    return {
      statusCode: res.status,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message || "Failed to reach Anthropic API." }),
    };
  }
}
