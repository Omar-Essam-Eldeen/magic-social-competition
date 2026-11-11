import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Container,
  Group,
  PasswordInput,
  Skeleton,
  Stack,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import { getProfile } from "../../api/Profile/api.ts";
import { getBookmarks, getUserPosts } from "../../api/Users/api.ts";
import { ChangePasswordSchema, type ChangePasswordFormData } from "../../api/Auth/schema.ts";
import { useAuth } from "../../context/useAuth.ts";
import PostCard from "../../components/Posts/PostCard.tsx";

// Subtle violet gradient used when the user has no cover photo.
const COVER_FALLBACK =
  "linear-gradient(135deg, #7c3aed 0%, #6d28d9 45%, #4338ca 100%)";

function Count({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <Text fw={700} ff="Sora, system-ui, sans-serif" aria-label={`${value} ${label}`}>
        {value}
      </Text>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
    </div>
  );
}

export default function Profile() {
  const { changePassword } = useAuth();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"posts" | "saved">("posts");

  const profileQuery = useQuery({ queryKey: ["profile"], queryFn: getProfile });
  const user = profileQuery.data?.data;

  const postsQuery = useQuery({
    queryKey: ["userPosts", user?._id],
    queryFn: () => getUserPosts(user!._id),
    enabled: !!user?._id,
  });
  const posts = postsQuery.data?.data.posts ?? [];
  // The API reports the total across all pages; the loaded page only holds
  // the first few, so prefer the server total when it is present.
  const totalPosts = postsQuery.data?.meta?.pagination?.total ?? posts.length;

  const bookmarksQuery = useQuery({
    queryKey: ["bookmarks"],
    queryFn: getBookmarks,
    enabled: tab === "saved",
  });
  const savedPosts = bookmarksQuery.data?.data.posts ?? [];
  const totalSaved = bookmarksQuery.data?.meta?.pagination?.total ?? savedPosts.length;

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({ resolver: zodResolver(ChangePasswordSchema) });

  const onSubmit = async (values: ChangePasswordFormData) => {
    setError(null);
    setSuccess(null);
    try {
      await changePassword(values);
      setSuccess("Password changed. You're still logged in.");
      reset();
    } catch (err) {
      setError(isAxiosError(err) ? (err.response?.data?.message ?? err.message) : "Something went wrong.");
    }
  };

  if (profileQuery.isPending) {
    return (
      <Container size={640} px="md">
        <Stack gap="md">
          <Skeleton height={120} radius="md" />
          <Skeleton height={200} radius="md" />
        </Stack>
      </Container>
    );
  }

  if (profileQuery.isError || !user) {
    return (
      <Container size={640} px="md">
        <Alert color="red" title="Couldn't load your profile">
          <Button mt="sm" onClick={() => profileQuery.refetch()}>
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  const coverStyle = user.cover
    ? { backgroundImage: `url(${user.cover})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { backgroundImage: COVER_FALLBACK };

  return (
    <Container size={640} px="md">
      <Stack gap="md">
        <Card p={0} style={{ overflow: "hidden" }}>
          <Box h={{ base: 150, sm: 196 }} style={coverStyle} />
          <Box px="md" pb="md">
            <Avatar
              src={user.photo}
              alt={user.name}
              radius={999}
              size={104}
              mt={-46}
              style={{
                border: "3px solid var(--mantine-color-default)",
                // Solid background: avatar photos can be transparent PNGs
                // (the default avatar is), and without this the cover
                // shows through the transparent top of the photo.
                backgroundColor: "var(--mantine-color-default)",
              }}>
              {user.name?.[0] ?? "?"}
            </Avatar>
            <Title order={3} ff="Sora, system-ui, sans-serif" mt="sm">
              {user.name}
            </Title>
            <Text c="dimmed">@{user.username}</Text>
            {user.email && (
              <Text size="sm" c="dimmed">
                {user.email}
              </Text>
            )}
            <Group gap="xl" mt="md">
              <Count value={totalPosts} label="Posts" />
              <Count value={user.followersCount ?? 0} label="Followers" />
              <Count value={user.followingCount ?? 0} label="Following" />
            </Group>
          </Box>
        </Card>

        <Card padding="lg">
          <Tabs value={tab} onChange={(value) => setTab(value === "saved" ? "saved" : "posts")}>
            <Tabs.List mb="md">
              <Tabs.Tab value="posts">Posts ({totalPosts})</Tabs.Tab>
              <Tabs.Tab value="saved">Saved ({totalSaved})</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="posts">
              {postsQuery.isPending ? (
                <Skeleton height={160} radius="md" />
              ) : postsQuery.isError ? (
                <Alert color="red" title="Couldn't load your posts">
                  <Text size="sm" mb="sm">
                    Check your connection and try again.
                  </Text>
                  <Button onClick={() => postsQuery.refetch()}>Retry</Button>
                </Alert>
              ) : posts.length === 0 ? (
                <Text c="dimmed">You haven&apos;t posted anything yet.</Text>
              ) : (
                <Stack gap="md">
                  {posts.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </Stack>
              )}
            </Tabs.Panel>

            <Tabs.Panel value="saved">
              {bookmarksQuery.isPending ? (
                <Skeleton height={160} radius="md" />
              ) : bookmarksQuery.isError ? (
                <Alert color="red" title="Couldn't load your saved posts">
                  <Button mt="sm" onClick={() => bookmarksQuery.refetch()}>
                    Retry
                  </Button>
                </Alert>
              ) : savedPosts.length === 0 ? (
                <Text c="dimmed">Nothing saved yet — tap the bookmark icon on any post to keep it here.</Text>
              ) : (
                <Stack gap="md">
                  {savedPosts.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </Stack>
              )}
            </Tabs.Panel>
          </Tabs>
        </Card>

        <Card padding="lg">
          <Title order={4} mb="sm">
            Change password
          </Title>
          {success && (
            <Alert color="green" mb="sm">
              {success}
            </Alert>
          )}
          {error && (
            <Alert color="red" mb="sm">
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap="sm">
              <PasswordInput
                label="Current password"
                placeholder="Your current password"
                error={errors.password?.message}
                {...register("password")}
              />
              <PasswordInput
                label="New password"
                placeholder="At least 8 characters, upper + lower + number + special"
                error={errors.newPassword?.message}
                {...register("newPassword")}
              />
              <PasswordInput
                label="Confirm new password"
                placeholder="Repeat the new password"
                error={errors.rePassword?.message}
                {...register("rePassword")}
              />
              <Button type="submit" loading={isSubmitting}>
                Change password
              </Button>
            </Stack>
          </form>
        </Card>
      </Stack>
    </Container>
  );
}
