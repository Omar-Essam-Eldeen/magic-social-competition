import { useQuery } from "@tanstack/react-query";
import { Alert, Button, Container, Skeleton, Stack, Text, Title } from "@mantine/core";
import { getBookmarks } from "../../api/Users/api.ts";
import { useLanguage } from "../../context/useLanguage.ts";
import PostCard from "../../components/Posts/PostCard.tsx";

export default function Bookmarks() {
  const { t } = useLanguage();
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: getBookmarks,
  });

  const posts = data?.data.posts ?? [];

  if (isPending) {
    return (
      <Container size={640} px="md">
        <Stack gap="md">
          <Skeleton height={160} radius="md" />
          <Skeleton height={160} radius="md" />
        </Stack>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container size={640} px="md">
        <Alert color="red" title={t.bookmarks.loadErrorTitle}>
          <Button mt="sm" onClick={() => refetch()}>
            {t.common.retry}
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container size={640} px="md">
      <Stack gap="md">
        <Title order={3}>{t.bookmarks.title}</Title>
        {posts.length === 0 ? (
          <Text c="dimmed">{t.bookmarks.empty}</Text>
        ) : (
          posts.map((post) => <PostCard key={post._id} post={post} />)
        )}
      </Stack>
    </Container>
  );
}
