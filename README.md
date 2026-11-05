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
