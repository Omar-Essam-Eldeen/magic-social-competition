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
