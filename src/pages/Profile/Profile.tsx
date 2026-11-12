import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Container,
  FileInput,
  Group,
  PasswordInput,
  Skeleton,
  Stack,
  Tabs,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { getProfile } from "../../api/Profile/api.ts";
import { getBookmarks, getUserPosts, uploadProfilePhoto } from "../../api/Users/api.ts";
import { createChangePasswordSchema, type ChangePasswordFormData } from "../../api/Auth/schema.ts";
import { useAuth } from "../../context/useAuth.ts";
import { useLanguage } from "../../context/useLanguage.ts";
import useCountUp from "../../hooks/useCountUp.ts";
import PostCard from "../../components/Posts/PostCard.tsx";
import FollowListModal from "../../components/Users/FollowListModal.tsx";

// Cinematic cover gradient (glass spec) used when the user has no cover photo.
const COVER_FALLBACK =
  "radial-gradient(600px 220px at 85% 0%, rgba(34,211,238,0.55), transparent 60%), radial-gradient(500px 260px at 8% 110%, rgba(217,70,239,0.5), transparent 60%), linear-gradient(118deg, #6d28d9, #4338ca 48%, #0e7490)";

/** Animated stat chip: Sora number over an uppercase muted label. */
function StatChip({ value, label }: { value: number; label: string }) {
  const animated = useCountUp(value);
  return (
    <div className="stat-chip">
      <Text className="stat-value" aria-label={`${value} ${label}`}>
        {animated}
      </Text>
      <Text size="xs" c="dimmed" tt="uppercase">
        {label}
      </Text>
    </div>
  );
}

/**
 * Read a runtime `following`/`followers` array of user-ID strings off a
 * user object. The typed User model only carries the counts, but the live
 * API returns the ID arrays too — read them defensively.
 */
function idList(value: unknown): string[] | null {
  return Array.isArray(value) && value.every((v) => typeof v === "string") ? value : null;
}

