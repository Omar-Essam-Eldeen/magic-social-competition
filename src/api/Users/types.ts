// Live-verified 2026-11-11 (Phase 3 prep, STAGELOG):
// PUT /users/:userId/follow returns data: { following, followersCount }
// — the response tells you the new follow state, NOT a User.
export interface FollowResponse {
  following: boolean;
  followersCount: number;
}
