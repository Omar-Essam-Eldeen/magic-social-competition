import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigate, useParams } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Container,
  Group,
  Skeleton,
  Stack,
  Tabs,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { getUserPosts, getUserProfile } from "../../api/Users/api.ts";
import { getProfile } from "../../api/Profile/api.ts";
import { useAuth } from "../../context/useAuth.ts";
import { useLanguage } from "../../context/useLanguage.ts";
import useCountUp from "../../hooks/useCountUp.ts";
import PostCard from "../../components/Posts/PostCard.tsx";
import FollowButton from "../../components/Users/FollowButton.tsx";
import FollowListModal from "../../components/Users/FollowListModal.tsx";

// Cinematic cover gradient (glass spec) used when the user has no cover photo.
const COVER_FALLBACK =
  "radial-gradient(600px 220px at 85% 0%, rgba(34,211,238,0.55), transparent 60%), radial-gradient(500px 260px at 8% 110%, rgba(217,70,239,0.5), transparent 60%), linear-gradient(118deg, #6d28d9, #4338ca 48%, #0e7490)";

/** Animated stat chip: Sora number over an uppercase muted label. */
function StatChip({ value, label }: { value: number; label: string }) {
  const animated = useCountUp(value);
  return (
    <div className="stat-chip">
      <Text className="stat-value">
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
 * API (verified 2026-11-11) returns the ID arrays too — so read them
 * defensively and treat a missing array as "unknown", never as "not
 * following".
 */
function idList(value: unknown): string[] | null {
  return Array.isArray(value) && value.every((v) => typeof v === "string") ? value : null;
}

export default function UserProfile() {
  const { id } = useParams();
  const userId = id ?? "";
  const { user: me } = useAuth();
  const { t } = useLanguage();
  const [listOpen, setListOpen] = useState<"followers" | "following" | null>(null);

  const profileQuery = useQuery({
    queryKey: ["userProfile", userId],
    queryFn: () => getUserProfile(userId),
    enabled: !!userId,
  });
  const viewed = profileQuery.data?.data;

  const postsQuery = useQuery({
    queryKey: ["userPosts", userId],
    queryFn: () => getUserPosts(userId),
    enabled: !!userId,
  });
  const posts = postsQuery.data?.data.posts ?? [];
  // The API reports the total across all pages; the loaded page only holds
  // the first few, so prefer the server total when it is present.
  const totalPosts = postsQuery.data?.meta?.pagination?.total ?? posts.length;

  // My own following list (from the cached ["profile"] query when the own
  // Profile page has loaded it) is the reliable source for whether I
  // already follow this person. Fall back to the viewed user's followers
  // array when it is present at runtime; otherwise false (unknown).
  const myProfileQuery = useQuery({ queryKey: ["profile"], queryFn: getProfile });
  const myFollowing = idList(
    (myProfileQuery.data?.data as unknown as { following?: unknown } | undefined)?.following,
  );
  const viewedFollowers = idList(
    (viewed as unknown as { followers?: unknown } | undefined)?.followers,
  );
  const viewedFollowing = idList(
    (viewed as unknown as { following?: unknown } | undefined)?.following,
  );
  const initialFollowing =
    (me?._id && myFollowing ? myFollowing.includes(userId) : undefined) ??
    (me?._id && viewedFollowers ? viewedFollowers.includes(me._id) : false);

  // My own profile lives at /profile — never render it here.
  if (me?._id && userId === me._id) {
    return <Navigate to="/profile" replace />;
  }

  if (!userId) {
    return (
      <Container size={640} px="md">
        <Alert color="red" title={t.userProfile.notFoundTitle} />
      </Container>
    );
  }

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

  if (profileQuery.isError) {
    return (
      <Container size={640} px="md">
        <Alert color="red" title={t.userProfile.loadErrorTitle}>
          <Button mt="sm" onClick={() => profileQuery.refetch()}>
            {t.common.retry}
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!viewed) {
    return (
      <Container size={640} px="md">
        <Alert color="red" title={t.userProfile.notFoundTitle}>
          <Text size="sm">{t.userProfile.notFoundText}</Text>
          <Button mt="sm" onClick={() => profileQuery.refetch()}>
            {t.common.retry}
          </Button>
        </Alert>
      </Container>
    );
  }

  const coverStyle = viewed.cover
    ? { backgroundImage: `url(${viewed.cover})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { backgroundImage: COVER_FALLBACK };
  const followersCount = viewed.followersCount ?? viewedFollowers?.length ?? 0;
  const followingCount =
    viewed.followingCount ??
    idList((viewed as unknown as { following?: unknown } | undefined)?.following)?.length ??
    0;
  // Likes received counts only the loaded page of posts — the best the
  // client can see without a dedicated endpoint.
  const likesReceived = posts.reduce(
    (sum, post) => sum + (post.likesCount ?? (post.likes ?? []).length),
    0,
  );

  return (
    <Container size={640} px="md">
      <Stack gap="md">
        <Card p={0} style={{ overflow: "hidden" }}>
          <Box h={{ base: 150, sm: 196 }} style={coverStyle} />
          <Box px="md" pb="md">
            <div className="av-ring" style={{ marginTop: -46 }}>
              <Avatar
                src={viewed.photo}
                alt={viewed.name}
                radius={999}
                size={104}
                style={{
                  border: "3px solid var(--mantine-color-default)",
                  // Solid background: avatar photos can be transparent PNGs
                  // (the default avatar is), and without this the cover
                  // shows through the transparent top of the photo.
                  backgroundColor: "var(--mantine-color-default)",
                }}>
                {viewed.name?.[0] ?? "?"}
              </Avatar>
            </div>
            <Title order={3} ff="Sora, system-ui, sans-serif" mt="sm">
              {viewed.name}
            </Title>
            <Text c="dimmed">
              <span dir="ltr">@{viewed.username}</span>
            </Text>
            <Group gap="sm" mt="md">
              <StatChip value={totalPosts} label={t.common.posts} />
              <UnstyledButton
                onClick={() => setListOpen("followers")}>
                <StatChip value={followersCount} label={t.common.followers} />
              </UnstyledButton>
              <UnstyledButton
                onClick={() => setListOpen("following")}>
                <StatChip value={followingCount} label={t.common.followingCount} />
              </UnstyledButton>
              <StatChip value={likesReceived} label={t.userProfile.likesReceived} />
            </Group>
            <Group mt="md">
              <FollowButton userId={viewed._id} initialFollowing={initialFollowing} />
            </Group>
          </Box>
        </Card>

        {listOpen && (
          <FollowListModal
            userId={viewed._id}
            kind={listOpen}
            ids={listOpen === "followers" ? (viewedFollowers ?? []) : (viewedFollowing ?? [])}
            opened
            onClose={() => setListOpen(null)}
          />
        )}

        <Card padding="lg">
          <Tabs value="posts">
            <Tabs.List mb="md">
              <Tabs.Tab value="posts">{t.userProfile.postsTab(totalPosts)}</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="posts">
              {postsQuery.isPending ? (
                <Skeleton height={160} radius="md" />
              ) : postsQuery.isError ? (
                <Alert color="red" title={t.userProfile.loadPostsErrorTitle}>
                  <Text size="sm" mb="sm">
                    {t.errors.checkConnection}
                  </Text>
                  <Button onClick={() => postsQuery.refetch()}>{t.common.retry}</Button>
                </Alert>
              ) : posts.length === 0 ? (
                <Text c="dimmed">{t.userProfile.noPostsYet(viewed.username)}</Text>
              ) : (
                <Stack gap="md">
                  {posts.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </Stack>
              )}
            </Tabs.Panel>
          </Tabs>
        </Card>
      </Stack>
    </Container>
  );
}
