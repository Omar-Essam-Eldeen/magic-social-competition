import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Alert, Button, Container, SegmentedControl, Skeleton, Stack, Text } from "@mantine/core";
import { getAllPosts, getFeed } from "../../api/Posts/api.ts";
import type { FeedFilter } from "../../api/Posts/types.ts";
import PostCard from "../../components/Posts/PostCard.tsx";
import Composer from "../../components/Posts/Composer.tsx";

const PAGE_SIZE = 10;

export default function Home() {
  const [filter, setFilter] = useState<FeedFilter>("all");
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
    queryKey: ["posts", filter],
    queryFn: ({ pageParam }) =>
      filter === "all" ? getAllPosts(pageParam, PAGE_SIZE) : getFeed(filter, pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const p = lastPage.meta?.pagination;
      if (!p || p.currentPage >= p.numberOfPages) return undefined;
      return p.nextPage ?? p.currentPage + 1;
    },
  });

  // All loaded pages, flattened into one list. A page whose data is
  // missing must not throw — fall back to an empty list for that page.
  const posts = data?.pages.flatMap((page) => page.data?.posts ?? []) ?? [];

  // Infinite scroll: when the empty sentinel div at the bottom of the feed
  // becomes visible, load the next page. No extra library needed — the
  // browser's IntersectionObserver does the watching. When the next page
  // fails to load we stop auto-fetching (the Retry button handles it) so a
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

  // Retry for a failed next page. This has to live outside the render:
  // `isFetchNextPageError` is a discriminant of TanStack Query's infinite
  // result union, and every union member types it as the literal `false`
  // (a TanStack 5.104 type quirk — at runtime it IS true on failure).
  // Calling fetchNextPage() directly inside `{isFetchNextPageError && ...}`
  // narrows the result to "members with isFetchNextPageError: true", i.e.
  // `never`, so tsc rejects the call. Calling it from here is unaffected.
  const retryNextPage = () => {
    fetchNextPage();
  };

  // The filter and the Composer always stay visible — even while loading,
  // on error, or when the feed is empty — so a new user (or "My posts"
  // with zero posts, or "Following" with nobody followed) can always post
  // or switch filters. Only the post list area changes state.
  return (
    <Container size={640} px="md">
      <Stack gap="md">
        <SegmentedControl
          fullWidth
          value={filter}
          onChange={(value) => setFilter(value as FeedFilter)}
          data={[
            { label: "All", value: "all" },
            { label: "Following", value: "following" },
            { label: "My posts", value: "me" },
          ]}
        />
        <Composer />
        {isPending ? (
          <>
            <Skeleton height={160} radius="md" />
            <Skeleton height={160} radius="md" />
            <Skeleton height={160} radius="md" />
          </>
        ) : isError ? (
          <Alert color="red" title="Couldn't load the posts">
            <Text size="sm" mb="sm">
              Check your connection and try again.
            </Text>
            <Button onClick={() => refetch()}>Retry</Button>
          </Alert>
        ) : posts.length === 0 ? (
          <Text ta="center" c="dimmed" mt="xl">
            No posts yet — be the first to share something.
          </Text>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
            <div ref={sentinelRef} />
            {isFetchingNextPage && <Skeleton height={160} radius="md" />}
            {isFetchNextPageError && (
              <Alert color="red" title="Couldn't load more posts">
                <Button mt="sm" onClick={retryNextPage}>
                  Load more
                </Button>
              </Alert>
            )}
            {!hasNextPage && (
              <Text ta="center" c="dimmed" size="sm">
                You&apos;re all caught up.
              </Text>
            )}
          </>
        )}
      </Stack>
    </Container>
  );
}
