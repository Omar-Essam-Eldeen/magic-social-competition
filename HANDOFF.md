# Magic Social — Competition Upgrade: Handoff

**What this is:** the competition upgrade of your deployed Mantine app.
React 19 + Vite + TypeScript + Mantine 9. **Round 1 is already live** at
https://magic-social-competition-5fq473ges-omar-essam-eldeen.vercel.app
(repo: `Omar-Essam-Eldeen/magic-social-competition`, deployed 2026-11-12).
This folder is the **Round 2** upgrade on top of it — cinematic glass
design is back, plus Explore, trending hashtags, followers/following
lists, a better composer, profile stats, and more. Push this folder's
`main` to the repo and Vercel auto-deploys it to the same live link.

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

## Round 2 — Cinematic glass return (2026-11-12)

You said the live Round 1 site looked plain and asked for the 3D
cinematic, glassy design back, the Arabic button as "AR", and log out in a
better place. Round 2 builds on Round 1 (nothing reverted except the
visuals):

- **D1 Glass system:** glass cards, gradient-mesh backdrop with three
  drifting orbs, glowing brand, Sora headings — light and dark both have
  real depth now. Reduced-motion safe (orbs freeze, card tilt off).
- **D2 Landing showcase:** big gradient headline, CSS-built mini feed
  mockup (no screenshots of user data), Log in / Sign up.
- **D3 Post cards alive:** hover lift + glow, image zoom, like burst,
  gradient avatar rings; hashtags in post text link to search.
- **D4 Cinematic profile:** gradient cover, glowing avatar ring, animated
  count-up stats — Posts, Followers, Following, **Likes received**.
- **D5 Micro-interactions + toasts:** like/bookmark/share/delete/follow all
  toast; follow/unfollow toasts were missing and are now wired in.
- **F1 Explore page** (`/explore`): photo grid of image posts, click a tile
  to open the post.
- **F2 Trending hashtags:** top tags from loaded posts in the sidebar;
  click one to search that tag.
- **F3 Followers / Following lists:** click the counts on any profile for
  the list, with follow buttons inside.
- **F4 Better composer:** drag-and-drop an image (with preview + remove),
  live character counter (display only — never blocks posting).
- **F5 Profile stats:** likes received = likes across your loaded posts.
- **F6 Share:** copies the post link + toast (keeps the share API call).
- **X1** Language button is now a clean `EN / AR` pill. **X2** Log out
  moved into a menu under your avatar (sidebar bottom, no new navbar).
  **X3** Profiles are clickable everywhere: Who-to-follow names, comment
  authors, likers, follower lists.

Two real bugs found in Round 2 verification and fixed: follow/unfollow
showed no toast at all (the dictionary strings existed but nothing called
them), and deleting/editing/liking a nested reply left the stale reply on
screen (the replies query was never invalidated). Both fixed and
re-verified — see `STAGELOG.md`.

## What was tested — Round 2 (all 2026-11-12, throwaway accounts only)

| Check | Result |
|---|---|
| Visual + axe shots (22 checks: landing, feed, explore, post details, profile, bookmarks, notifications, RTL, mobile) | **22/22 PASS, axe 0 violations** |
| Functional pass — walk-the-8 + all Round 2 features (signup, login, feed, post/comment/reply CRUD, profile, change password round-trip, explore, hashtags, trending, follow lists, drag-drop composer, toasts, AR pill, keyboard, reduced motion) | **49/49 PASS** |
| Keyboard focus ring while tabbing | **12/12 stops visible** |
| Reduced motion (orbs static, no card tilt) | **PASS** |
| `npm run build` + `npm run lint` | **Green / clean** |

All probe posts, comments, replies, follows and bookmarks created during
testing were deleted/undone afterwards; testmagic3's password was changed
and changed back to `Test5678!`.

## How to deploy Round 2

The repo and Vercel project already exist (created for Round 1). Deploying
Round 2 is just a push — Vercel auto-deploys `main`:

```bash
npm install
npm run build        # must be green
git add -A
git commit -m "Round 2: cinematic glass + explore, trending, follow lists"
git push origin main
```

Wait a minute for Vercel to build, then open the live link and check the
glass feed loads. If the link ever shows a Vercel login wall instead of
the site, Deployment Protection turned itself back on: Vercel project
Settings → Deployment Protection → OFF.

(Deploying from scratch instead? Create a NEW empty repo, push this folder
to it, then import it as a NEW Vercel project with the Vite preset and no
env vars. The `vercel.json` in the project already handles deep links, so
refreshing a post page works.)

After deploy, run the walk-the-8 once on your link
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
