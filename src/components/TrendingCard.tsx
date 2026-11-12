import { useQuery } from "@tanstack/react-query";
import { Card, Group, Skeleton, Stack, Text, Title, UnstyledButton } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { getAllPosts } from "../api/Posts/api.ts";
import { useLanguage } from "../context/useLanguage.ts";

const HASHTAG_RE = /#([\p{L}\p{N}_]+)/gu;

export default function TrendingCard() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const { data, isPending, isError } = useQuery({
    queryKey: ["trendingPosts"],
    queryFn: () => getAllPosts(1, 30),
  });

  // Trending is a bonus — never show an error card for it.
  if (isError) return null;

  // Count hashtags case-insensitively, displaying the first-seen casing.
  const counts = new Map<string, { display: string; count: number }>();
  for (const post of data?.data?.posts ?? []) {
    for (const match of (post.body ?? "").matchAll(HASHTAG_RE)) {
      const raw = match[1];
      const key = raw.toLowerCase();
      const entry = counts.get(key);
      if (entry) {
        entry.count += 1;
      } else {
        counts.set(key, { display: raw, count: 1 });
      }
    }
  }
  const top = [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 5);

  return (
    <Card padding="md">
      <Title order={4} mb="sm">
        {t.trending.title}
      </Title>
      {isPending ? (
        <Stack gap="xs">
          <Skeleton height={20} />
          <Skeleton height={20} />
          <Skeleton height={20} />
        </Stack>
      ) : top.length === 0 ? (
        <Text size="sm" c="dimmed">
          {t.trending.empty}
        </Text>
      ) : (
        <Stack gap="xs">
          {top.map(({ display, count }) => (
            <UnstyledButton
              key={display.toLowerCase()}
              className="hashtag-link"
              aria-label={t.trending.tagAria(`#${display}`)}
              onClick={() => navigate(`/?q=%23${encodeURIComponent(display)}`)}>
              <Group gap="xs">
                <Text size="sm">#{display}</Text>
                <Text size="sm" c="dimmed">
                  ({count})
                </Text>
              </Group>
            </UnstyledButton>
          ))}
        </Stack>
      )}
    </Card>
  );
}
