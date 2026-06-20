# Undertow — Aligned Order Script Lab

A daily script generator for short-form and YouTube video scripts, built on the
StoryBrand framework (the unconscious mind as the villain). Pick a theme, a
trigger, and a duration — Claude writes the script live. Save the ones you
like to a Google Sheet you can browse from anywhere.

This is a normal Vite + React site with two small Netlify Functions acting as
server-side proxies, so your API key never touches the browser:

- `netlify/functions/generate-script.js` → calls the Anthropic API
- `netlify/functions/sheets-proxy.js` → reads/writes your Google Sheet

---

## 1. Set up the Google Sheet backend

1. Create a new Google Sheet (any name, e.g. "Undertow Scripts").
2. In the Sheet menu: **Extensions > Apps Script**.
3. Delete the placeholder code and paste in the contents of
   `google-apps-script/Code.gs` from this project.
4. Click **Deploy > New deployment**.
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone with the link**
5. Click **Deploy**, authorize the script when prompted, and copy the
   **Web app URL** (it ends in `/exec`). You'll need this in step 4 below.

A "Scripts" tab will be created automatically in the sheet the first time you
save a script.

## 2. Get an Anthropic API key

Grab one from [console.anthropic.com](https://console.anthropic.com) if you
don't already have one set up for server-side use. You'll add this as an
environment variable in Netlify, never in the code itself.

## 3. Push this project to GitHub

Using the browser (no terminal needed):

1. Go to [github.com/new](https://github.com/new) and create a new repository
   (e.g. `undertow-script-lab`). Keep it private if you'd like.
2. On the new repo's page, click **uploading an existing file**.
3. Drag the entire contents of this project folder into the upload box
   (drag the `src` and `netlify` folders along with the root files — modern
   browsers preserve the folder structure on drag-and-drop). Do **not**
   upload `node_modules` if you ever generate one locally.
4. Commit directly to `main`.

## 4. Connect Netlify

1. Go to [app.netlify.com](https://app.netlify.com) and click
   **Add new site > Import an existing project**.
2. Choose **GitHub** and select your new repo.
3. Build settings (Netlify should auto-detect these from `netlify.toml`,
   but confirm):
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
4. Before the first deploy (or right after, then redeploy), go to
   **Site configuration > Environment variables** and add:
   - `ANTHROPIC_API_KEY` — your key from step 2
   - `GOOGLE_SHEETS_WEBAPP_URL` — the Apps Script URL from step 1
5. Click **Deploy site**.

Once it finishes building, your site is live at the Netlify URL (you can
attach a custom domain later the same way you did for `alignedorder.com`).

## Updating later

Same workflow as your other projects: edit files in the GitHub web UI (or
re-upload changed files), commit, and Netlify redeploys automatically.

## Local development (optional)

```
npm install
npm run dev
```

Note: the AI generation and history features call `/.netlify/functions/...`,
which only run through the Netlify CLI (`netlify dev`) or once deployed —
plain `npm run dev` will show the UI but those calls will fail locally
unless you install the Netlify CLI and run `netlify dev` instead.
