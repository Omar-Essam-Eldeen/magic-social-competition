import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Alert, Button, Container, Image, SimpleGrid, Skeleton, Stack, Text, Title, UnstyledButton } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { getAllPosts } from "../../api/Posts/api.ts";
import { useLanguage } from "../../context/useLanguage.ts";

const PAGE_SIZE = 20;

export default function Explore() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    isPending,
    isError,
    isFetchNextPageError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["explorePosts"],
    queryFn: ({ pageParam }) => getAllPosts(pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const p = lastPage.meta?.pagination;
      if (!p || p.currentPage >= p.numberOfPages) return undefined;
      return p.nextPage ?? p.currentPage + 1;
    },
  });

  // Only posts with an image belong in the grid, and a post with no
  // author must not crash it — skip such tiles entirely.
  const posts = (data?.pages.flatMap((page) => page.data?.posts ?? []) ?? []).filter(
    (post) => post.image && post.user,
  );

  // Infinite scroll: same sentinel + IntersectionObserver pattern as Home.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage && !isFetchNextPageError) {
          fetchNextPage();
        }
      },
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage]);

  // Same TanStack 5.104 type quirk as Home: calling fetchNextPage() from
  // inside a `{isFetchNextPageError && ...}` branch narrows the result to
  // `never`, so the retry lives here instead.
  const retryNextPage = () => {
    fetchNextPage();
  };

  return (
    <Container size={640} px="md">
      <Stack gap="md">
        <Title order={1} ff="Sora, system-ui, sans-serif">
          {t.explore.title}
        </Title>
        {isPending ? (
          <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="md">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} radius={22} style={{ aspectRatio: "1 / 1", height: "auto" }} />
            ))}
          </SimpleGrid>
        ) : isError ? (
          <Alert color="red" title={t.home.loadErrorTitle}>
            <Text size="sm" mb="sm">
              {t.home.loadErrorText}
            </Text>
            <Button onClick={() => refetch()}>{t.common.retry}</Button>
          </Alert>
        ) : posts.length === 0 ? (
          <Text ta="center" c="dimmed" mt="xl">
            {t.explore.empty}
          </Text>
        ) : (
          <>
            <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="md">
              {posts.map((post) => (
                <UnstyledButton
                  key={post._id}
                  aria-label={t.explore.openPostAria(post.user?.name ?? "")}
                  onClick={() => navigate(`/posts/${post._id}`)}>
                  <div
                    style={{
                      overflow: "hidden",
                      borderRadius: 22,
                      aspectRatio: "1 / 1",
                      border: "1px solid var(--glass-border)",
                    }}>
                    <Image src={post.image} alt="" w="100%" h="100%" fit="cover" loading="lazy" />
                  </div>
                </UnstyledButton>
              ))}
            </SimpleGrid>
            <div ref={sentinelRef} />
            {isFetchingNextPage && (
              <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="md">
                {Array.from({ length: 3 }, (_, i) => (
                  <Skeleton key={i} radius={22} style={{ aspectRatio: "1 / 1", height: "auto" }} />
                ))}
              </SimpleGrid>
            )}
            {isFetchNextPageError && (
              <Alert color="red" title={t.home.loadMoreErrorTitle}>
                <Button mt="sm" onClick={retryNextPage}>
                  {t.home.loadMore}
                </Button>
              </Alert>
            )}
            {!hasNextPage && (
              <Text ta="center" c="dimmed" size="sm">
                {t.home.caughtUp}
              </Text>
            )}
          </>
        )}
      </Stack>
    </Container>
  );
}
