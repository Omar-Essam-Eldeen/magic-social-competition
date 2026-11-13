import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Alert, Button, Container, Skeleton, Stack, Text, Title } from "@mantine/core";
import { getAllPosts } from "../../api/Posts/api.ts";
import { useLanguage } from "../../context/useLanguage.ts";
import PostCard from "../../components/Posts/PostCard.tsx";

const PAGE_SIZE = 10;

/** Escape a tag for use inside a RegExp. */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Round 5 (M4) — hashtag page (/tags/:tag). Lists the loaded posts whose
 * body contains this #tag, reusing the feed's own "all" query (same query
 * key as Home, so the cache is shared) and PostCard. The count covers only
 * the posts loaded so far — scrolling loads more pages, which then get
 * filtered too, exactly like the feed search.
 */
export default function TagPage() {
  const { tag = "" } = useParams();
  const { t } = useLanguage();
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
    queryKey: ["posts", "all"],
    queryFn: ({ pageParam }) => getAllPosts(pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const p = lastPage.meta?.pagination;
      if (!p || p.currentPage >= p.numberOfPages) return undefined;
      return p.nextPage ?? p.currentPage + 1;
    },
  });

  // All loaded pages, flattened into one list.
  const posts = data?.pages.flatMap((page) => page.data?.posts ?? []) ?? [];

  // Match #tag as a whole hashtag, case-insensitively — the same tag
  // grammar as HashtagText (letters / numbers / underscore), so this page
  // lists exactly the posts whose rendered text links here.
  const tagRe = new RegExp(`#${escapeRegExp(tag)}(?![\\p{L}\\p{N}_])`, "iu");
  const visiblePosts = posts.filter((post) => tagRe.test(post.body ?? ""));

  // Infinite scroll: same sentinel pattern as Home. When the next page
  // fails we stop auto-fetching (the Retry button handles it) so a
  // failing page does not loop forever.
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

  // Same TanStack 5.104 union quirk as Home: calling fetchNextPage()
  // directly inside `{isFetchNextPageError && ...}` narrows the result to
  // `never`, so it lives in this handler instead.
  const retryNextPage = () => {
    fetchNextPage();
  };

  return (
    <Container size={640} px="md">
      <Stack gap="md">
        <div>
          {/* Page heading: h1, kept at the h2 visual size. */}
          <Title order={1} fz="var(--mantine-h2-font-size)" lh="var(--mantine-h2-line-height)" ff="Sora, system-ui, sans-serif">
            {t.tag.title(tag)}
          </Title>
          {!isPending && !isError && (
            <Text size="sm" c="dimmed">
              {t.tag.postsCount(visiblePosts.length)}
            </Text>
          )}
        </div>

        {isPending ? (
          <>
            <Skeleton height={160} radius="md" />
            <Skeleton height={160} radius="md" />
            <Skeleton height={160} radius="md" />
          </>
        ) : isError ? (
          <Alert color="red" title={t.tag.loadErrorTitle}>
            <Text size="sm" mb="sm">
              {t.errors.checkConnection}
            </Text>
            <Button onClick={() => refetch()}>{t.common.retry}</Button>
          </Alert>
        ) : visiblePosts.length === 0 ? (
          <Text ta="center" c="dimmed" mt="xl">
            {t.tag.empty(tag)}
          </Text>
        ) : (
          <>
            {visiblePosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
            <div ref={sentinelRef} />
            {isFetchingNextPage && <Skeleton height={160} radius="md" />}
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
