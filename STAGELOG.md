# Magic Social — Competition Upgrade Stage Log

Working copy: `~/workspace/predeploy/magic-social` (local only — NEVER push to
origin; push URL disabled). Live site untouched:
https://socialapp-seven-phi.vercel.app/

## Ground rules (restated)

- Throwaway accounts only for live testing (@testmagic99/Test1234!,
  @testmagic2/Test5678!, @testmagic3/Test5678!). Never the main account.
- No secrets in code. No guessed API paths — notification paths need
  Postman confirmation first; if unconfirmable, cut the feature and log why.
- Every phase ends with `npm run build` green + its checks passing.
- No database — the Route Academy API is the backend. If that ever changes,
  log it and tell the parent first instead of building one.
- Flutter rebuild for Android is a SEPARATE phase after this job is
  delivered. Keep the web work clean and API-faithful so the same
  endpoints/shapes can be reused there. Do not mix Flutter into this job.

## Open items (need the user — NOT blocking, work continues)

- Competition name + deadline + judging criteria: unknown. (Asked Nov 11;
  no reply yet.) Decides how much of Phase 3 fits.
- Notification API paths: unconfirmed. Postman check required in Phase 3.

## Phase 0 — Baseline & full audit (in progress)

- 2026-11-11: clone state confirmed — 4 commits, clean tree, push URL
  disabled (`no-push`).
- 2026-11-11: `npm install` + `npm run build` — GREEN (tsc + vite, 1.65s).
  One pre-existing warning: JS chunk 690 kB (209 kB gzip) — Phase 5
  performance item (code splitting).
- 2026-11-11: live smoke check (read-only) — deployed site HTTP 200,
  title "Magic Social", no 404. API root healthy.
- 2026-11-11: full audit completed (dedicated auditor subagent, read-only).
  3 critical, 14 major, ~28 minor findings. Secrets: NONE. window.confirm:
  NONE. `tsc --noEmit` clean; `npm run lint` fails with 2 errors (N-22).
  - CRITICAL: C-1 empty feed hides Composer + filter (new users can't post);
    C-2 unguarded `post.user` crashes the whole feed, no error boundary;
    C-3 unguarded `comment.commentCreator` crashes PostDetails.
  - MAJOR: M-1 shared posts don't render the original; M-2 no 404 route;
    M-3 Profile "My posts" failure looks like empty; M-4 mutations don't
    invalidate `["userPosts"]`; M-5 silent mutation failures everywhere;
    M-6 type lie: `AuthResponseData.user` required but change-password
    returns no user; M-7 type lie: `ProfileResponse.data` typed User but API
    returns `{ user }`; M-8 type lie: `getPost` claims `ApiResponse<Post>`
    but API may return `{ post }`; M-9 type lie: `Post.likes` required but
    API may omit it; M-10 no axios timeout / no QueryClient defaults;
    M-11 no Arabic/RTL anywhere (Phase 4); M-12 no error boundary;
    M-13 form controls without labels; M-14 favicon 1.7 MB.
  - MINOR (all logged): dead API fns/types (N-1/N-2 — KEPT, Phase 3 builds
    their UI), unused Notifications provider (N-3 — KEPT, Phase 1 uses it
    for M-5), empty index.css (N-4), stray `{" "}` (N-5), stale comments
    (N-6), strict Meta/Pagination (N-8), SharedPost.topComment (N-9),
    User.photo required (N-10), ChangePasswordReq has rePassword (N-11),
    Composer hidden by skeletons (N-12), infinite-scroll failure has no UI
    (N-13), PostDetails "unreadable post" has no Retry (N-14), deleting a
    post from PostDetails lands on error screen (N-15), comment edit drops
    image (N-16), no reply/image UI (N-17 — Phase 3), image-only posts
    blocked (N-18 — kept, log), post edit can't clear body (N-19 — kept,
    log), stale edit drafts (N-20), "My posts (N)" counts only the loaded
    page (N-21), ESLint set-state-in-effect errors (N-22), Login/Signup
    swallow non-Axios errors (N-23), login sets user unconditionally
    (N-24), Home flatten unguarded (N-25), raw date strings (N-26), counts
    can render blank (N-27), logo is a clickable div (N-28), counts have no
    aria-label (N-29), generic alt text (N-30), logout has no confirm
    (N-31), cursorType pointer everywhere (N-32), no code splitting (N-33
    — Phase 5), no lazy images (N-34), heavy glass blur layers (N-35 —
    Phase 2), no manualChunks (N-36 — Phase 5), cover photo near-invisible
    (N-37 — Phase 2), share/likers/suggestions endpoints unverified (N-38
    — verify live in Phase 1), post-owner comment delete unverified (N-39
    — verify live in Phase 1), privacy never shown (N-40), topComment never
    rendered (N-41), no per-page titles/meta (N-42).
  - Verified correct, do not regress: nested comment routes, change-password
    sends only {password, newPassword} + keeps user, bookmarks unwrap,
    profile unwraps, single-post unwrap + `?? []` guards, no manual
    Content-Type on FormData, token key "token", 401 skips signin/signup.
