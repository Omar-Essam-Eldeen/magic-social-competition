# Magic Social — API Reference (for the future Flutter Android rebuild)

**Source of truth:** every endpoint and shape below was verified live
against the real API on 2026-11-11 (Phases 1, 3, 6) or in the Nov 3 live
test. Anything not live-verified is marked **UNVERIFIED**. Do **not** use
the old Phase 2 route map — it was wrong on comment routes.

- **Base URL:** `https://route-posts.routemisr.com/` (trailing slash)
- **Docs:** https://documenter.getpostman.com/view/5709532/2sBXcBnNAq
- **Auth:** send the token on every request as BOTH headers —
  `token: <token>` and `Authorization: Bearer <token>`. Token key in
  storage: `"token"`. A 401 means the token is dead: drop it and send the
  user to `/login` (but never redirect while already on `/login` or
  `/signup` — that loops).
- **Envelope:** every response is
  `{ success: boolean, message: string, data: <payload>, meta?: { pagination: {...} } }`.
- **Pagination:** `?page=1&limit=10&sort=-createdAt` (newest first).
  `meta.pagination` = `{ currentPage, numberOfPages, limit, nextPage, total }`.
- **IDs:** Mongo-style `_id` strings (a `id` field also exists on some
  objects — use `_id`).

## Auth

| Method & path | Body | Returns (`data`) |
|---|---|---|
| `POST /users/signup` | JSON: `{ name, username, email, dateOfBirth: "YYYY-MM-DD", gender, password, rePassword }` | `{ token, tokenType, expiresIn, user }` |
| `POST /users/signin` | JSON: `{ email, password }` | `{ token, tokenType, expiresIn, user }` |
| `PATCH /users/change-password` | JSON: `{ password, newPassword }` — **NO `rePassword`; the backend rejects it** | `{ token, tokenType, expiresIn }` — **a NEW token and NO user**. Save the new token and **keep the current user**; setting user from this response wipes the session. The confirm field is form-only (checked locally, never sent). |

## Posts

| Method & path | Body | Returns (`data`) |
|---|---|---|
| `GET /posts?page=&limit=&sort=-createdAt` | — | `{ posts: Post[] }` + pagination meta |
| `GET /posts/:postId` | — | **may be `{ post: {...} }`** — unwrap. May also **omit `likes`** — read `(post.likes ?? [])`. |
| `POST /posts` | FormData: `body`, optional `image` (File), optional `privacy` | `Post` |
| `PUT /posts/:postId` | FormData: optional `body`, `image`, `privacy` | `Post` |
| `DELETE /posts/:postId` | — | May return **no data object** — don't read `data` from it. |
| `GET /posts/feed?only=following\|me\|all&page=&limit=&sort=-createdAt` | — | `{ posts: Post[] }` + pagination meta |
| `PUT /posts/:postId/like` | none (toggle) | `Post` |
| `PUT /posts/:postId/bookmark` | none (toggle) | `Post` |
| `POST /posts/:postId/share` | none | `Post` (a share creates a new post wrapping the original) |
| `GET /posts/:postId/likes` | — | `{ likes: Liker[] }` + pagination meta. **The real path is `/likes` — `/likers` returns "route not found".** |

### Post shape

```ts
interface Post {
  _id: string; id: string;
  body?: string; image?: string; privacy: string;
  user: User;                       // may be missing on malformed rows — guard it
  sharedPost?: SharedPost;          // set when this post is a share of another
  likes?: string[];                 // user IDs — MAY BE OMITTED, guard with ?? []
  likesCount: number; commentsCount: number; sharesCount: number;
  topComment?: TopComment;
  bookmarked: boolean; isShare: boolean;
  createdAt: string;
}
interface SharedPost {              // same fields as Post, minus bookmarked
  _id: string; id: string; body?: string; image?: string; privacy: string;
  user: User; sharedPost?: SharedPost | null;
  likes: string[]; likesCount: number; commentsCount: number; sharesCount: number;
  topComment: TopComment; isShare: boolean; createdAt: string;
}
```

## Comments — nested routes (the corrected map)

**Do NOT use `/comments/:id`** — it answers `{"success":false,"message":"route not found"}`.
All comment routes are nested under the post. Delete is allowed for the
comment owner **or** the post owner.

| Method & path | Body | Returns (`data`) |
|---|---|---|
| `GET /posts/:postId/comments` | — | `{ comments: Comment[] }` — **top-level comments ONLY; replies are never in this list** |
| `POST /posts/:postId/comments` | FormData: `content`, optional `image` (File) | `Comment` |
| `PUT /posts/:postId/comments/:commentId` | FormData: `content`, optional `image` | `Comment` |
| `DELETE /posts/:postId/comments/:commentId` | — | May return no data object. |
| `PUT /posts/:postId/comments/:commentId/like` | none (toggle) | `Comment` |
| `POST /posts/:postId/comments/:commentId/replies` | FormData: `content`, optional `image` | `{ reply: Comment }` |
| `GET /posts/:postId/comments/:commentId/replies` | — | `{ replies: Comment[] }`, **newest first**, + pagination meta |

