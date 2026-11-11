import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ActionIcon,
  Avatar,
  Button,
  Card,
  FileInput,
  Group,
  Image,
  Modal,
  Text,
  Textarea,
  UnstyledButton,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { Bookmark, Heart, MessageCircle, Pencil, Share2, Trash2 } from "lucide-react";
import type { Post } from "../../types.ts";
import type { UpdatePostReq } from "../../api/Posts/types.ts";
import { bookmarkPost, deletePost, likePost, sharePost, updatePost } from "../../api/Posts/api.ts";
import { useAuth } from "../../context/useAuth.ts";
import { useLanguage } from "../../context/useLanguage.ts";
import type { Language } from "../../i18n/dictionary.ts";
import LikersModal from "./LikersModal.tsx";

const LIKED_COLOR = "#fb4d6d";
const SAVED_COLOR = "#8b5cf6";

/** Post photos: 16/9 cover, 12px radius, pointer when they open the lightbox. */
const POST_IMAGE_STYLE = { aspectRatio: "16 / 9", objectFit: "cover" } as const;

/** Relative time ("2h ago"); never renders "Invalid Date". */
function formatRelativeTime(value: string | undefined, lang: Language): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return formatDistanceToNow(date, { addSuffix: true, locale: lang === "ar" ? ar : enUS });
}

