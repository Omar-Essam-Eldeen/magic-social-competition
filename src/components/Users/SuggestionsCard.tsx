import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Alert, Avatar, Button, Card, Group, Skeleton, Stack, Text, Title, UnstyledButton } from "@mantine/core";
import { getSuggestions } from "../../api/Users/api.ts";
import { useAuth } from "../../context/useAuth.ts";
import { useLanguage } from "../../context/useLanguage.ts";
import FollowButton from "./FollowButton.tsx";

const MAX_SUGGESTIONS = 5;

export default function SuggestionsCard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  // Never fire logged out: Mantine's AppShell.Aside mounts its children even
  // when collapsed, so without this guard the query 401s on /login and the
  // 401 interceptor full-reloads the page in a loop.
  const suggestionsQuery = useQuery({
    queryKey: ["suggestions"],
    queryFn: getSuggestions,
    enabled: !!user,
  });

  const suggestions = suggestionsQuery.data?.data.slice(0, MAX_SUGGESTIONS) ?? [];

  return (
    <Card padding="md">
      <Title order={4} mb="sm">
        {t.suggestions.title}
      </Title>
      {suggestionsQuery.isPending ? (
        <Stack gap="sm">
          {[0, 1, 2].map((key) => (
            <Group key={key} gap="sm">
              <Skeleton height={36} circle />
              <Stack gap={4} style={{ flex: 1 }}>
                <Skeleton height={10} width="60%" />
                <Skeleton height={8} width="40%" />
              </Stack>
              <Skeleton height={24} width={64} />
            </Group>
          ))}
        </Stack>
      ) : suggestionsQuery.isError ? (
        <Alert color="red" title={t.suggestions.loadErrorTitle}>
          <Text size="sm" mb="sm">
            {t.suggestions.loadErrorText}
          </Text>
          <Button size="xs" variant="light" onClick={() => suggestionsQuery.refetch()}>
            {t.common.retry}
          </Button>
        </Alert>
      ) : suggestions.length === 0 ? (
        <Text size="sm" c="dimmed">
          {t.suggestions.empty}
        </Text>
      ) : (
        <Stack gap="sm">
          {suggestions.map((suggestion) => (
            <Group key={suggestion._id} gap="sm" wrap="nowrap">
              <UnstyledButton
                aria-label={t.post.viewProfile(suggestion.name)}
                onClick={() => navigate(`/users/${suggestion._id}`)}
                style={{ display: "flex" }}>
                <Avatar src={suggestion.photo} alt={suggestion.name} radius="xl" size={36}>
                  {suggestion.name?.[0]}
                </Avatar>
              </UnstyledButton>
              <div style={{ flex: 1, minWidth: 0 }}>
                <UnstyledButton
                  aria-label={t.post.viewProfile(suggestion.name)}
                  onClick={() => navigate(`/users/${suggestion._id}`)}
                  style={{ display: "block", width: "100%", textAlign: "start" }}>
                  <Text size="sm" fw={600} truncate>
                    {suggestion.name}
                  </Text>
                </UnstyledButton>
                <Text size="xs" c="dimmed" truncate>
                  <span dir="ltr">@{suggestion.username}</span>
                </Text>
              </div>
              {/* The suggestions endpoint returns no following flag, so every
                  button starts as "Follow". */}
              <FollowButton userId={suggestion._id} initialFollowing={false} />
            </Group>
          ))}
        </Stack>
      )}
    </Card>
  );
}