**Trap:** sending `parentComment` to the create-comment endpoint is
rejected (`"parentComment" is not allowed`, FormData and JSON alike).
Replies go through the `/replies` endpoints only. One reply level exists
by design — there is no read path for replies to replies.

### Comment shape

```ts
interface Comment {                 // = TopComment
  _id: string; content: string; image?: string;
  commentCreator: { _id: string; name: string; username: string; photo: string };
  post: string;                     // post ID
  parentComment?: string | null;
  likes: string[]; createdAt: string;
}
```

## Notifications — verified map (the old guesses under `/users/*` all 404)

| Method & path | Body | Returns (`data`) |
|---|---|---|
| `GET /notifications?page=&limit=&sort=-createdAt` | — | `{ notifications: NotificationItem[] }` + pagination meta |
| `GET /notifications/unread-count` | — | `{ unreadCount: number }` |
| `PATCH /notifications/:id/read` | none | `{ notification: NotificationItem }` |
| `PATCH /notifications/read-all` | none | `{ modifiedCount: number }` |

```ts
interface NotificationItem {
  _id: string;
  recipient: { _id: string; name: string; photo?: string | null };
  actor:     { _id: string; name: string; photo?: string | null };
  type: string;        // observed values: "like_post", "comment_post",
                       // "follow_user", "share_post"
  entityType: string;  // e.g. "post"
  entityId: string;    // ID of the post/user the notification is about
  isRead: boolean; readAt?: string; createdAt: string;
  entity: { _id: string; unavailable?: boolean };
}
```

**Trap:** an early `Notification` type in the codebase (`content` /
`sender` / `post` fields) was WRONG for this API and was deleted — use
the shape above. Notification `type` values are snake_case
(`comment_post`, `follow_user`), not plain words.

## Users & profile

| Method & path | Body | Returns (`data`) |
|---|---|---|
| `GET /users/profile-data` | — | **`{ user: {...} }` — unwrap.** The user object also carries `followersCount`, `followingCount`, `bookmarksCount`, plus `followers: string[]` and `following: string[]` (arrays of user-ID strings), `cover` (`""` when unset), `dateOfBirth`, `gender`, `passwordChangedAt`. |
| `GET /users/:userId/profile` | — | **`{ user: {...} }` — unwrap**, same shape as above. |
| `GET /users/:userId/posts` | — | `{ posts: Post[] }` + pagination meta |
| `GET /users/bookmarks` | — | **`{ bookmarks: Post[] }`, NOT `data.posts`** — unwrap. |
| `GET /users/suggestions` | — | **`{ suggestions: SuggestionUser[] }`, NOT a bare array** — unwrap. |
| `PUT /users/:userId/follow` | none (toggle) | **`{ following: boolean, followersCount: number }` — NOT a User.** The response tells you the new follow state; use it to drive the button label. |
| `PUT /users/upload-photo` | FormData, field name **`"photo"`** (File) | `User`. **Side effect:** the API auto-creates a server-side post with body `"updated profile picture."` — delete it in tests. |

### User shapes

```ts
interface User {
  _id: string; name: string; username: string;
  email?: string; photo?: string | null; cover?: string;
  followersCount?: number; followingCount?: number; bookmarksCount?: number;
}
interface SuggestionUser extends User {
  mutualFollowersCount: number; followersCount: number;
}
interface Liker {                   // from GET /posts/:postId/likes
  _id: string; id: string; name: string; username: string;
  photo?: string | null;
  followersCount: number; followingCount: number; bookmarksCount: number;
}
```

## FormData rules (all uploads)

- **Never set `Content-Type` manually** on a FormData request — the
  browser/axios sets the multipart boundary. Setting it breaks the upload.
- Field names: post/comment/reply image = `"image"`; profile photo = `"photo"`.
- There is **no upload-cover endpoint** found in the API surface used so
  far — `cover` is display-only (gradient fallback when unset). **UNVERIFIED:**
  a cover-upload route may exist in the Postman docs; check there before
  assuming one.
- There is **no "liked posts" endpoint** — no way to list posts a user
  liked. **UNVERIFIED** beyond the surface checked.
- Image-only posts (no `body`) are blocked by the app's own validation,
  not confirmed as an API rule. **UNVERIFIED** at the API level.

## Response-shape traps (proven live — do not reintroduce)

1. Single post: unwrap `data.post` if present; guard `likes` with `?? []`.
2. Profile (`profile-data`, `:userId/profile`): unwrap `data.user`.
3. Bookmarks: read `data.bookmarks`, not `data.posts`.
4. Suggestions: read `data.suggestions`, not a bare array.
5. Change password: token but **no user**; `rePassword` is rejected.
6. Comment routes are nested under the post; `/comments/:id` does not exist.
7. `parentComment` is rejected on create-comment; replies use `/replies`.
8. Delete endpoints may return no data object.
9. Likers live at `/posts/:postId/likes`, not `/likers`.
10. Follow returns `{ following, followersCount }`, not a User.
11. The old `Notification` type (`content`/`sender`/`post`) was wrong —
    use `NotificationItem` above.
12. In TypeScript, import `Comment` from your own types file — the DOM lib
    has a built-in `Comment` type and the build will silently use the wrong one.
