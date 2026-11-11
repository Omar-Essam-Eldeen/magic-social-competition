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
} from "@mantine/core";
import { getUserPosts, getUserProfile } from "../../api/Users/api.ts";
import { getProfile } from "../../api/Profile/api.ts";
import { useAuth } from "../../context/useAuth.ts";
import { useLanguage } from "../../context/useLanguage.ts";
import PostCard from "../../components/Posts/PostCard.tsx";
import FollowButton from "../../components/Users/FollowButton.tsx";

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

  return (
    <Container size={640} px="md">
      <Stack gap="md">
        <Card p={0} style={{ overflow: "hidden" }}>
          <Box h={{ base: 150, sm: 196 }} style={coverStyle} />
          <Box px="md" pb="md">
            <Avatar
              src={viewed.photo}
              alt={viewed.name}
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
              {viewed.name?.[0] ?? "?"}
            </Avatar>
            <Title order={3} ff="Sora, system-ui, sans-serif" mt="sm">
              {viewed.name}
            </Title>
            <Text c="dimmed">
              <span dir="ltr">@{viewed.username}</span>
            </Text>
            <Group gap="xl" mt="md">
              <Count value={totalPosts} label={t.common.posts} />
              <Count value={followersCount} label={t.common.followers} />
              <Count value={followingCount} label={t.common.followingCount} />
            </Group>
            <Group mt="md">
              <FollowButton userId={viewed._id} initialFollowing={initialFollowing} />
            </Group>
          </Box>
        </Card>

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
