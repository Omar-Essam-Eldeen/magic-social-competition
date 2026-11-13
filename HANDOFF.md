# Magic Social — Competition Upgrade: Handoff

**What this is:** the competition upgrade of your deployed Mantine app.
React 19 + Vite + TypeScript + Mantine 9. **Live** at the stable
production address **https://magic-social-competition.vercel.app**
(repo: `Omar-Essam-Eldeen/magic-social-competition`, Vercel project
`magic-social-competition`, deployed 2026-11-12). Do NOT use the
first-deploy URL with the `5fq473ges` hash — that is a pinned
per-deployment snapshot and never updates; the address above is the
one that always serves the latest build. Deployment Protection is OFF.
This folder is the **Round 5** upgrade on top of Round 4 — the top 5
extras: @mentions that link to profiles, the native share sheet on
phones, composer drafts + emoji picker, real hashtag pages, and
notification tabs. Push this folder's `main` to the repo and Vercel
auto-deploys it to the same live link.

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

## Round 3 — App chrome: top navbar, filled sidebar, bottom-cards fix (2026-11-12)

You said the left sidebar had a big pointless empty space and the cards
at the bottom were cut off at the viewport and too sharp. Round 3 builds
on Round 2 (glass design kept):

- **N1 Sticky glass top navbar** (desktop + mobile): compact brand mark,
  center search synced with the feed via the `?q=` URL param (typing
  from any page jumps to the feed with the query applied), notifications
  bell with the unread badge → `/notifications`, "New post" button
  opening the full composer (drag-drop image + preview, char counter)
  as a modal, and the avatar dropdown menu: View profile / Change
  password / Log out. Keyboard-operable, closes on Escape/outside
  click, RTL-mirrored, reduced-motion safe.
- **N2 Sidebar filled:** gradient "Post" CTA under the nav items (same
  modal) + an "At a glance" glass card with real numbers only — posts,
  likes received, following. No dead space left.
- **N3 Back to top:** floating glass pill on all pages, appears after
  400px of scrolling, smooth scroll (instant under reduced motion),
  clears the mobile tab bar.
- **N4 Avatar menu consolidation:** the dropdown lives only in the top
  navbar now (Round 2 had it in the sidebar bottom); the sidebar bottom
  keeps just the EN/AR pill + theme toggle. On mobile the menu also
  carries the EN/AR pill + theme toggle, since phones have no sidebar.
- **N5 Bottom-cards fix:** 96px bottom padding on mobile / 56px on
  desktop, 28px sidebar bottom padding, and every card on the 22px
  glass radius token — including the change-password card, Trending /
  About cards, post cards and Explore tiles. No sharp or clipped
  corners anywhere, light + dark, desktop + mobile.
- **N6 Change password from the menu:** the avatar menu item goes to
  `/profile#change-password`, scrolls the card into view and focuses
  its first input. The existing form logic is untouched.

Two real bugs found in Round 3 verification and fixed: the create-post
modal's test hook sat on Mantine's zero-height Modal root (moved to the
visible inner wrapper), and the change-password deep-link scroll fired
before the posts list above it rendered, pushing the card off-viewport
(it now waits for profile AND posts to settle). Both fixed and
re-verified — see `STAGELOG.md`.

## Round 4 — Chrome polish: brand once, no hard line, full-height rounded sidebars (2026-11-12)

You said the navbar had a hard line breaking the design, the sidebars
still had sharp edges and didn't take the viewport height, the right
sidebar's bottom cards were half visible / half hidden, and the brand
logo + name should be in the navbar only — not also in the sidebar
underneath it. Round 4 builds on Round 3 (glass design kept):

- **R1 Brand in the navbar only:** the full brand (golden-M logo +
  "Magic Social" name) lives in the top navbar, left side. The
  duplicate brand block at the top of the left sidebar is gone — the
  sidebar starts directly with the nav items. Mobile keeps logo +
  name, compact.
- **R2 No hard divider line:** Mantine's own 1px AppShell borders are
  off (`withBorder={false}`) and the glass bar has no bottom border —
  separation is glass blur + a very subtle shadow and a 14px gradient
  fade under the header, so the bar blends into the page instead of
  slicing it. Glass-card borders (card definition) were kept.