export default function Profile() {
  const { changePassword, refreshUser } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"posts" | "saved">("posts");
  const [listOpen, setListOpen] = useState<"followers" | "following" | null>(null);

  const photoMutation = useMutation({
    mutationFn: (photo: File) => uploadProfilePhoto(photo),
    onSuccess: async () => {
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: () =>
      notifications.show({ color: "red", title: t.profile.photoErrorTitle, message: t.common.tryAgain }),
  });

  const handlePhotoChange = (file: File | null) => {
    if (file) photoMutation.mutate(file);
  };

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
  // Likes received counts only the loaded page of posts — the best the
  // client can see without a dedicated endpoint.
  const likesReceived = posts.reduce(
    (sum, post) => sum + (post.likesCount ?? (post.likes ?? []).length),
    0,
  );
  const followersIds =
    idList((user as unknown as { followers?: unknown } | undefined)?.followers) ?? [];
  const followingIds =
    idList((user as unknown as { following?: unknown } | undefined)?.following) ?? [];

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
  } = useForm<ChangePasswordFormData>({ resolver: zodResolver(createChangePasswordSchema(t.validation)) });

  const onSubmit = async (values: ChangePasswordFormData) => {
    setError(null);
    setSuccess(null);
    try {
      await changePassword(values);
      setSuccess(t.profile.passwordChanged);
      reset();
    } catch (err) {
      setError(
        isAxiosError(err) ? (err.response?.data?.message ?? err.message) : t.errors.somethingWentWrongPeriod,
      );
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
        <Alert color="red" title={t.profile.loadErrorTitle}>
          <Button mt="sm" onClick={() => profileQuery.refetch()}>
            {t.common.retry}
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
            <div className="av-ring" style={{ marginTop: -46 }}>
              <Avatar
                src={user.photo}
                alt={user.name}
                radius={999}
                size={104}
                style={{
                  border: "3px solid var(--mantine-color-default)",
                  // Solid background: avatar photos can be transparent PNGs
                  // (the default avatar is), and without this the cover
                  // shows through the transparent top of the photo.
                  backgroundColor: "var(--mantine-color-default)",
                }}>
                {user.name?.[0] ?? "?"}
              </Avatar>
            </div>
            {/* Page heading: h1, kept at the h3 visual size. */}
            <Title order={1} fz="var(--mantine-h3-font-size)" lh="var(--mantine-h3-line-height)" ff="Sora, system-ui, sans-serif" mt="sm">
              {user.name}
            </Title>
            <Text c="dimmed">
              <span dir="ltr">@{user.username}</span>
            </Text>
            {user.email && (
              <Text size="sm" c="dimmed">
                <span dir="ltr">{user.email}</span>
              </Text>
            )}
            <Group gap="sm" mt="md">
              <StatChip value={totalPosts} label={t.common.posts} />
              <UnstyledButton
                aria-label={t.profile.viewFollowersAria}
                onClick={() => setListOpen("followers")}>
                <StatChip value={user.followersCount ?? 0} label={t.common.followers} />
              </UnstyledButton>
              <UnstyledButton
                aria-label={t.profile.viewFollowingAria}
                onClick={() => setListOpen("following")}>
                <StatChip value={user.followingCount ?? 0} label={t.common.followingCount} />
              </UnstyledButton>
              <StatChip value={likesReceived} label={t.profile.likesReceived} />
            </Group>
            <FileInput
              placeholder={t.profile.changePhotoPlaceholder}
              accept="image/*"
              clearable
              disabled={photoMutation.isPending}
              onChange={handlePhotoChange}
              mt="md"
              maw={260}
            />
          </Box>
        </Card>

        {listOpen && (
          <FollowListModal
            userId={user._id}
            kind={listOpen}
            ids={listOpen === "followers" ? followersIds : followingIds}
            opened
            onClose={() => setListOpen(null)}
          />
        )}

        <Card padding="lg">
          <Tabs value={tab} onChange={(value) => setTab(value === "saved" ? "saved" : "posts")}>
            <Tabs.List mb="md">
              <Tabs.Tab value="posts">{t.profile.postsTab(totalPosts)}</Tabs.Tab>
              <Tabs.Tab value="saved">{t.profile.savedTab(totalSaved)}</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="posts">
              {postsQuery.isPending ? (
                <Skeleton height={160} radius="md" />
              ) : postsQuery.isError ? (
                <Alert color="red" title={t.profile.loadPostsErrorTitle}>
                  <Text size="sm" mb="sm">
                    {t.errors.checkConnection}
                  </Text>
                  <Button onClick={() => postsQuery.refetch()}>{t.common.retry}</Button>
                </Alert>
              ) : posts.length === 0 ? (
                <Text c="dimmed">{t.profile.noPostsYet}</Text>
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
                <Alert color="red" title={t.profile.loadSavedErrorTitle}>
                  <Button mt="sm" onClick={() => bookmarksQuery.refetch()}>
                    {t.common.retry}
                  </Button>
                </Alert>
              ) : savedPosts.length === 0 ? (
                <Text c="dimmed">{t.profile.nothingSaved}</Text>
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
          {/* h2 (was h4 — skipped a level after the h1 above), kept at the h4 visual size. */}
          <Title order={2} fz="var(--mantine-h4-font-size)" lh="var(--mantine-h4-line-height)" mb="sm">
            {t.profile.changePasswordTitle}
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
                label={t.profile.currentPassword}
                placeholder={t.profile.currentPasswordPlaceholder}
                error={errors.password?.message}
                {...register("password")}
              />
              <PasswordInput
                label={t.profile.newPassword}
                placeholder={t.profile.newPasswordPlaceholder}
                error={errors.newPassword?.message}
                {...register("newPassword")}
              />
              <PasswordInput
                label={t.profile.confirmNewPassword}
                placeholder={t.profile.confirmNewPasswordPlaceholder}
                error={errors.rePassword?.message}
                {...register("rePassword")}
              />
              <Button type="submit" loading={isSubmitting}>
                {t.profile.changePasswordButton}
              </Button>
            </Stack>
          </form>
        </Card>
      </Stack>
    </Container>
  );
}
