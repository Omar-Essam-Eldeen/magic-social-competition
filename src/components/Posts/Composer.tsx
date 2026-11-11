import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Card, FileInput, Image, Stack, Textarea } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPost } from "../../api/Posts/api.ts";
import type { CreatePostReq } from "../../api/Posts/types.ts";

export default function Composer() {
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
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
    },
    onError: () =>
      notifications.show({ color: "red", title: "Couldn't create your post", message: "Try again." }),
  });

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!body.trim()) return;
          createMutation.mutate({ body: body.trim(), image });
        }}>
        <Stack gap="sm">
          <Textarea
            aria-label="What's on your mind?"
            placeholder="What's on your mind?"
            value={body}
            onChange={(e) => setBody(e.currentTarget.value)}
            autosize
            minRows={2}
          />
          <FileInput
            aria-label="Add an image to your post"
            placeholder="Add an image (optional)"
            accept="image/*"
            value={image}
            onChange={handleImageChange}
            clearable
          />
          {preview && <Image src={preview} alt="Image preview" loading="lazy" className="post-image" />}
          <Button type="submit" loading={createMutation.isPending} disabled={!body.trim()} className="btn-gradient">
            Post
          </Button>
        </Stack>
      </form>
    </Card>
  );
}
