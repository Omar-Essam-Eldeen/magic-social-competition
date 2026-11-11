import type { AllPostsResponse, ApiResponse, Meta, Post, ProfileResponse, SuggestionUser, User } from "../../types.ts";
import type { FollowResponse } from "./types.ts";
import { api } from "../client.ts";
// ================= Extras =================
// GET /users/bookmarks — your saved posts
export async function getBookmarks(): Promise<AllPostsResponse> {
  // The bookmarks endpoint returns { data: { bookmarks: [...] } },
  // not { data: { posts: [...] } } like the feed does — unwrap it here
  // so the page can keep reading data.posts.
  const { data } = await api.get<{ success: boolean; message: string; meta: Meta; data: { bookmarks: Post[] } }>(
    "/users/bookmarks",
  );
  return { success: data.success, message: data.message, meta: data.meta, data: { posts: data.data.bookmarks } };
}
// GET /users/suggestions — people to follow
// Live-verified 2026-11-11: the API returns data: { suggestions: [...] },
// NOT a bare array, and each suggestion carries mutualFollowersCount +
// followersCount. Unwrap here so callers get a plain list.
export async function getSuggestions(): Promise<ApiResponse<SuggestionUser[]>> {
  const { data } = await api.get<{
    success: boolean;
    message: string;
    meta?: Meta;
    data: { suggestions: SuggestionUser[] };
  }>("/users/suggestions");
  return { success: data.success, message: data.message, meta: data.meta, data: data.data.suggestions };
}
// PUT /users/:userId/follow — follow toggle
// Live-verified 2026-11-11: returns data: { following, followersCount },
// NOT a User — the response tells you the new follow state.
export async function followUser(userId: string): Promise<ApiResponse<FollowResponse>> {
  const { data } = await api.put<ApiResponse<FollowResponse>>(`/users/${userId}/follow`);
  return data;
}
// GET /users/:userId/profile — another user's profile
export async function getUserProfile(userId: string): Promise<ProfileResponse> {
  // Raw shape: the user is nested ({ data: { user: {...} } }) — unwrap
  // it here so callers keep getting a plain User.
  const { data } = await api.get<{ success: boolean; message: string; data: { user: User } }>(`/users/${userId}/profile`);
  return { success: data.success, message: data.message, data: data.data.user };
}
// GET /users/:userId/posts — another user's posts
export async function getUserPosts(userId: string): Promise<AllPostsResponse> {
  const { data } = await api.get<AllPostsResponse>(`/users/${userId}/posts`);
  return data;
}
// PUT /users/upload-photo — profile photo
export async function uploadProfilePhoto(photo: File): Promise<ApiResponse<User>> {
  const formData = new FormData();
  formData.append("photo", photo);

  const { data } = await api.put<ApiResponse<User>>("/users/upload-photo", formData);
  return data;
}
