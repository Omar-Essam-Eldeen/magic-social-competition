import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Card,
  FileInput,
  Group,
  Image,
  Paper,
  Popover,
  Stack,
  Text,
  Textarea,
  UnstyledButton,
} from "@mantine/core";
import { Smile, X } from "lucide-react";
import { notifications } from "@mantine/notifications";
import { createPost } from "../../api/Posts/api.ts";
import type { CreatePostReq } from "../../api/Posts/types.ts";
import { useAuth } from "../../context/useAuth.ts";
import { useLanguage } from "../../context/useLanguage.ts";
import { useKnownUsers } from "../../hooks/useKnownUsers.ts";
import {
  COMPOSER_EMOJIS,
  composerDraftKey,
  findMentionQuery,
  insertAtCursor,
  insertMention,
  type KnownUser,
} from "../../utils/mentions.ts";

const MENTION_SUGGESTIONS_LIMIT = 5;
const DRAFT_SAVE_DELAY_MS = 400;

export default function Composer({ onCreated }: { onCreated?: () => void }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const previewRef = useRef<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Round 5 M3 — draft: text only, per user, localStorage only, never
  // leaves the device. Image attachments are NOT persisted.
  const draftKey = user ? composerDraftKey(user._id) : null;
  const draftLoadedRef = useRef(false);
  // Restore once the user id is known (it loads async from the profile
  // endpoint). Only restores into an untouched composer.
  useEffect(() => {
    if (!draftKey || draftLoadedRef.current) return;
    draftLoadedRef.current = true;
    try {
      const saved = localStorage.getItem(draftKey);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setBody(saved);
    } catch {
      // Storage unavailable (private mode) — compose without a draft.
    }
  }, [draftKey]);
  // Debounced autosave; empty text clears the stored draft.
  useEffect(() => {
    if (!draftKey || !draftLoadedRef.current) return;
    const id = window.setTimeout(() => {
      try {
        if (body.trim()) localStorage.setItem(draftKey, body);
        else localStorage.removeItem(draftKey);
      } catch {
        // Storage unavailable — the post still works, just no draft.
      }
    }, DRAFT_SAVE_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [body, draftKey]);

  // Round 5 M1 — @ autocomplete, fed by the same known-users map as the
  // rendering (suggestions first). Selecting inserts @username at the caret.
  const { list: knownList } = useKnownUsers();
  const [mention, setMention] = useState<{ query: string; start: number } | null>(null);
  const [activeMention, setActiveMention] = useState(0);
  const mentionMatches: KnownUser[] =
    mention === null
      ? []
      : knownList
          .filter((candidate) => {
            const q = mention.query.toLowerCase();
            return (
              candidate.username.toLowerCase().startsWith(q) ||
              candidate.name.toLowerCase().includes(q)
            );
          })
          .slice(0, MENTION_SUGGESTIONS_LIMIT);

  const updateMention = (value: string, caret: number) => {
    setMention(findMentionQuery(value, caret));
    setActiveMention(0);
  };

  const handleBodyChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.currentTarget.value;
    setBody(value);
    updateMention(value, e.currentTarget.selectionStart ?? value.length);
  };

  // Moving the caret (click / arrow keys) can leave an "@query" behind.
  const handleCaretMove = () => {
    const el = textareaRef.current;
    if (!el) return;
    updateMention(body, el.selectionStart ?? body.length);
  };

  const applyTextAtCaret = (next: { text: string; caret: number }) => {
    setBody(next.text);
    setMention(null);
    // The textarea re-renders with the new value first; restore the caret
    // on the next frame so it lands after the inserted text.
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(next.caret, next.caret);
    });
  };

  const chooseMention = (candidate: KnownUser) => {
    const el = textareaRef.current;
    const caret = el?.selectionStart ?? body.length;
    const next = insertMention(body, caret, candidate.username);
    if (next) applyTextAtCaret(next);
  };

  // Round 5 M3 — emoji picker: curated built-in set, inserts at the caret.
  const [emojiOpen, setEmojiOpen] = useState(false);
  const insertEmoji = (emoji: string) => {
    const el = textareaRef.current;
    applyTextAtCaret(insertAtCursor(body, el?.selectionStart ?? null, emoji));
  };

  const handleMentionKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (mention === null || mentionMatches.length === 0) {
      if (e.key === "Escape") setMention(null);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveMention((i) => (i + 1) % mentionMatches.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveMention((i) => (i - 1 + mentionMatches.length) % mentionMatches.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      chooseMention(mentionMatches[activeMention]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setMention(null);
    }
  };

  // Release the temporary object URL when the composer unmounts.
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

  const createMutation = useMutation({
    mutationFn: (data: CreatePostReq) => createPost(data),
    onSuccess: () => {
      setBody("");
      setMention(null);
      clearImage();
      // A posted draft is gone — never restore it on the next mount.
      if (draftKey) {
        try {
          localStorage.removeItem(draftKey);
        } catch {
          // Storage unavailable — nothing to clear.
        }
      }
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
      // Mantine 9 requires `message` on NotificationData; an empty string
      // keeps the toast title-only (the message line is not rendered).
      notifications.show({ title: t.composer.postCreatedTitle, message: "" });
      // A modal host passes this so the dialog closes once the post is live.
      onCreated?.();
    },
    onError: () =>
      notifications.show({ color: "red", title: t.composer.createErrorTitle, message: t.common.tryAgain }),
  });

  return (
    <Card
      padding="lg"
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith("image/")) handleImageChange(file);
      }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!body.trim()) return;
          createMutation.mutate({ body: body.trim(), image });
        }}>
        <Stack gap="sm">
          {dragActive && (
            <Box
              style={{
                border: "2px dashed var(--tag-color)",
                borderRadius: 16,
                padding: "var(--mantine-spacing-md)",
              }}>
              <Text ta="center">{t.composer.dragActive}</Text>
            </Box>
          )}
          <Box pos="relative">
            <Textarea
              ref={textareaRef}
              aria-label={t.composer.ariaLabel}
              placeholder={t.composer.placeholder}
              value={body}
              onChange={handleBodyChange}
              onKeyDown={handleMentionKeyDown}
              onClick={handleCaretMove}
              onKeyUp={handleCaretMove}
              autosize
              minRows={2}
            />
            {mention !== null && mentionMatches.length > 0 && (
              <Paper
                shadow="md"
                radius="md"
                withBorder
                role="listbox"
                aria-label={t.composer.mentionListLabel}
                style={{
                  position: "absolute",
                  insetInline: 0,
                  top: "100%",
                  zIndex: 10,
                  marginTop: 4,
                  maxHeight: 240,
                  overflowY: "auto",
                }}>
                {mentionMatches.map((candidate, index) => (
                  <UnstyledButton
                    key={candidate._id}
                    role="option"
                    aria-selected={index === activeMention}
                    aria-label={t.composer.mentionAria(candidate.name, candidate.username)}
                    // mousedown fires before blur: prevent the default so
                    // the textarea keeps focus and the caret stays put.
                    onMouseDown={(e) => {
                      e.preventDefault();
                      chooseMention(candidate);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      width: "100%",
                      padding: "8px 12px",
                      background:
                        index === activeMention ? "var(--mantine-color-default-hover)" : "transparent",
                    }}>
                    <Avatar src={candidate.photo} alt={candidate.name} radius="xl" size="sm">
                      {candidate.name?.[0]}
                    </Avatar>
                    <Text size="sm" fw={700} style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                      {candidate.name}
                    </Text>
                    <Text size="sm" c="dimmed">
                      <span dir="ltr">@{candidate.username}</span>
                    </Text>
                  </UnstyledButton>
                ))}
              </Paper>
            )}
          </Box>
          <Group justify="space-between" align="center">
            <Popover opened={emojiOpen} onChange={setEmojiOpen} position="top-start" shadow="md" withArrow>
              <Popover.Target>
                <ActionIcon
                  variant="subtle"
                  size="lg"
                  aria-label={t.composer.emojiPickerAria}
                  aria-expanded={emojiOpen}
                  onClick={() => setEmojiOpen((v) => !v)}>
                  <Smile size={20} />
                </ActionIcon>
              </Popover.Target>
              <Popover.Dropdown p="xs">
                <Group gap={2} style={{ maxWidth: 264 }}>
                  {COMPOSER_EMOJIS.map((emoji) => (
                    <ActionIcon
                      key={emoji}
                      variant="subtle"
                      size="lg"
                      aria-label={t.composer.emojiAria(emoji)}
                      onClick={() => insertEmoji(emoji)}>
                      <Text size="lg">{emoji}</Text>
                    </ActionIcon>
                  ))}
                </Group>
              </Popover.Dropdown>
            </Popover>
            <Text size="xs" c="dimmed" ta="end">
              {t.composer.chars(body.length)}
            </Text>
          </Group>
          <FileInput
            aria-label={t.composer.addImageAria}
            placeholder={t.composer.addImagePlaceholder}
            accept="image/*"
            value={image}
            onChange={handleImageChange}
            clearable
          />
          <Text size="xs" c="dimmed">
            {t.composer.dropHint}
          </Text>
          {preview && (
            <Box pos="relative">
              <Image src={preview} alt={t.composer.imagePreviewAlt} loading="lazy" radius="md" style={{ aspectRatio: "16 / 9", objectFit: "cover" }} />
              <ActionIcon
                variant="filled"
                size="sm"
                aria-label={t.composer.removeImageAria}
                onClick={clearImage}
                style={{ position: "absolute", top: 8, insetInlineEnd: 8 }}>
                <X size={16} />
              </ActionIcon>
            </Box>
          )}
          <Button type="submit" loading={createMutation.isPending} disabled={!body.trim()}>
            {t.composer.postButton}
          </Button>
        </Stack>
      </form>
    </Card>
  );
}
