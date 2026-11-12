# Magic Social — Competition Upgrade: Handoff

**What this is:** the competition upgrade of your deployed Mantine app
([live site](https://socialapp-seven-phi.vercel.app/)). React 19 + Vite +
TypeScript + Mantine 9. This folder is a finished, fully verified copy —
**nothing was pushed and the live site is untouched**. You decide when to deploy it.

## What changed

- **Phase 0 — Audit:** full read of every file; 3 critical, 14 major, ~28 minor
  findings. No secrets in the code.
- **Phase 1 — Fixes:** every audit finding fixed — empty feed hiding the
  composer, crashes on missing post/comment authors, wrong types for
  profile / single post / likes, error boundaries, 404 route, retry states
  everywhere. Likers path found live: `GET /posts/:postId/likes` (not
  `/likers`, which 404s).
- **Phase 2 — Design:** glass skin retired; clean modern theme, real logo
  from your golden-M art, 3-column desktop layout, redesigned Profile,
  post lightbox, public landing page. Verified with screenshots, light +
  dark, desktop + mobile.
- **Phase 3 — Features:** suggestions + follow, notifications (bell, badge,
  page, mark read / mark all read), likers modal, profile-photo upload,
  public profiles, threaded replies, search. Notification paths were
  confirmed live first — never guessed. Two critical bugs found in
  verification (replies used the wrong endpoint; a suggestions 401 loop on
  the login page) — both fixed and re-verified.
- **Phase 4 — Arabic / RTL:** full RTL pass; 6 real defects found and fixed
  (handle alignment, bidi isolation, mobile header overflow, action-row wrap).
- **Phase 5 — Polish:** PWA (installable, service worker verified),
  code splitting (largest chunk 775 kB → 248 kB), accessibility pass —
  **axe 0 violations on all 7 pages**, visible keyboard focus everywhere.
- **Phase 6 — Final verification:** clean install, walk-the-8, full feature
  pass, API sweep — all green, zero app defects. See `STAGELOG.md`.

## What was tested (all 2026-11-11, throwaway accounts only)

| Check | Result |
|---|---|
| Walk-the-8 (signup → login → feed → post/comment CRUD → profile → change password, staying logged in) | **11/11 PASS** |
| Feature pass (likes, likers, bookmarks, share, filters, infinite scroll, image edit, follow, notifications, search, dark, Arabic, PWA, mobile) | **All PASS** |
| API sweep (11 endpoints incl. notifications + PWA files) | **11/11 PASS** |
| RTL visual check (Arabic, desktop + mobile, light + dark) | **PASS** |
| axe accessibility, 7 pages | **0 violations** |
| PWA (manifest, icons, service worker activated + controlling) | **PASS** |
| Clean install (`npm ci` → build → lint) | **Green** |

## How to deploy it (new repo + new Vercel)

1. On GitHub, create a NEW empty repository (any name, e.g.
   `magic-social-competition`). Don't add a README or .gitignore — leave it
   empty.
2. On your machine, extract the project folder and open a terminal in it:
   ```bash
   npm install
   npm run build        # must be green
   git init
   git add -A
   git commit -m "Competition upgrade"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<new-repo>.git
   git push -u origin main
   ```
3. On Vercel, create a NEW project and import the new repo. Framework
   preset: Vite. No environment variables needed — deploy.
4. You get a brand-new `.vercel.app` link. The `vercel.json` in the project
   already handles deep links, so refreshing a post page works.

After deploy, run the walk-the-8 once on your new link
(see `docs/COMPETITION-CHECKLIST.md`) and confirm the site loads.

## Still open

- **Competition name / deadline / judging criteria — unknown.** Asked
  Nov 11, no reply yet. Needed before you submit.
- `@testmagic99` has 7 unread notifications from other users — pre-existing,
  not from our testing, left as-is.
- Throwaway avatars are the uploaded favicon (no un-upload endpoint exists) —
  harmless, throwaway accounts only.

Full detail: `STAGELOG.md`. API facts for the future Flutter rebuild:
`API-REFERENCE.md`. Submission checklist: `docs/COMPETITION-CHECKLIST.md`.
