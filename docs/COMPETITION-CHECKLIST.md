# Competition Submission Checklist — Magic Social

**Live demo:** https://socialapp-seven-phi.vercel.app/
⚠️ That link currently points at the **pre-upgrade** build. It only shows
this upgrade **after** you deploy this copy (see "Before you submit").

## README

- [x] README rewritten: features, tech stack, screenshots, live demo link,
      getting-started commands.
- [x] `HANDOFF.md` (one-page summary) and `API-REFERENCE.md` (verified API
      facts for the future Flutter rebuild) included in the project root.

## Screenshots (`docs/screenshots/` — 8)

- [x] `landing-desktop-light.png` — landing page
- [x] `feed-desktop-light.png` — home feed, light mode
- [x] `feed-desktop-dark.png` — home feed, dark mode
- [x] `profile-desktop-light.png` — profile with change password
- [x] `post-details-desktop-light.png` — post details & comments
- [x] `notifications-desktop-light.png` — notifications with unread badge
- [x] `feed-mobile-light.png` — mobile feed
- [x] `feed-desktop-arabic-rtl.png` — Arabic / RTL feed

## Demo script (2 minutes)

1. **Landing (0:00)** — hero, features, Log in / Sign up.
2. **Sign up (0:15)** — create an account; land straight on the feed.
3. **Feed (0:30)** — scroll real posts; flip All / Following / My posts;
   infinite scroll loads more.
4. **Post with photo (0:45)** — composer, add an image, post appears at the top.
5. **Like / comment / reply (1:00)** — like a post (count pops), open it,
   comment, reply nested under the comment.
6. **Follow (1:20)** — follow someone from "Who to follow"; their posts
   appear under Following.
7. **Notifications (1:30)** — bell badge, open the page, click a
   notification to jump to the post, "Mark all read".
8. **Profile (1:40)** — your posts, counts, upload a new profile photo.
9. **Arabic + dark (1:50)** — toggle to Arabic (whole layout flips RTL),
   toggle dark mode. Done.

## Before you submit

- [ ] **Deploy this copy** (see `HANDOFF.md` — push from your machine;
      Vercel redeploys automatically). Nothing was pushed by us.
- [ ] **Re-run the walk-the-8 on the live URL** after deploy: signup, login,
      feed, post details + comments, profile, post create/edit/delete,
      comment create/edit/delete, change password (confirm you stay logged in).
- [ ] **Confirm the competition name and deadline** — still unknown (asked
      Nov 11, no reply). Don't submit blind.
- [ ] Check the judging criteria when known — if a demo video or a specific
      format is required, record the demo script above against the live site.
- [ ] Sanity-check the 8 screenshots against the live site after deploy;
      re-shoot any that no longer match.

## Verification already done (2026-11-11, full detail in `STAGELOG.md`)

- Walk-the-8: **11/11 PASS** · Feature pass: **all PASS** · API sweep: **11/11 PASS**
- RTL visual check: **PASS** · axe accessibility (7 pages): **0 violations**
- PWA end-to-end: **PASS** · Clean install (`npm ci` → build → lint): **green**
- Zero app defects found in final verification.
