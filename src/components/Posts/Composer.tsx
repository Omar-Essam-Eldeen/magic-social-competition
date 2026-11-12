import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ActionIcon, Box, Button, Card, FileInput, Image, Stack, Text, Textarea } from "@mantine/core";
import { X } from "lucide-react";
import { notifications } from "@mantine/notifications";
import { createPost } from "../../api/Posts/api.ts";
import type { CreatePostReq } from "../../api/Posts/types.ts";
import { useLanguage } from "../../context/useLanguage.ts";

export default function Composer({ onCreated }: { onCreated?: () => void }) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const previewRef = useRef<string | null>(null);

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
      clearImage();
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
          <Textarea
            aria-label={t.composer.ariaLabel}
            placeholder={t.composer.placeholder}
            value={body}
            onChange={(e) => setBody(e.currentTarget.value)}
            autosize
            minRows={2}
          />
          <Text size="xs" c="dimmed" ta="end">
            {t.composer.chars(body.length)}
          </Text>
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
