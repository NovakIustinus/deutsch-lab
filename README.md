# Daniels Deutsch-Hütte

Static learning web apps for German (A1/A2). No build step; plain HTML/JS.

- `index.html` – landing page; module cards come from `modules.js`
- `modules/case-drill/` – gender + Nom/Akk/Dat drill (10 words per round)
- `tests/test_logic.js` – `node tests/test_logic.js`

## Publish on GitHub Pages
1. Create a new **public** repo (e.g. `deutsch-lab`), then from this folder:
   `git init && git add . && git commit -m "Deutsch-Hütte" && git branch -M main && git remote add origin <repo-url> && git push -u origin main`
2. Repo → Settings → Pages → Source: *Deploy from a branch* → `main` / `(root)` → Save.
3. Site appears at `https://<user>.github.io/<repo>/` after a minute.

## Add a module
Create `modules/<name>/index.html` and add one entry to `modules.js`.

## Shared top-10 leaderboard (Google Sheet)
Without setup the board only stores scores on one device. To share it across all devices:
1. sheets.google.com → new blank sheet.
2. Extensions → Apps Script → delete the sample code → paste `backend/Code.gs` → Save.
3. Deploy → New deployment → gear icon → **Web app**. Execute as: **Me**. Who has access: **Anyone**. Deploy → authorise (Advanced → continue → Allow).
4. Copy the Web app URL (ends in `/exec`). Opening it in a browser should show `[]`.
5. Put it in `config.js`: `window.LEADERBOARD_URL = "https://script.google.com/macros/s/…/exec";` and re-upload `config.js` to GitHub.
Later changes to `Code.gs` need Deploy → Manage deployments → Edit → New version.
The URL is in the public site code, so anyone could post a fake score; names on the board are public.

## Modules
- `modules/case-drill/` – der/die/das + Nom/Akk/Dat drill
- `modules/irregular-47/` – "47 Samurai" irregular verbs (English + Präsens/Präteritum/Perfekt typed out)
- `modules/praeteritum/` and `modules/perfekt/` – regular verbs, one tense each (person prompts). Both share the code and verb list in `modules/regular-verbs/` (verbs.js, logic.js, drill.js; the old index.html there just redirects)
Each module has its own leaderboard tab. After changing `backend/Code.gs`: paste it into Apps Script, then Deploy → Manage deployments → pencil → Version: New version → Deploy (the URL stays the same).
