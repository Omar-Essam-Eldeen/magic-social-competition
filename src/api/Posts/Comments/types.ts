import type { Meta, TopComment } from "../../../types.ts";

// A full comment is the same shape as a top comment
export type Comment = TopComment;

export interface CreateCommentReq {
  content: string;
  image?: File | null;
}

// Replies live on their own endpoint — POST /posts/:postId/comments/:commentId/replies.
// NOTE: the create-comment endpoint REJECTS a parentComment field
// ("\"parentComment\" is not allowed"), so replies must never go through it.
export interface CreateReplyReq {
  content: string;
  image?: File | null;
}

export interface AllCommentsResponse {
  success: boolean;
  message: string;
  data: { comments: Comment[] };
  meta?: Meta;
}

export interface AllRepliesResponse {
  success: boolean;
  message: string;
  data: { replies: Comment[] };
  meta?: Meta;
}
