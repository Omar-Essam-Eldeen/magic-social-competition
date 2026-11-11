import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ActionIcon, Avatar, Box, Button, Card, FileInput, Group, Image, Stack, Text, TextInput } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Pencil, Trash2 } from "lucide-react";
import type { Comment } from "../../../api/Posts/Comments/types.ts";
import { createReply, deleteComment, getReplies, likeComment, updateComment } from "../../../api/Posts/Comments/api.ts";
import { useAuth } from "../../../context/useAuth.ts";

const LIKED_COLOR = "#fb4d6d";

/** Relative time ("2h ago"); never renders "Invalid Date". */
function formatRelativeTime(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return formatDistanceToNow(date, { addSuffix: true });
}

export default function CommentItem({
  comment,
  postId,
  postOwnerId,
  // A reply rendered inside its parent has no Reply button and fetches no
  // replies of its own — the UI supports exactly one reply level, which is
  // what it can display (the API has no read path for replies to replies).
  nested = false,
}: {
  comment: Comment;
  postId: string;
  postOwnerId: string;
  nested?: boolean;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const previewRef = useRef<string | null>(null);
  // Inline reply form state.
  const [replying, setReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyImage, setReplyImage] = useState<File | null>(null);

  // Release the temporary object URL when the item unmounts.
  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  // Derive the preview URL in the change handler (not in an effect).
  const handleImageChange = (file: File | null) => {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }
    setImage(file);
    if (file) {
      const url = URL.createObjectURL(file);
      previewRef.current = url;
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const clearImage = () => {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }
    setImage(null);
    setPreview(null);
  };

  // C-3: a comment whose author is gone (deleted user / malformed data) must
  // not crash — fall back to "Deleted user".
  const creator = comment.commentCreator;
  const creatorName = creator?.name ?? "Deleted user";
  const isMine = user?._id === creator?._id;
  // The API lets the comment owner OR the post owner delete a comment.
  const canDelete = isMine || user?._id === postOwnerId;
  const liked = user ? (comment.likes ?? []).includes(user._id) : false;
  const likesCount = (comment.likes ?? []).length;
  const relativeTime = formatRelativeTime(comment.createdAt);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    queryClient.invalidateQueries({ queryKey: ["post", postId] });
  };

  // Replies live on their own endpoint (GET .../comments/:id/replies) — the
  // comments list never contains them. Top-level items fetch theirs here;
  // nested replies don't (one reply level, by design).
  const repliesQuery = useQuery({
    queryKey: ["replies", postId, comment._id],
    queryFn: () => getReplies(postId, comment._id),
    enabled: !nested,
  });
  const replies = repliesQuery.data?.data.replies ?? [];

  const likeMutation = useMutation({
    mutationFn: () => likeComment(postId, comment._id),
    onSuccess: refresh,
    onError: () =>
      notifications.show({ color: "red", title: "Couldn't like this comment", message: "Try again." }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteComment(postId, comment._id),
    onSuccess: refresh,
    onError: () =>
      notifications.show({ color: "red", title: "Couldn't delete this comment", message: "Try again." }),
  });

  const updateMutation = useMutation({
    mutationFn: (req: { content: string; image?: File | null }) =>
      updateComment(postId, comment._id, { content: req.content, image: req.image ?? null }),
    onSuccess: () => {
      setEditing(false);
      clearImage();
      refresh();
    },
  });

  // Replies go to the dedicated /replies endpoint — the create-comment
  // endpoint rejects a parentComment field outright.
  const replyMutation = useMutation({
    mutationFn: (req: { content: string; image?: File | null }) =>
      createReply(postId, comment._id, { content: req.content, image: req.image ?? null }),
    onSuccess: () => {
      setReplyContent("");
      setReplyImage(null);
      setReplying(false);
      queryClient.invalidateQueries({ queryKey: ["replies", postId, comment._id] });
      refresh();
    },
    onError: () =>
      notifications.show({ color: "red", title: "Couldn't post your reply", message: "Try again." }),
  });

  const handleDelete = () => {
    modals.openConfirmModal({
      title: "Delete this comment?",
      children: <Text size="sm">This can&apos;t be undone.</Text>,
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => deleteMutation.mutate(),
    });
  };

  // Sync the draft from the current comment when entering edit mode, so a
  // refetch that happened while idle never leaves a stale draft.
  const handleStartEdit = () => {
    setDraft(comment.content);
    clearImage();
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setDraft(comment.content);
    clearImage();
  };

  return (
    <Card padding="md">
      <Group gap="sm" mb="xs">
        <Avatar src={creator?.photo} alt={creatorName} radius="xl" size="sm">
          {creator?.name?.[0]}
        </Avatar>
        <div>
          <Text fw={700} size="sm" ff="Sora, system-ui, sans-serif">
            {creatorName}
          </Text>
          {relativeTime && (
            <Text size="xs" c="dimmed">
              {relativeTime}
            </Text>
          )}
        </div>
      </Group>

      {editing ? (
        <>
          <Group gap="xs" align="flex-end">
            <TextInput
              aria-label="Edit comment"
              value={draft}
              onChange={(e) => setDraft(e.currentTarget.value)}
              style={{ flex: 1 }}
            />
            <Button
              size="xs"
              loading={updateMutation.isPending}
              disabled={!draft.trim() && !image}
              onClick={() => updateMutation.mutate({ content: draft.trim(), image })}>
              Save
            </Button>
            <Button size="xs" variant="subtle" onClick={handleCancelEdit}>
              Cancel
            </Button>
          </Group>
          {preview ? (
            <Image src={preview} alt="New comment image preview" loading="lazy" radius="md" mt="xs" />
          ) : (
            comment.image && (
              <Image
                src={comment.image}
                alt={`Photo in a comment by ${creatorName}`}
                loading="lazy"
                radius="md"
                mt="xs"
              />
            )
          )}
          <FileInput
            aria-label="Change comment image"
            placeholder="Change image (optional)"
            accept="image/*"
            value={image}
            onChange={handleImageChange}
            clearable
            mt="xs"
          />
          {updateMutation.isError && (
            <Text c="red" size="sm">
              Couldn&apos;t save — try again.
            </Text>
          )}
        </>
      ) : (
        <>
          <Text size="sm">{comment.content}</Text>
          {comment.image && (
            <Image
              src={comment.image}
              alt={`Photo in a comment by ${creatorName}`}
              loading="lazy"
              radius="md"
              mt="xs"
            />
          )}
        </>
      )}

      <Group gap="xs" mt="sm">
        <ActionIcon
          variant="subtle"
          aria-label={`${likesCount} likes`}
          aria-pressed={liked}
          disabled={likeMutation.isPending}
          onClick={() => likeMutation.mutate()}>
          <Heart size={16} color={liked ? LIKED_COLOR : undefined} fill={liked ? LIKED_COLOR : "none"} />
        </ActionIcon>
        <Text size="sm">{likesCount}</Text>
        {!editing && !nested && (
          <Button
            variant="subtle"
            size="xs"
            leftSection={<MessageCircle size={16} />}
            onClick={() => setReplying((v) => !v)}>
            Reply
          </Button>
        )}
        {isMine && !editing && (
          <ActionIcon variant="subtle" aria-label="Edit comment" onClick={handleStartEdit}>
            <Pencil size={16} />
          </ActionIcon>
        )}
        {canDelete && (
          <ActionIcon
            variant="subtle"
            aria-label="Delete comment"
            color="red"
            disabled={deleteMutation.isPending}
            onClick={handleDelete}>
            <Trash2 size={16} />
          </ActionIcon>
        )}
      </Group>

      {replying && !editing && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!replyContent.trim() && !replyImage) return;
            replyMutation.mutate({ content: replyContent.trim(), image: replyImage });
          }}>
          <Stack gap="xs" mt="sm">
            <Group gap="xs" align="flex-end">
              <TextInput
                aria-label={`Reply to ${creatorName}`}
                placeholder={`Reply to ${creatorName}...`}
                value={replyContent}
                onChange={(e) => setReplyContent(e.currentTarget.value)}
                style={{ flex: 1 }}
              />
              <Button
                type="submit"
                size="xs"
                loading={replyMutation.isPending}
                disabled={!replyContent.trim() && !replyImage}>
                Post
              </Button>
              <Button
                size="xs"
                variant="subtle"
                onClick={() => {
                  setReplying(false);
                  setReplyContent("");
                  setReplyImage(null);
                }}>
                Cancel
              </Button>
            </Group>
            <FileInput
              aria-label="Attach an image to your reply"
              placeholder="Add an image (optional)"
              accept="image/*"
              value={replyImage}
              onChange={setReplyImage}
              clearable
              size="xs"
            />
            {replyMutation.isError && (
              <Text c="red" size="sm">
                Couldn&apos;t post your reply — try again.
              </Text>
            )}
          </Stack>
        </form>
      )}
      {!nested && replies.length > 0 && (
        <Box ml="xl" pl="md" mt="sm" style={{ borderLeft: "2px solid var(--mantine-color-default-border)" }}>
          <Stack gap="sm">
            {replies.map((reply) => (
              <CommentItem key={reply._id} comment={reply} postId={postId} postOwnerId={postOwnerId} nested />
            ))}
          </Stack>
        </Box>
      )}
    </Card>
  );
}
