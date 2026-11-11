import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { ActionIcon, Avatar, Button, Card, FileInput, Group, Image, Text, Textarea } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { formatDistanceToNow } from "date-fns";
import { Bookmark, Heart, MessageCircle, Pencil, Share2, Trash2 } from "lucide-react";
import type { Post } from "../../types.ts";
import type { UpdatePostReq } from "../../api/Posts/types.ts";
import { bookmarkPost, deletePost, likePost, sharePost, updatePost } from "../../api/Posts/api.ts";
import { useAuth } from "../../context/useAuth.ts";

const LIKED_COLOR = "#fb4d6d";
const SAVED_COLOR = "#22d3ee";

/** Relative time ("2h ago"); never renders "Invalid Date". */
function formatRelativeTime(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return formatDistanceToNow(date, { addSuffix: true });
}

function capitalize(value?: string): string {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function PostCard({ post }: { post: Post }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.body ?? "");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const previewRef = useRef<string | null>(null);

  // Release the temporary object URL when the card unmounts.
  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  // Derive the preview URL in the change handler (not in an effect) so no
  // state is set inside an effect. The old URL is released before a new one
  // is created.
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

  // Did I like this post? The API sends the list of user ids who liked it.
  const liked = user ? (post.likes ?? []).includes(user._id) : false;
  const isMine = user?._id === post.user?._id;

  // After any action, refetch the lists so the counts update.
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["posts"] });
    queryClient.invalidateQueries({ queryKey: ["post"] });
    queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    queryClient.invalidateQueries({ queryKey: ["userPosts"] });
  };

  const likeMutation = useMutation({
    mutationFn: (postId: string) => likePost(postId),
    onSuccess: refresh,
    onError: () =>
      notifications.show({ color: "red", title: "Couldn't like this post", message: "Try again." }),
  });

  const shareMutation = useMutation({
    mutationFn: (postId: string) => sharePost(postId),
    onSuccess: refresh,
    onError: () =>
      notifications.show({ color: "red", title: "Couldn't share this post", message: "Try again." }),
  });

  const bookmarkMutation = useMutation({
    mutationFn: (postId: string) => bookmarkPost(postId),
    onSuccess: refresh,
    onError: () =>
      notifications.show({ color: "red", title: "Couldn't save this post", message: "Try again." }),
  });

  const updateMutation = useMutation({
    mutationFn: (req: UpdatePostReq) => updatePost(post._id, req),
    onSuccess: () => {
      setEditing(false);
      clearImage();
      refresh();
    },
    onError: () =>
      notifications.show({ color: "red", title: "Couldn't save your changes", message: "Try again." }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(post._id),
    onSuccess: () => {
      refresh();
      // Deleting from the details page would otherwise land on a 404 error
      // screen when the page refetches the deleted post.
      if (location.pathname.startsWith("/posts/")) navigate("/");
    },
    onError: () =>
      notifications.show({ color: "red", title: "Couldn't delete this post", message: "Try again." }),
  });

  const handleDelete = () => {
    modals.openConfirmModal({
      title: "Delete this post?",
      children: <Text size="sm">This can&apos;t be undone.</Text>,
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => deleteMutation.mutate(),
    });
  };

  // Sync the draft from the current post when entering edit mode, so a
  // refetch that happened while the card was idle never leaves a stale draft.
  const handleStartEdit = () => {
    setDraft(post.body ?? "");
    clearImage();
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setDraft(post.body ?? "");
    clearImage();
  };

  // C-2: a post whose author is gone (deleted user / malformed data) must not
  // crash the feed — render a fallback card instead.
  if (!post.user) {
    return (
      <Card padding="lg" className="post-card">
        <Text c="dimmed">Post unavailable</Text>
      </Card>
    );
  }

  const relativeTime = formatRelativeTime(post.createdAt);
  const privacy = capitalize(post.privacy);
  const likesCount = post.likesCount ?? 0;
  const commentsCount = post.commentsCount ?? 0;
  const sharesCount = post.sharesCount ?? 0;
  const topComment = post.topComment;
  const topCommentAuthor = topComment?.commentCreator?.name ?? "Deleted user";
  const sharedPost = post.sharedPost;
  const sharedAuthorName = sharedPost?.user?.name ?? "Deleted user";

  return (
    <Card padding="lg" className="post-card">
      <Group gap="sm" mb="sm">
        <div className="av-ring">
          <Avatar src={post.user.photo} alt={post.user.name} radius="xl" size={46}>
            {post.user.name?.[0]}
          </Avatar>
        </div>
        <div>
          <Text fw={700} size="sm" className="font-display">
            {post.user.name}
          </Text>
          <Text size="xs" c="dimmed">
            @{post.user.username}
            {relativeTime ? ` · ${relativeTime}` : ""}
            {privacy ? ` · ${privacy}` : ""}
          </Text>
        </div>
      </Group>

      {editing ? (
        <>
          <Textarea
            aria-label="Edit post text"
            value={draft}
            onChange={(e) => setDraft(e.currentTarget.value)}
            autosize
            minRows={2}
            mb="sm"
          />
          {preview ? (
            <Image src={preview} alt="New image preview" loading="lazy" className="post-image" mb="sm" />
          ) : (
            post.image && (
              <Image
                src={post.image}
                alt={`Photo in a post by ${post.user.name}`}
                loading="lazy"
                className="post-image"
                mb="sm"
              />
            )
          )}
          <FileInput
            aria-label="Change post image"
            placeholder="Change image (optional)"
            accept="image/*"
            value={image}
            onChange={handleImageChange}
            clearable
            mb="sm"
          />
          <Group gap="xs" mb="sm">
            <Button
              size="xs"
              className="btn-gradient"
              loading={updateMutation.isPending}
              disabled={!draft.trim() && !image}
              onClick={() => updateMutation.mutate({ body: draft.trim(), image })}>
              Save
            </Button>
            <Button size="xs" variant="subtle" onClick={handleCancelEdit}>
              Cancel
            </Button>
          </Group>
        </>
      ) : (
        post.body && (
          <Text size="sm" mb="sm">
            {post.body}
          </Text>
        )
      )}

      {!editing && post.isShare && sharedPost && (
        <Card withBorder radius="md" padding="sm" mb="sm">
          <Group gap="xs" mb="xs">
            <Avatar src={sharedPost.user?.photo} alt={sharedAuthorName} radius="xl" size="sm">
              {sharedPost.user?.name?.[0]}
            </Avatar>
            <div>
              <Text fw={700} size="sm" className="font-display">
                {sharedAuthorName}
              </Text>
              {formatRelativeTime(sharedPost.createdAt) && (
                <Text size="xs" c="dimmed">
                  {formatRelativeTime(sharedPost.createdAt)}
                </Text>
              )}
            </div>
          </Group>
          {sharedPost.body && (
            <Text size="sm" mb={sharedPost.image ? "sm" : undefined}>
              {sharedPost.body}
            </Text>
          )}
          {sharedPost.image && (
            <Image
              src={sharedPost.image}
              alt={`Photo in a post by ${sharedAuthorName}`}
              loading="lazy"
              className="post-image"
            />
          )}
        </Card>
      )}

      {!editing && post.image && (
        <Image
          src={post.image}
          alt={`Photo in a post by ${post.user.name}`}
          loading="lazy"
          className="post-image"
          mb="sm"
        />
      )}

      {topComment?.content && (
        <Card
          withBorder
          radius="md"
          padding="sm"
          mb="sm"
          style={{ cursor: "pointer" }}
          onClick={() => navigate(`/posts/${post._id}`)}
          onKeyDown={(e) => {
            if (e.key === "Enter") navigate(`/posts/${post._id}`);
          }}
          tabIndex={0}
          role="button"
          aria-label={`Top comment by ${topCommentAuthor}: view post`}>
          <Text size="sm">
            <Text span fw={700}>
              {topCommentAuthor}:{" "}
            </Text>
            {topComment.content}
          </Text>
        </Card>
      )}

      <Group gap="lg">
        <Group gap={4}>
          <ActionIcon
            variant="subtle"
            aria-label={`${likesCount} likes`}
            aria-pressed={liked}
            disabled={likeMutation.isPending}
            onClick={() => likeMutation.mutate(post._id)}>
            <Heart size={18} color={liked ? LIKED_COLOR : undefined} fill={liked ? LIKED_COLOR : "none"} />
          </ActionIcon>
          <Text size="sm">{likesCount}</Text>
        </Group>

        <Group gap={4}>
          <ActionIcon
            variant="subtle"
            aria-label={`${commentsCount} comments`}
            onClick={() => navigate(`/posts/${post._id}`)}>
            <MessageCircle size={18} />
          </ActionIcon>
          <Text size="sm">{commentsCount}</Text>
        </Group>

        <Group gap={4}>
          <ActionIcon
            variant="subtle"
            aria-label={`${sharesCount} shares`}
            disabled={shareMutation.isPending}
            onClick={() => shareMutation.mutate(post._id)}>
            <Share2 size={18} />
          </ActionIcon>
          <Text size="sm">{sharesCount}</Text>
        </Group>

        <ActionIcon
          variant="subtle"
          aria-label={post.bookmarked ? "Remove bookmark" : "Bookmark post"}
          aria-pressed={post.bookmarked}
          disabled={bookmarkMutation.isPending}
          onClick={() => bookmarkMutation.mutate(post._id)}>
          <Bookmark
            size={18}
            color={post.bookmarked ? SAVED_COLOR : undefined}
            fill={post.bookmarked ? SAVED_COLOR : "none"}
          />
        </ActionIcon>

        {isMine && !editing && (
          <>
            <ActionIcon variant="subtle" aria-label="Edit post" onClick={handleStartEdit}>
              <Pencil size={16} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              aria-label="Delete post"
              color="red"
              disabled={deleteMutation.isPending}
              onClick={handleDelete}>
              <Trash2 size={16} />
            </ActionIcon>
          </>
        )}
      </Group>
    </Card>
  );
}
