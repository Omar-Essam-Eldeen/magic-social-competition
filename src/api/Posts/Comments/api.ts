import type { ApiResponse } from "../../../types.ts";
import type { AllCommentsResponse, AllRepliesResponse, Comment, CreateCommentReq, CreateReplyReq } from "./types.ts";
import { api } from "../../client.ts";
// ================= Comments =================
// GET /posts/:postId/comments — all comments on a post (top-level only;
// replies are NOT in this list — use getReplies per comment)
export async function getComments(postId: string): Promise<AllCommentsResponse> {
  const { data } = await api.get<AllCommentsResponse>(`/posts/${postId}/comments`);
  return data;
}
// POST /posts/:postId/comments — create a top-level comment
export async function createComment(postId: string, body: CreateCommentReq): Promise<ApiResponse<Comment>> {
  const formData = new FormData();
  formData.append("content", body.content);
  if (body.image) formData.append("image", body.image);

  const { data } = await api.post<ApiResponse<Comment>>(`/posts/${postId}/comments`, formData);
  return data;
}
// POST /posts/:postId/comments/:commentId/replies — reply to a comment
// (verified live: returns data.reply; accepts an optional image)
export async function createReply(
  postId: string,
  commentId: string,
  body: CreateReplyReq,
): Promise<ApiResponse<{ reply: Comment }>> {
  const formData = new FormData();
  formData.append("content", body.content);
  if (body.image) formData.append("image", body.image);

  const { data } = await api.post<ApiResponse<{ reply: Comment }>>(
    `/posts/${postId}/comments/${commentId}/replies`,
    formData,
  );
  return data;
}
// GET /posts/:postId/comments/:commentId/replies — replies to a comment
// (verified live: returns data.replies, newest first, with pagination meta)
export async function getReplies(postId: string, commentId: string): Promise<AllRepliesResponse> {
  const { data } = await api.get<AllRepliesResponse>(`/posts/${postId}/comments/${commentId}/replies`);
  return data;
}
// PUT /posts/:postId/comments/:commentId — edit a comment
export async function updateComment(postId: string, commentId: string, body: CreateCommentReq): Promise<ApiResponse<Comment>> {
  const formData = new FormData();
  formData.append("content", body.content);
  if (body.image) formData.append("image", body.image);

  const { data } = await api.put<ApiResponse<Comment>>(`/posts/${postId}/comments/${commentId}`, formData);
  return data;
}
// DELETE /posts/:postId/comments/:commentId — delete a comment
export async function deleteComment(postId: string, commentId: string): Promise<ApiResponse<Comment>> {
  const { data } = await api.delete<ApiResponse<Comment>>(`/posts/${postId}/comments/${commentId}`);
  return data;
}
// PUT /posts/:postId/comments/:commentId/like — like a comment
export async function likeComment(postId: string, commentId: string): Promise<ApiResponse<Comment>> {
  const { data } = await api.put<ApiResponse<Comment>>(`/posts/${postId}/comments/${commentId}/like`);
  return data;
}