function capitalize(value?: string): string {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function PostCard({ post }: { post: Post }) {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.body ?? "");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const previewRef = useRef<string | null>(null);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const [likePop, setLikePop] = useState(false);
  const [likersOpen, setLikersOpen] = useState(false);

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
      notifications.show({ color: "red", title: t.post.likeErrorTitle, message: t.common.tryAgain }),
  });

  const shareMutation = useMutation({
    mutationFn: (postId: string) => sharePost(postId),
    onSuccess: refresh,
    onError: () =>
      notifications.show({ color: "red", title: t.post.shareErrorTitle, message: t.common.tryAgain }),
  });

  const bookmarkMutation = useMutation({
    mutationFn: (postId: string) => bookmarkPost(postId),
    onSuccess: refresh,
    onError: () =>
      notifications.show({ color: "red", title: t.post.saveErrorTitle, message: t.common.tryAgain }),
  });

  const updateMutation = useMutation({
    mutationFn: (req: UpdatePostReq) => updatePost(post._id, req),
    onSuccess: () => {
      setEditing(false);
      clearImage();
      refresh();
    },
    onError: () =>
      notifications.show({ color: "red", title: t.post.updateErrorTitle, message: t.common.tryAgain }),
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
      notifications.show({ color: "red", title: t.post.deleteErrorTitle, message: t.common.tryAgain }),
  });

  const handleDelete = () => {
    modals.openConfirmModal({
      title: t.post.deleteTitle,
      children: <Text size="sm">{t.post.deleteText}</Text>,
      labels: { confirm: t.common.delete, cancel: t.common.cancel },
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

  const handleLike = () => {
    setLikePop(true);
    likeMutation.mutate(post._id);
  };

  // C-2: a post whose author is gone (deleted user / malformed data) must not
  // crash the feed — render a fallback card instead.
  if (!post.user) {
    return (
      <Card padding="lg">
        <Text c="dimmed">{t.post.unavailable}</Text>
      </Card>
    );
  }

  const relativeTime = formatRelativeTime(post.createdAt, lang);
  // Privacy is a free-form API string — map the known values, fall back to
  // the capitalized raw value for anything unknown.
  const privacyKey = post.privacy?.toLowerCase();
  const privacy =
    privacyKey === "public"
      ? t.post.privacyPublic
      : privacyKey === "friends"
        ? t.post.privacyFriends
        : privacyKey === "only me" || privacyKey === "onlyme" || privacyKey === "only_me"
          ? t.post.privacyOnlyMe
          : capitalize(post.privacy);
  const likesCount = post.likesCount ?? 0;
  const commentsCount = post.commentsCount ?? 0;
  const sharesCount = post.sharesCount ?? 0;
  const topComment = post.topComment;
  const topCommentAuthor = topComment?.commentCreator?.name ?? t.common.deletedUser;
  const sharedPost = post.sharedPost;
  const sharedAuthorName = sharedPost?.user?.name ?? t.common.deletedUser;
  const postImageAlt = t.post.photoAlt(post.user.name);
  const sharedImageAlt = t.post.photoAlt(sharedAuthorName);

  return (
    <Card padding="lg">
      <Group gap="sm" mb="sm">
        <UnstyledButton
          aria-label={t.post.viewProfile(post.user.name)}
          onClick={() => navigate(`/users/${post.user._id}`)}
          style={{ display: "flex" }}>
          <Avatar src={post.user.photo} alt={post.user.name} radius="xl" size={46}>
            {post.user.name?.[0]}
          </Avatar>
        </UnstyledButton>
        <div>
          <UnstyledButton onClick={() => navigate(`/users/${post.user._id}`)} aria-label={t.post.viewProfile(post.user.name)}>
            <Text fw={700} size="sm" ff="Sora, system-ui, sans-serif">
              {post.user.name}
            </Text>
          </UnstyledButton>
          <Text size="xs" c="dimmed">
            <span dir="ltr">@{post.user.username}</span>
            {relativeTime ? ` · ${relativeTime}` : ""}
            {privacy ? ` · ${privacy}` : ""}
          </Text>
        </div>
      </Group>

      {editing ? (
        <>
          <Textarea
            aria-label={t.post.editTextAria}
            value={draft}
            onChange={(e) => setDraft(e.currentTarget.value)}
            autosize
            minRows={2}
            mb="sm"
          />
          {preview ? (
            <Image src={preview} alt={t.post.newImagePreviewAlt} loading="lazy" radius="md" style={POST_IMAGE_STYLE} mb="sm" />
          ) : (
            post.image && (
              <Image
                src={post.image}
                alt={postImageAlt}
                loading="lazy"
                radius="md"
                style={POST_IMAGE_STYLE}
                mb="sm"
              />
            )
          )}
          <FileInput
            placeholder={t.post.changeImagePlaceholder}
            accept="image/*"
            value={image}
            onChange={handleImageChange}
            clearable
            mb="sm"
          />
          <Group gap="xs" mb="sm">
            <Button
              size="xs"
              loading={updateMutation.isPending}
              disabled={!draft.trim() && !image}
              onClick={() => updateMutation.mutate({ body: draft.trim(), image })}>
              {t.common.save}
            </Button>
            <Button size="xs" variant="subtle" onClick={handleCancelEdit}>
              {t.common.cancel}
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
              <Text fw={700} size="sm" ff="Sora, system-ui, sans-serif">
                {sharedAuthorName}
              </Text>
              {formatRelativeTime(sharedPost.createdAt, lang) && (
                <Text size="xs" c="dimmed">
                  {formatRelativeTime(sharedPost.createdAt, lang)}
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
            <UnstyledButton
              aria-label={t.post.viewFullPhoto(sharedImageAlt)}
              onClick={() => setLightbox({ src: sharedPost.image as string, alt: sharedImageAlt })}
              style={{ display: "block", width: "100%" }}>
              <Image src={sharedPost.image} alt={sharedImageAlt} loading="lazy" radius="md" style={POST_IMAGE_STYLE} />
            </UnstyledButton>
          )}
        </Card>
      )}

      {!editing && post.image && (
        <UnstyledButton
          aria-label={t.post.viewFullPhoto(postImageAlt)}
          onClick={() => setLightbox({ src: post.image as string, alt: postImageAlt })}
          style={{ display: "block", width: "100%", marginBottom: 12 }}>
          <Image src={post.image} alt={postImageAlt} loading="lazy" radius="md" style={POST_IMAGE_STYLE} />
        </UnstyledButton>
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
          aria-label={t.post.topCommentAria(topCommentAuthor, topComment.content)}>
          <Text size="sm">
            <Text span fw={700}>
              {topCommentAuthor}:{" "}
            </Text>
            {topComment.content}
          </Text>
        </Card>
      )}

      {/* Post actions: keep on one line — with the owner edit/delete icons
          the row is ~346px at gap="lg" and wrapped on 390px screens, leaving
          the delete icon dangling alone on a second line. gap="sm" fits. */}
      <Group gap="sm">
        <Group gap={4}>
          <ActionIcon
            variant="subtle"
            aria-label={t.post.likesAria(likesCount)}
            aria-pressed={liked}
            disabled={likeMutation.isPending}
            className={likePop ? "like-pop" : undefined}
            onAnimationEnd={() => setLikePop(false)}
            onClick={handleLike}>
            <Heart size={18} color={liked ? LIKED_COLOR : undefined} fill={liked ? LIKED_COLOR : "none"} />
          </ActionIcon>
          <UnstyledButton
            aria-label={t.post.viewLikersAria(likesCount)}
            onClick={() => setLikersOpen(true)}>
            <Text size="sm">{likesCount}</Text>
          </UnstyledButton>
        </Group>

        <Group gap={4}>
          <ActionIcon
            variant="subtle"
            aria-label={t.post.commentsAria(commentsCount)}
            onClick={() => navigate(`/posts/${post._id}`)}>
            <MessageCircle size={18} />
          </ActionIcon>
          <Text size="sm">{commentsCount}</Text>
        </Group>

        <Group gap={4}>
          <ActionIcon
            variant="subtle"
            aria-label={t.post.sharesAria(sharesCount)}
            disabled={shareMutation.isPending}
            onClick={() => shareMutation.mutate(post._id)}>
            <Share2 size={18} />
          </ActionIcon>
          <Text size="sm">{sharesCount}</Text>
        </Group>

        <ActionIcon
          variant="subtle"
          aria-label={post.bookmarked ? t.post.removeBookmarkAria : t.post.bookmarkAria}
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
            <ActionIcon variant="subtle" aria-label={t.post.editAria} onClick={handleStartEdit}>
              <Pencil size={16} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              aria-label={t.post.deleteAria}
              color="red"
              disabled={deleteMutation.isPending}
              onClick={handleDelete}>
              <Trash2 size={16} />
            </ActionIcon>
          </>
        )}
      </Group>

      <Modal
        opened={lightbox !== null}
        onClose={() => setLightbox(null)}
        size="lg"
        centered
        title={lightbox?.alt ?? t.common.photo}>
        {lightbox && <Image src={lightbox.src} alt={lightbox.alt} radius="md" />}
      </Modal>

      <LikersModal postId={likersOpen ? post._id : null} onClose={() => setLikersOpen(false)} />
    </Card>
  );
}