- 2026-11-11: lockfile churn restored (30 deleted `libc` lines were
  npm-version noise — `git checkout -- package-lock.json`, tree clean).
- 2026-11-11: M-14 fixed early — favicon 1,735,749 bytes → 2,421 bytes
  (32×32); added `public/apple-touch-icon.png` (180×180, 57,964 bytes);
  original 1600px art kept as `public/logo.png` for the Phase 2 logo work.
- Phase 0 COMPLETE. Baseline committed below.

## Phase 1 — Fix everything the audit found (in progress)

- 3 implementation agents fanned out in parallel, file-partitioned
  (no two agents touch the same file):
  - Agent 1: API layer + types + AuthProvider + main.tsx (M-6/7/8/9/10,
    N-6/8/9/10/11/24 + remove index.css import).
  - Agent 2: PostCard + Composer + CommentItem + PostDetails (C-2/3,
    M-1/4/5, N-14/15/16/20/22/26/27/34, M-13 labels, N-29/30, N-40/41,
    M-8 contract: read plain Post from getPost).
  - Agent 3: Home + Profile + Bookmarks + Routes + App + Login/Signup +
    theme + index.html + delete index.css (C-1, M-2/3/12, N-5/12/13/21/
    23/25/28/31/32/42, favicon links).
- Deferred (logged, not forgotten): M-11 Arabic/RTL → Phase 4; N-17
  replies → Phase 3; N-18/N-19 kept restrictions; N-33/N-36 code
  splitting → Phase 5; N-35/N-37 glass blur/cover → Phase 2 design
  refresh; N-38/N-39 verify live via curl during Phase 1 verification
  (share, likers, suggestions endpoints + post-owner comment delete).
- Verification after agents return: single `npm run build` + `npm run
  lint`, then targeted live/API checks per fix, then commit.

## Phase 1 — Fix everything the audit found (COMPLETE 2026-11-11)

- All 3 batches landed (API/types/auth; PostCard/Composer/CommentItem/
  PostDetails; Home/Profile/Bookmarks/Routes/App/auth pages/theme/
  index.html). Every audit finding fixed except the logged deferrals.
- Build failure found during verification (NOT in the audit): `tsc -b`
  failed on Home.tsx `fetchNextPage()` — "Type 'never' has no call
  signatures". Root cause: TanStack Query 5.104 types every infinite-result
  union member with `isFetchNextPageError: false` (literal), so calling
  `fetchNextPage()` inside `{isFetchNextPageError && ...}` narrows the
  result to `never` (TS destructured-discriminant narrowing). Fix: a
  `retryNextPage` handler defined outside the narrowed branch; the button
  calls it. Lesson logged: bare `npx tsc --noEmit` is VACUOUS in this
  project (`tsconfig.json` has `"files": []`) — that is why all three
  agents reported clean tsc while `tsc -b` failed. Verification must use
  `npm run build` (tsc -b) or `tsc -b --force`, never bare `tsc --noEmit`.
- Live/API verification (throwaway accounts, all test data cleaned up):
  - N-38a suggestions VERIFIED: GET /users/suggestions returns
    `data: { suggestions: [...] }` (10 users) — but the code typed it as a
    bare array. FIXED: new `SuggestionUser` type (adds
    mutualFollowersCount/followersCount) + getSuggestions unwraps to
    `ApiResponse<SuggestionUser[]>`.
  - N-38b likers: GET /posts/:postId/likers → "route not found" (the
    documented path does not exist). Found live: the real path is
    GET /posts/:postId/likes → `data: { likes: [...] }` with pagination;
    verified with a real like (entry shape recorded) and unliked after.
    FIXED: new `Liker` type + getPostLikers now calls `/likes` and unwraps.
  - N-38c share VERIFIED: POST /posts/:postId/share works; test share
    deleted after.
  - N-39 post-owner comment delete VERIFIED: post owner CAN delete another
    user's comment ("comment deleted successfully", 0 left). CommentItem's
    canDelete logic is correct. Test post + comment deleted after.
  - Postman doc fetch only returned the first 77 lines (health check);
    the likers path was found by live probing instead, not by guessing.