- **R3 Full-height sidebars, rounded corners:** both rails stretch
  from below the navbar to the viewport bottom (Mantine's 60px footer
  offset no longer cuts them short on desktop). The visible glass
  lives on an inner panel inset 12px on every side with the 22px
  radius token, so the rounded corners are actually visible instead
  of clipped by the viewport edge. The sidebar bottom row (EN/AR pill
  + theme toggle) sits inside the panel with breathing room.
- **R4 Bottom cards fully reachable:** both rails scroll internally
  (independent of the page scroll) with bottom padding inside the
  scroll area, so the last card (About on the right, At-a-glance on
  the left) scrolls fully into view — never half visible / half
  hidden. The left rail's EN/AR + theme row is pinned at the panel
  bottom. The center feed keeps the page scroll; the rails stay put.

Two real bugs found in Round 4 verification and fixed: at short
viewport heights the rail cards squashed instead of scrolling (the
"View profile" button collapsed to 5px tall — flex children now
never shrink) and the back-to-top pill was unclickable on desktop
(the full-height rails sat above it — its z-index now sits above the
rails, below modals). Both fixed and re-verified — see `STAGELOG.md`.

## Round 5 — Top 5 extras: mentions, share sheet, drafts + emoji, hashtag pages, notification tabs (2026-11-13)

You asked what else could be built and tapped "Build the top 5".
Round 5 builds on Round 4 (glass design kept):

- **M1 @mentions:** `@username` in post, comment and reply bodies
  renders as a link to that user's profile. Resolution is
  client-side, from data the app already loads (suggestions, authors,
  likers, followers/following); a mention of a user not in that map
  stays plain text — never a broken link, never a guessed id. The
  composer has an @ autocomplete dropdown (suggestions first,
  keyboard + mouse).
- **M2 Native share sheet:** on phones the Share button opens the
  system share sheet (title + text + link); anywhere else it keeps
  the copy-link + toast behavior. Dismissing the sheet is silent; a
  real failure falls back to copy.
- **M3 Composer drafts + emoji picker:** composer text auto-saves to
  localStorage (per user, debounced) and is restored on mount;
  cleared after a successful post. Image attachments are NOT
  persisted — text only. A popover with 40 built-in emoji inserts at
  the caret; no new dependency.
- **M4 Hashtag pages:** new route `/tags/:tag` — tag header, count,
  and all loaded posts containing that tag, reusing PostCard and the
  feed query. Clicking a hashtag anywhere now goes to its page; the
  old `?q=` feed search still works.
- **M5 Notification tabs:** All / Comments / Follows on the
  notifications page, with per-tab unread badges; mark-one and
  mark-all-read keep working in every tab. Unknown future types
  appear under All only.

Three real bugs found in Round 5 verification and fixed: Escape
couldn't dismiss the @ autocomplete (a keyup handler reopened it);
a post-author mention stayed plain text in CommentItem for non-author
viewers (the post author now joins the mention map); axe
`nested-interactive` from mention/hashtag links inside the
top-comment preview button (the preview now renders plain text;
links still work on the details page). All fixed and re-verified —
see `STAGELOG.md`.

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

## What was tested — Round 3 (all 2026-11-12, throwaway accounts only)

| Check | Result |
|---|---|
| Functional pass — walk-the-8 + full regression + all Round 3 chrome (bell badge == API unread count, header search from another page, new-post modal from navbar AND sidebar CTA with image post, back-to-top appear/hide/scroll, avatar menu incl. change-password scroll+focus and logout→login, At-a-glance numbers, keyboard, reduced motion) | **96/96 PASS** |
| Visual + axe shots (Home, Explore, PostDetails, Profile, Bookmarks, Notifications, Login, Signup, Landing, Home RTL — light + dark, desktop + mobile, incl. fully-scrolled-to-bottom views) | **27/27 PASS, axe 0 violations** |
| Keyboard focus ring while tabbing | **12/12 stops visible** |
| Reduced motion (orbs static, no card tilt, back-to-top instant) | **PASS** |
| `npm run build` + `npm run lint` | **Green / clean** |

