import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Box, Button, Container, Group, Skeleton, Stack, Text, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { getPost } from "../../api/Posts/api.ts";
import { createComment, getComments } from "../../api/Posts/Comments/api.ts";
import type { Comment, CreateCommentReq } from "../../api/Posts/Comments/types.ts";
import PostCard from "../../components/Posts/PostCard.tsx";
import CommentItem from "../../components/Posts/Comments/CommentItem.tsx";

/**
 * The parent of a comment: `parentComment` comes back from the API either
 * as a bare id string or as a populated comment object — normalise both
 * to the id (null for a top-level comment).
 */
function parentIdOf(comment: Comment): string | null {
  const parent = comment.parentComment;
  if (!parent) return null;
  return typeof parent === "string" ? parent : parent._id;
}

export default function PostDetails() {
  const { id } = useParams();
  const postId = id ?? "";
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");

  const postQuery = useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPost(postId),
    enabled: !!postId,
  });

  const commentsQuery = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => getComments(postId),
    enabled: !!postId,
  });

  const createMutation = useMutation({
    mutationFn: (body: CreateCommentReq) => createComment(postId, body),
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
    onError: () =>
      notifications.show({ color: "red", title: "Couldn't post your comment", message: "Try again." }),
  });

  if (!postId) {
    return (
      <Container size={640} px="md">
        <Alert color="red" title="Post not found" />
      </Container>
    );
  }

  if (postQuery.isPending) {
    return (
      <Container size={640} px="md">
        <Stack gap="md">
          <Skeleton height={200} radius="md" />
          <Skeleton height={80} radius="md" />
        </Stack>
      </Container>
    );
  }

  if (postQuery.isError || !postQuery.data?.data) {
    return (
      <Container size={640} px="md">
        <Alert color="red" title="Couldn't load this post">
          <Button mt="sm" onClick={() => postQuery.refetch()}>
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  // getPost unwraps the response in the API layer, so data is a plain Post.
  const post = postQuery.data.data;

  if (!post || !post.user) {
    return (
      <Container size={640} px="md">
        <Alert color="red" title="Couldn't read this post">
          <Text size="sm">The server sent a shape this page doesn't understand yet.</Text>
          <Button mt="sm" onClick={() => postQuery.refetch()}>
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }
  const comments = commentsQuery.data?.data.comments ?? [];
  // Threading: top-level comments have no parent; every other comment is
  // a reply to the comment whose _id matches its parentComment.
  const topLevelComments = comments.filter((comment) => parentIdOf(comment) === null);
  const repliesFor = (parent: Comment) =>
    comments.filter((comment) => parentIdOf(comment) === parent._id);
  // A reply whose parent is missing (deleted parent) would otherwise
  // vanish — show it at top level so no comment is ever hidden.
  const orphanReplies = comments.filter(
    (comment) =>
      parentIdOf(comment) !== null && !comments.some((c) => c._id === parentIdOf(comment)),
  );
  const visibleTopLevel = [...topLevelComments, ...orphanReplies];

  return (
    <Container size={640} px="md">
      <Stack gap="md">
        <PostCard post={post} />

        <Text fw={600} size="lg">
          Comments ({post.commentsCount ?? 0})
        </Text>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!content.trim()) return;
            createMutation.mutate({ content: content.trim() });
          }}>
          <Group gap="xs" align="flex-end">
            <TextInput
              aria-label="Write a comment"
              placeholder="Write a comment..."
              value={content}
              onChange={(e) => setContent(e.currentTarget.value)}
              style={{ flex: 1 }}
            />
            <Button type="submit" loading={createMutation.isPending} disabled={!content.trim()}>
              Post
            </Button>
          </Group>
        </form>

        {commentsQuery.isPending ? (
          <Skeleton height={60} radius="md" />
        ) : commentsQuery.isError ? (
          <Alert color="red" title="Couldn't load comments">
            <Button mt="sm" onClick={() => commentsQuery.refetch()}>
              Retry
            </Button>
          </Alert>
        ) : comments.length === 0 ? (
          <Text c="dimmed">No comments yet — be the first.</Text>
        ) : (
          <Stack gap="sm">
            {visibleTopLevel.map((comment) => {
              const replies = repliesFor(comment);
              return (
                <Stack key={comment._id} gap="sm">
                  <CommentItem comment={comment} postId={postId} postOwnerId={post.user._id} />
                  {replies.length > 0 && (
                    <Box ml="xl" pl="md" style={{ borderLeft: "2px solid var(--mantine-color-default-border)" }}>
                      <Stack gap="sm">
                        {replies.map((reply) => (
                          <CommentItem key={reply._id} comment={reply} postId={postId} postOwnerId={post.user._id} />
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              );
            })}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