- Final state: `npm run build` GREEN (1.86s, JS 705 kB / 213 kB gzip —
  slightly up from 690 kB, code splitting is Phase 5), `npm run lint`
  exit 0. All test posts/comments/shares/likes created during
  verification were deleted.
- Phase 1 committed below. Next: Phase 2 (design refresh).

## Phase 2 — Design refresh: clean + modern (2026-11-11)
- Theme rewritten (src/theme.ts): locked tokens only — light page #f7f8fa / card #ffffff / border #e6e8ec / text #17181c / dimmed #6b7280; dark page #0e1013 / card #171a20 / border rgba(255,255,255,0.08) / text #f2f3f5 / dimmed #9aa0aa. Violet brand scale kept, primaryShade light 6 / dark 5. Cards 16px radius, 1px border, NO shadow; buttons/inputs 10px; avatars round. `glassVariables` deleted, replaced by minimal `themeVariables` resolver (body/default/border/text/dimmed only). Fonts: Inter (variable) for UI, Sora for headings — Google Fonts link in index.html updated (Manrope removed).
- Glass skin retired: DELETED src/styles/glass.css and src/components/Backdrop.tsx; glass.css import + cssVariablesResolver removed from main.tsx. New minimal src/styles/app.css holds only selection, focus ring, and the like-pop keyframe. Grep proves zero remaining `glass`, `Backdrop`, `--glass-`, `backdrop-filter` in src/ + index.html (the one `backdrop-filter` in dist CSS is Mantine's own Overlay default, unset var, not our code). No `background-attachment: fixed` anywhere.
- Logo: new src/components/Brand.tsx — LogoMark (public/logo.png, 1600px golden-M) + Brand wordmark in Sora. Used at 36px in nav/mobile header, 72px on landing hero, 48px above Login/Signup titles. No new art generated, no generic icon as logo.
- 3-column desktop layout (src/App.tsx): AppShell navbar 264px (logo, Home/Saved/Profile NavLinks, theme toggle + Logout at bottom), right aside 320px (ProfileMiniCard: avatar/name/@username/Posts count → /profile; "About Magic Social" card, no demo link), centre feed capped by pages' 640 containers. Navbar/aside collapsed on mobile and when logged out; mobile keeps top header (logo + theme toggle + Logout) and bottom tab bar (active = filled brand icon). ErrorBoundary, per-page titles, logout confirm modal unchanged.
- Profile redesign: cover (user.cover photo shown plainly, else subtle violet gradient), avatar overlapping with card-colour border, name/@username/email, counts row. Profile-data verified live with throwaway testmagic99@test.com (signin + GET /users/profile-data): response data.user includes followersCount: 0, followingCount: 0, bookmarksCount: 1, followers: [], following: [] — so counts shown are Posts + Followers + Following (User type gained optional followersCount/followingCount/bookmarksCount). Tabs: Posts (My posts list) + Saved (getBookmarks, cached with Bookmarks page). No Likes tab — no liked-posts endpoint. Change-password form unchanged.
- PostCard polish: like button pops via `.like-pop` keyframe (disabled under prefers-reduced-motion); tapping a post or shared-post image opens a Mantine Modal lightbox with the full image + descriptive alt as title; bookmark colour changed cyan → brand violet #8b5cf6. All Phase 1 states/guards (missing-author fallback, shared-post quote card, topComment, privacy label, skeletons/empty/error, confirm modals) kept.
- Landing page (src/pages/Landing/Landing.tsx): hero (72px mark, Sora wordmark, one-line pitch, Log in + Sign up buttons), 3 feature cards (share posts with photos / follow people / save what you love), footer line. RootSwitch in the same file: "/" is now PUBLIC — logged in → <Home/>, logged out → <Landing/>; /login + /signup stay guest-guarded, /posts/:id, /profile, /bookmarks stay protected.
- Verification: `npm run build` GREEN (tsc + vite, 2.33s; JS 725 kB / 219 kB gzip — chunk-size warning is pre-existing, code splitting is Phase 5). `npm run lint` exit 0. No `any`, no `@ts-ignore`, no `window.confirm`, no secrets, no guessed API paths. No test data created (profile-data check was read-only). Nothing committed or pushed.
- NOT done here (coordinator step): visual verification — screenshots light/dark, desktop/mobile — no browser available in this session.

## Phase 3 prep — endpoint verification (2026-11-11, coordinator, live)

All previously-unverified Phase 3 endpoints probed with throwaway
accounts; all test state restored. Results:
- FOLLOW: PUT /users/:userId/follow VERIFIED — returns
  `data: { following: true/false, followersCount }` (the response tells
  you the new state). Follow then unfollow restored (following: []).
  profile-data `following`/`followers` are arrays of user-ID strings.
  profile-data keys: _id, bookmarks, bookmarksCount, cover ("" when
  unset), createdAt, dateOfBirth, email, followers, followersCount,
  following, followingCount, gender, id, name, passwordChangedAt, photo,
  username.
- NOTIFICATIONS — full map VERIFIED (the /users/* guesses all 404):
  GET /notifications → data: { notifications: [...] } + pagination meta;
  GET /notifications/unread-count → data: { unreadCount };
  PATCH /notifications/:id/read → data: { notification };
  PATCH /notifications/read-all → data: { modifiedCount }.
  Entry shape: { _id, recipient: {_id,name,photo}, actor: {_id,name,photo},
  type ("like_post", ...), entityType, entityId, isRead, createdAt,
  entity: {_id, unavailable?} }. NOTE: the old `Notification` type in
  src/types.ts (content?/sender?/post?) is WRONG for this API — Phase 3
  must replace it with the real shape above. All 4 of testmagic99's
  notifications were marked read during probing (throwaway test data).
- LIKERS: GET /posts/:postId/likes (see Phase 1) — done.
- SUGGESTIONS: GET /users/suggestions (see Phase 1) — done.
- COVER PHOTO: no upload-cover endpoint found in the API surface used so
  far; profile `cover` field exists but is "" when unset. Phase 3 will
  ship photo upload (PUT /users/upload-photo, field "photo") and check
  for a cover route in the Postman docs; if none exists, cover stays
  display-only (gradient fallback already in Phase 2).

## Phase 2 — Visual verification (2026-11-11, continuation coordinator)

- Headless Firefox (Playwright) against `vite preview` of the production
  build: 32 screenshots — landing/login/signup/feed/details/profile/
  bookmarks × light/dark × desktop 1280/mobile 390 — plus re-shoots.
  Zero console errors, zero page errors in every run.
- Browser tooling notes (for later phases): Chromium in this VM cannot
  reach the internet (egress proxy + MITM CA); Firefox via the env proxy
  with `ignoreHTTPSErrors: true` works. Screenshot harness lives in
  `~/workspace/predeploy/visual-verify/` (shots.js, fix-verify.js) — it
  reads the proxy from env, never hardcodes credentials.
- Findings (3 real, all fixed + re-verified):
  - V1 Profile avatar showed the cover through it: the default avatar
    PNG is transparent at the top (13,593/18,000 px transparent in the
    top 60 rows). The avatar is fine; the photo is a cutout. Fix: solid
    card-colour background on the profile Avatar.
  - V2 Profile avatar was a 24px-radius rounded rectangle, not round
    (theme says "avatars round"). Fix: Avatar default radius 999 in
    theme.ts + explicit radius 999 on the profile Avatar.
  - V3 No theme toggle visible on desktop when logged out (navbar
    collapsed + mobile header hidden). Fix: AppShell header now shows
    whenever logged out (`hiddenFrom={user ? "sm" : undefined}`), so
    landing/login/signup have logo + toggle on desktop too.
- Non-defects, confirmed: the feed's "white gap" under the first post
  image in early shots was slow image loading through the proxy, not
  layout — later shots render the images fully. Bookmarks empty state is
  correct (testmagic99's only bookmark was on a deleted post; the
  server count is stale). Dark mode works (verified via emulated
  prefers-color-scheme: feed/profile/login/mobile all clean, good
  contrast); the earlier localStorage-seed method was invalid for
  `defaultColorScheme="auto"`, which follows the OS preference.
- Phase 2 visual verification: PASS. Build green, lint exit 0.

## Phase 3 — Wave 1: API layer (2026-11-11, completed)

- Commit 82d534c "Phase 3: notifications API + honest follow type".
- New src/api/Notifications/api.ts + types.ts: getNotifications (unwraps
  data.notifications, keeps pagination), getUnreadCount, markNotificationRead,
  markAllNotificationsRead. Type named NotificationItem (not Notification,
  avoids shadowing the DOM global). Entry shape verified live incl. an extra
  field the prep probing missed: optional readAt.
- Old wrong Notification/NotificationsResponse deleted from src/types.ts.
- followUser now returns ApiResponse<FollowResponse> ({ following,
  followersCount }); zero existing callers.
- Liker + SuggestionUser types re-verified live against real entries —
  exact matches, no fixes needed. PATCH read/read-all NOT re-probed (prep
  already verified them; no unread notifications to test against).
- Build green, lint exit 0. Next: Wave 2 UI agents (file-partitioned).

## Phase 3 — Wave 2: UI + integration + live verification (2026-11-11, completed)

- Commits f749b0b (Agent B: suggestions + follow UI, nav bell), ccb72f2
  (Agent D: public profiles, threaded replies, search), 9950bff (Agent C:
  notifications page, photo upload, likers modal, user routes). Integration
  + verification fixes below in the same phase (uncommitted at this writing).
- What landed: SuggestionsCard in the right aside (up to 5, skeletons /
  error+Retry / empty state) + FollowButton (drives label from the follow
  response, invalidates suggestions/profile/userProfile); Notifications nav
  item (desktop) + tab (mobile) with unread badge (polls every 60s, capped
  99+); /notifications page (actor avatar+name, human type text, relative
  time, unread highlight + dot, click marks read + navigates to the post,
  "Mark all read"); LikersModal (likes-count button opens it, rows link to
  /users/:id); profile photo upload (FileInput, refreshUser + invalidate
  profile; no cover upload — no endpoint); /users/:id public profile
  (same hero as own Profile, FollowButton, Posts-only tab, redirects to
  /profile for your own id); search over loaded posts (body/author
  name/username, "N results for '…'" + clear, no-match empty state);
  PAGE_TITLES gained /notifications (was falling back to "Magic Social").
- Live API verification (throwaway @testmagic99 / @testmagic2 / @testmagic3,
  all test state restored afterwards): follow toggle { following: true,
  followersCount: 1 } then unfollowed; like -> unread-count 2 -> 3, likers
  list [testmagic99]; mark-one-read (isRead true) + mark-all-read
  (modifiedCount 4, unread 0); photo upload returns a webp URL; public
  profile returns a followers array (initialFollowing fallback works);
  suggestions exclude already-followed users.
- THREE REAL BUGS found in verification, all fixed + re-verified:
  - R1 (critical) Replies used the wrong endpoint. Agent D's CommentItem
    called createComment with parentComment — the API rejects that field
    ("\"parentComment\" is not allowed", both FormData and JSON) and the
    reply would fail with a toast every time. Real endpoints, found by
    probing: POST /posts/:postId/comments/:commentId/replies (returns
    data.reply; accepts an optional image) and GET .../replies (returns
    data.replies, newest first, with pagination). The comments list NEVER
    contains replies (total counts only top-level), so PostDetails'
    flat-list grouping was dead code. Fix: new createReply/getReplies in
    api/Posts/Comments/api.ts, CreateReplyReq + AllRepliesResponse types,
    parentComment removed from CreateCommentReq, CommentItem fetches its
    own replies (query ["replies", postId, commentId]) and renders them
    nested, PostDetails simplified to render top-level comments directly.
    One reply level by design (nested items have no Reply button — the
    API has no read path for replies to replies).
  - R2 (critical) Suggestions 401 reload loop on /login. Mantine's
    AppShell.Aside mounts children even when collapsed, so SuggestionsCard
    mounted on /login + /signup while logged out; its query had no
    enabled guard, got 401, and the interceptor's window.location.href =
    "/login" full-reloaded the page — infinite loop, and the login submit
    never completed. Fix (3 parts): enabled: !!user on the suggestions
    query; {user && <SuggestionsCard />} in App.tsx; interceptor skips
    the redirect when already on /login or /signup (just drops the stale
    token). Verified: signin 200, no 401 storm, suggestions 200 only
    when logged in.
  - R3 (minor) Notification copy: notificationText handled "comment" /
    "follow" / "share", but the API sends comment_post / follow_user, so
    rows read "Test Magic comment post" / "follow user". Fix: added the
    real values (comment_post -> "commented on your post", follow_user ->
    "started following you", share_post -> "shared your post").
- UI verification (Playwright + Firefox, vite preview :4173; harness
  ~/workspace/predeploy/visual-verify/phase3-verify.js + dark-reshoot.js;
  screenshots in shots/phase3/): 13/15 scripted checks PASS. The 2 FAILs
  were script errors, not app bugs — the Follow check looked for a
  "Following" button after the click, but the followed user leaves the
  suggestions list on refetch (API confirmed followingCount 1); the
  search no-match check regex missed the real text "No posts match '…'".
  Verified by hand + screenshots: suggestions card + Follow (UI click
  follows), notifications page (unread highlight, badge 2 -> 1 after
  clicking one), click notification -> post page, reply posted via UI
  appears nested, likers modal lists testmagic99, user profile hero +
  Follow button, search filters + no-match state, photo upload via UI
  (avatar becomes the uploaded image everywhere), dark mode (true dark
  via emulated prefers-color-scheme — localStorage seeding does NOT work
  with defaultColorScheme="auto") and mobile notifications/user profile.
  Zero page errors. "Image corrupt or truncated" console errors for R2
  CDN images are a proxy/harness artifact (same URLs render fine in
  light shots; the downloaded webp is valid) — when an avatar image
  fails, Firefox shows the img alt text ("Test / Mag…") in the avatar
  slot, which is a fallback cosmetic wart, not an app defect.
- Test data cleaned: all probe posts/comments/replies deleted, follows
  undone, notifications read-all, unread 0. T2's avatar is now the
  uploaded favicon (no un-upload endpoint; throwaway account, harmless).
  Note: photo upload auto-creates a server-side "updated profile
  picture." post (deleted with the rest).
- Build green, lint exit 0. Phase 3 COMPLETE.

## Phase 4 — Visual verification (RTL) (2026-11-11)

- Harness: `~/workspace/predeploy/visual-verify/rtl-verify.js` (+ `rtl-recheck.js`
  for the two re-checks), headless Firefox via Playwright against `vite preview`
  of the production build; `lang=ar` seeded in localStorage before boot
  (LanguageProvider reads it on boot). Screenshots in `shots/phase4-rtl/`.
- Test data (throwaway @testmagic99, deleted afterwards): one Arabic post
  (`6af4c106fbc846000b37d9a8`) + Arabic comment + Arabic reply + bookmark,
  created via the live API. Post deleted after verification ("Post Not Found"
  on re-fetch). The 7 unread notifications on testmagic99 arrived from other
  users' activity during the run — not created by this verification, left as-is.
- Screens shot, desktop 1280 + mobile 390, light Arabic: landing, login,
  signup, feed, post details (comment + nested reply), profile, user profile
  (testmagic2), bookmarks, notifications. Plus desktop dark + Arabic feed
  (emulated prefers-color-scheme dark) and toggle-back-to-English on desktop.
- First run: 67/72 scripted checks PASS. 5 FAILs — 4 were harness artifacts,
  not app bugs: "بمَ تفكر؟" / "اكتب تعليقًا" are placeholders (never in
  innerText — confirmed present in the DOM); the EN-toggle check picked the
  hidden header duplicate instead of the visible navbar toggle. Fixed the
  harness (placeholder-aware checks, `.last()` toggle) — all pass on re-run.
- 6 REAL DEFECTS found in the app, all fixed + re-verified (re-run 83/85,
  then 4/4 on the targeted recheck):
  - V1 Profile handle/email left-aligned in RTL: `dir="ltr"` was on the whole
    `<Text>` block, which flips block alignment. Fix (Profile.tsx):
    dir moved to an inline `<span dir="ltr">` around the content, so the
    block right-aligns like the name while the handle/email stay LTR.
  - V2 Same defect on UserProfile.tsx (`@testmagic2` left-aligned). Same fix.
  - V3 Mini profile card handle had NO bidi isolation: rendered "testmagic99@"
    (@ trailing) in RTL. Fix (App.tsx): `<span dir="ltr">` around the handle.
  - V4 UserProfile empty state "@testmagic2 لم ينشر أي شيء بعد." rendered the
    handle as "testmagic2@" mid-sentence. Fix (dictionary.ts, Arabic only):
    the handle is wrapped in Unicode bidi isolates (U+2066 LRI / U+2069 PDI).
  - V5 Mobile header overflow (390px): the full "تسجيل الخروج" button is too
    wide next to the logo + EN + theme toggles — it wrapped out of the 60px
    header and covered the search input below. Fix (App.tsx): the header
    logout is now an icon-only ActionIcon (LogOut, aria-label kept). That
    header is the mobile header when logged in; the desktop navbar keeps the
    full labelled button. Verified: header stays 60px, search starts at y=76.
  - V6 Own-post action row wrapped on 390px: at gap="lg" the row is ~346px vs
    ~326px card inner width, so the delete icon dangled alone on a second
    line. Fix (PostCard.tsx): actions Group gap "lg" → "sm". Verified
    same-card: delete and like buttons on the same y (307).
- Verified correct (no fix needed): nav on the right / aside on the left in
  RTL (nav x=1016, aside x=0); reply indented from the right
  (reply right edge 888 vs comment 938); relative times in Arabic
  ("منذ دقيقة واحدة", "منذ أقل من دقيقة"); no horizontal overflow on any
  screen (0px); no leftover English UI strings (brand "Magic Social",
  usernames, emails and user-generated content stay English by design);
  toggle back to English flips dir to ltr with full English UI (screenshot
  desktop-en-after-toggle.png); dark + Arabic feed clean with good contrast.
  The DOB input's "mm / dd / yyyy" placeholder stays LTR — native browser
  date control, not an app defect. Suggestions names truncate with "…"
  at the inline end — normal ellipsis, not clipping.
- Console errors: only "Image corrupt or truncated" for R2 CDN webp URLs —
  same known proxy/harness artifact as Phase 2/3 (the URLs render fine in
  the screenshots; the downloaded webp is valid). Zero page errors in every run.
- Final state: `npm run build` GREEN (2.59s), `npm run lint` exit 0.
  Phase 4 visual verification: PASS.

## Phase 5 — wiring + performance + a11y (2026-11-11)

### PWA wiring (per PWA-SETUP.md steps 1, 2, 4 verbatim)
- `npm install -D vite-plugin-pwa` (devDependency; package.json + lock updated).
- `vite.config.ts` replaced with the spec's VitePWA block (`manifest: false`,
  `injectRegister: false`, `registerType: "autoUpdate"`, workbox glob
  `**/*.{js,css,html,png,webp}`) PLUS code splitting in the same file.
- `src/main.tsx`: `import { registerSW } from "virtual:pwa-register"` +
  `registerSW({ immediate: true })` before createRoot.
- New file `src/vite-env.d.ts` (`/// <reference types="vite/client" />` +
  `/// <reference types="vite-plugin-pwa/client" />`) — required, otherwise
  `tsc` fails with TS2307 "Cannot find module 'virtual:pwa-register'".
- Manifest `<link>` was already in index.html (README agent) — verified present,
  not duplicated.

### Theme-color decision (exception to PWA-SETUP.md §3)
- Did NOT change index.html theme-color to #8b5cf6. The README agent's
  light/dark media pair (#f7f8fa / #0e1013, matching the actual page
  backgrounds) is correct and stays as-is. The manifest's theme_color
  #8b5cf6 (splash screen) also stays as-is. The single-colour #8b5cf6
  meta would have painted the browser chrome violet in both schemes,
  mismatching the page background.

### Code splitting — chunk sizes before / after
- BEFORE: single JS chunk `index 774.62 kB` (gzip 230.62 kB) + the
  ">500 kB chunk" warning. CSS 250.30 kB.
- AFTER (manualChunks on node_modules): `index 79.52 kB` (gzip 20.20 kB),
  `vendor-react 244.89 kB` (gzip 78.00 kB — react, react-dom,
  react-router-dom, react-router, scheduler), `vendor-mantine 210.09 kB`
  (gzip 60.44 kB — @mantine/*), `vendor-lib 248.45 kB` (gzip 76.98 kB —
  everything else: @tanstack/react-query, axios, date-fns, zod,
  react-hook-form, lucide-react). No chunk over 500 kB, warning gone.
  Largest chunk is now 248.45 kB (was 774.62 kB, −68%).
- Smoke: production build + `vite preview` — landing, login, feed,
  post details, profile, notifications all render; 0 failed requests,
  0 console errors (Playwright/Firefox). Note: `vite preview` binds
  `[::1]:4173` by default in this VM — the harness needs
  `--host 127.0.0.1` or Firefox gets connection-refused on 127.0.0.1.

### Lazy images — audit (no code change needed)
- Every below-the-fold content `<Image>` already had `loading="lazy"`:
  post images + shared-post images + edit previews (PostCard), comment
  images + edit previews (CommentItem), composer preview (Composer).
- Deliberately NOT lazy: `Brand.tsx` logo (landing hero / header, eager
  by design) and the PostCard lightbox image (user-opened modal, visible
  on open). Profile/UserProfile cover photos are CSS `background-image`
  on a `<Box>` (above the fold on those pages) — not lazy-loadable as
  `<img>`, no change.

### Accessibility — axe-core 4.14 (@axe-core/playwright in the harness
### only: ~/workspace/predeploy/visual-verify, NOT the app's package.json)
- Pages scanned, light mode, desktop 1280×900, logged in as throwaway
  @testmagic99/Test1234! for the authed pages.
- BEFORE (first run): landing 1, login 1, signup 1, feed 3, profile 3,
  notifications 3 (post details unscanned — harness looked for
  `a[href^="/posts/"]`, but cards navigate via onClick; fixed harness
  to click the first post's comments button).
- AFTER (re-run after fixes): **0 violations on all 7 pages**
  (landing, login, signup, feed, post details, profile, notifications).
- Violations found + fixed (all ours, none from Mantine internals):
  1. `heading-order` (landing): feature cards were h4 straight after the
     h1. Fix: cards → h2, visual size pinned with
     `fz/lh="var(--mantine-h4-…)"` (Landing.tsx).
  2. `page-has-heading-one` (login, signup, feed, post details, profile,
     notifications): no h1 anywhere. Fix: promoted each page's main
     Title to h1 with fz/lh pinned to its old size (Login, Signup,
     Notifications, Profile name h3→h1 + change-password h4→h2 so the
     order stays valid); added a visually-hidden h1 where the page has
     no visible title (feed: `t.nav.home`; post details: new
     `t.post.detailsHeading(name)` — "Post by {name}" / "منشور لـ {name}",
     added to EN + AR dictionaries).
  3. `color-contrast` (feed + profile): Mantine FileInput placeholder
     #adb5bd on white = 2.07:1. Fix: `--mantine-color-placeholder`
     overridden in themeVariables — light #5c5f66 (~6.4:1 on white),
     dark #a9adb3 (~7.7:1 on #171a20). Verified in both schemes.
  4. `color-contrast` (notifications): dimmed timestamp #6b7280 on the
     violet-light unread background = 3.66:1. Fix: new scheme-aware
     `--notification-unread-time` token (light #495057 = 6.2:1 on
     #e5dbff; dark #9aa0aa = 5.33:1 on the dark unread bg, verified).
  5. `label-content-name-mismatch` (17 nodes, feed/profile/notifications):
     - Language toggle: visible text "عربي"/"EN" wasn't in aria-label
       "Switch to Arabic". Fix: label now leads with the visible text
       ("عربي — Switch to Arabic").
     - Likers count button: visible "0" vs aria-label "View who liked
       this post (0 likes)" — axe strips parentheticals before
       comparing, so the count vanished from the name. Fix:
       `viewLikersAria` no longer uses parentheses and leads with the
       count ("0 likes — view who liked this post", AR likewise with
       the digit first).
     - Top-comment card: visible "author: content" vs aria-label
       "Top comment by author: view post" (no content). Fix:
       `topCommentAria(author, content)` now includes the content.
     - Notification rows: aria-label reworded the visible text (comma,
       avatar fallback), so it stopped containing it verbatim. Fix:
       removed the aria-label — the row's visible content IS its name.
     - Profile/PostCard/CommentItem edit FileInputs: aria-label
       ("Change profile/post/comment image") vs visible placeholder
       ("Change photo"/"Change image (optional)") — same latent
       mismatch, fixed by removing the aria-label so the placeholder
       text is the name. (Composer's FileInput already passed and is
       untouched.)
- Keyboard walk (Playwright Tab, light mode): login form — all 10
  focusable elements reachable, every stop shows a visible 2px violet
  focus ring; feed — all 30 stops in the walk show a ring, including
  the composer textarea, the "Add an image" FileInput button and the
  first post's like/comment/share/bookmark actions.
  - Root cause found: Mantine's `.m_8fb7ebe7:focus { outline: none }`
    (0,2,0) outranked the global `:focus-visible` rule (0,1,0), and the
    theme's input `border` shorthand swallows Mantine's focus
    border-colour change — so focused text inputs/textareas/FileInput
    buttons had NO visible focus indicator at all. Fix (app.css):
    element-qualified `input/textarea/select/button.mantine-Input-input:
    focus-visible` outline rule (0,2,1), which beats Mantine's rule
    regardless of stylesheet order. Verified in light + dark.

### PWA end-to-end verification (production build + vite preview :4173)
- curl: manifest 200 `application/manifest+json`; icon-192, icon-512,
  icon-512-maskable all 200 `image/png`; sw.js 200 `text/javascript`;
  index 200 `text/html`. Manifest body verified (name "Magic Social",
  3 icons, theme_color #8b5cf6).
- Playwright/Firefox: `navigator.serviceWorker` supported; registration
  present, scope `http://127.0.0.1:4173/`, worker state `activated` on
  first load; after reload `navigator.serviceWorker.controller` is
  `true` (worker controls the page). `dist/` contains `sw.js` +
  `workbox-*.js`; precache 14 entries (3391.79 KiB).
- 0 console errors, 0 failed requests across all 7 scanned pages.
  (The "Image corrupt or truncated" R2 webp console note seen in
  Phases 2–4 did not appear in this run.)

### Final state
- `npm run build` GREEN (tsc + vite, 2.80s, PWA files generated).
- `npm run lint` exit 0.
- Phase 5 visual/a11y verification: PASS (axe 0 violations, keyboard
  rings on every stop, PWA verified end-to-end).