All probe posts, comments, replies, follows and bookmarks created during
testing were deleted/undone afterwards; testmagic99 is back to its
pre–Round 3 post count and testmagic3's password was changed and changed
back to `Test5678!`.

## What was tested — Round 4 (all 2026-11-12, throwaway accounts only)

| Check | Result |
|---|---|
| Functional pass — walk-the-8 + full regression + all Round 4 chrome (brand once in header, no hard line, rail heights/corners, aside scrolled to bottom, back-to-top click, navbar menu, new-post modal, keyboard, reduced motion) | **96/96 PASS** |
| Visual + axe shots (Home, Explore, PostDetails, Profile, Home RTL — light + dark, desktop + mobile, incl. 1280×800 laptop height and rails scrolled to bottom) | **79/79 PASS, axe 0 violations** |
| Keyboard focus ring while tabbing | **12/12 stops visible** |
| Reduced motion (orbs static, no card tilt, back-to-top instant) | **PASS** |
| `npm run build` + `npm run lint` | **Green / clean** |

All probe posts, comments, replies, follows and bookmarks created during
testing were deleted/undone afterwards; testmagic99 has 18 own posts
with zero probe posts left, followers 0 / following 0, and testmagic3's
password was changed and changed back to `Test5678!`.

## What was tested — Round 5 (all 2026-11-13, throwaway accounts only)

| Check | Result |
|---|---|
| Functional pass — walk-the-8 + full regression + all Round 5 features (mention links + unknown-username plain text, autocomplete keyboard/mouse/Escape, draft survives refresh + clears after posting, emoji inserts at caret, share fallback + stubbed share-sheet call, hashtag page + empty state, notification tabs + badges + mark-one/all-read, keyboard, reduced motion) | **101/101 PASS** |
| Visual + axe shots (Home, PostDetails, Notifications, TagPage, Profile, Explore — light + dark, desktop + mobile, RTL, incl. hashtag page, mention rendering, emoji popover, notification tabs) | **12/12 PASS, axe 0 violations** |
| Keyboard focus ring while tabbing | **Verified via real keyboard Tab** |
| Reduced motion | **PASS** |
| `npm run build` + `npm run lint` | **Green / clean** |

All probe posts, comments, replies, follows and bookmarks created during
testing were deleted/undone afterwards; testmagic3's password was changed
and changed back to `Test5678!`.

## How to deploy Round 5

The repo and Vercel project already exist (created for Round 1). Deploying
Round 5 is just a push — Vercel auto-deploys `main` to the stable
production address **https://magic-social-competition.vercel.app**:

```bash
npm install
npm run build        # must be green
git add -A
git commit -m "Round 5: mentions, share sheet, drafts + emoji, hashtag pages, notification tabs"
git push origin main
```

Wait a minute for Vercel to build, then open the live link and check the
new navbar loads. Verify anonymously: root 200 (not a redirect to a
Vercel login page), new bundle hash, title "Magic Social", `/login` 200,
`manifest.webmanifest` 200, service worker 200. If the link ever shows a
Vercel login wall instead of the site, Deployment Protection turned
itself back on: Vercel project Settings → Deployment Protection → OFF.

(Deploying from scratch instead? Create a NEW empty repo, push this folder
to it, then import it as a NEW Vercel project with the Vite preset and no
env vars. The `vercel.json` in the project already handles deep links, so
refreshing a post page works.)

After deploy, run the walk-the-8 once on your link
(see `docs/COMPETITION-CHECKLIST.md`) and confirm the site loads.

## Still open

- **Competition name / deadline / judging criteria — unknown.** Asked
  Nov 11, no reply yet. Only known: share the project on LinkedIn and
  mention the organizers, weeks left, organizer LinkedIn handle not
  given yet. Needed before you submit.
- `@testmagic99` has 7 unread notifications from other users — pre-existing,
  not from our testing, left as-is.
- Throwaway avatars are the uploaded favicon (no un-upload endpoint exists) —
  harmless, throwaway accounts only.

Full detail: `STAGELOG.md`. API facts for the future Flutter rebuild:
`API-REFERENCE.md`. Submission checklist: `docs/COMPETITION-CHECKLIST.md`.
