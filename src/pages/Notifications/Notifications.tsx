import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
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
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../../api/Notifications/api.ts";
import type { NotificationItem } from "../../api/Notifications/types.ts";
import { useLanguage } from "../../context/useLanguage.ts";
import type { Dict, Language } from "../../i18n/dictionary.ts";

/** Relative time ("2h ago"); never renders "Invalid Date". */
function formatRelativeTime(value: string | undefined, lang: Language): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return formatDistanceToNow(date, { addSuffix: true, locale: lang === "ar" ? ar : enUS });
}

/** Human text for a notification type; unknown types are prettified. */
function notificationText(t: Dict, type: string): string {
  switch (type) {
    // Real type values seen live from the API: like_post, comment_post,
    // follow_user. The bare forms are kept as fallbacks.
    case "like_post":
      return t.notifications.likedPost;
    case "like_comment":
      return t.notifications.likedComment;
    case "comment_post":
    case "comment":
      return t.notifications.commentedPost;
    case "follow_user":
    case "follow":
      return t.notifications.startedFollowing;
    case "share_post":
    case "share":
      return t.notifications.sharedPost;
    default:
      return type.replace(/_/g, " ");
  }
}

export default function Notifications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t, lang } = useLanguage();

  const notificationsQuery = useQuery({ queryKey: ["notifications"], queryFn: () => getNotifications() });
  const notificationsList = notificationsQuery.data?.data ?? [];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
  };

  const markReadMutation = useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId),
    onSuccess: invalidate,
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: invalidate,
  });

  const handleRowClick = (notification: NotificationItem) => {
    if (!notification.isRead) markReadMutation.mutate(notification._id);
    if (notification.entityType === "post" && notification.entityId) {
      navigate(`/posts/${notification.entityId}`);
    }
  };

  const unreadCount = notificationsList.filter((n) => !n.isRead).length;

  return (
    <Container size={640} px="md">
      <Stack gap="md">
        <Group justify="space-between" align="center">
          {/* Page heading: h1, kept at the h2 visual size. */}
          <Title order={1} fz="var(--mantine-h2-font-size)" lh="var(--mantine-h2-line-height)" ff="Sora, system-ui, sans-serif">
            {t.notifications.title}
          </Title>
          {unreadCount > 0 && (
            <Button
              variant="subtle"
              size="sm"
              loading={markAllReadMutation.isPending}
              onClick={() => markAllReadMutation.mutate()}>
              {t.notifications.markAllRead}
            </Button>
          )}
        </Group>

        {notificationsQuery.isPending ? (
          <Stack gap="sm">
            <Skeleton height={72} radius="md" />
            <Skeleton height={72} radius="md" />
            <Skeleton height={72} radius="md" />
          </Stack>
        ) : notificationsQuery.isError ? (
          <Alert color="red" title={t.notifications.loadErrorTitle}>
            <Text size="sm" mb="sm">
              {t.errors.checkConnection}
            </Text>
            <Button onClick={() => notificationsQuery.refetch()}>{t.common.retry}</Button>
          </Alert>
        ) : notificationsList.length === 0 ? (
          <Card padding="lg">
            <Text c="dimmed">{t.notifications.empty}</Text>
          </Card>
        ) : (
          <Stack gap="sm">
            {notificationsList.map((notification) => {
              const actor = notification.actor;
              const relativeTime = formatRelativeTime(notification.createdAt, lang);
              const action = notificationText(t, notification.type);
              const actorName = actor?.name ?? t.notifications.someone;
              return (
                // No aria-label: the row's visible content IS its name.
                // An aria-label here failed WCAG 2.5.3 (label-in-name) —
                // the visible text is name + action + time as separate
                // nodes, and any label that rewords it (comma, avatar
                // fallback) stops containing the visible text verbatim.
                <UnstyledButton
                  key={notification._id}
                  onClick={() => handleRowClick(notification)}>
                  <Card
                    padding="sm"
                    withBorder={!notification.isRead}
                    style={
                      notification.isRead
                        ? undefined
                        : { backgroundColor: "var(--mantine-color-violet-light)", borderColor: "var(--mantine-color-violet-light-color)" }
                    }>
                    <Group gap="sm" wrap="nowrap" align="flex-start">
                      <Avatar src={actor?.photo} alt={actor?.name ?? t.notifications.userFallback} radius="xl" size={40}>
                        {actor?.name?.[0] ?? "?"}
                      </Avatar>
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Text size="sm">
                          <Text span fw={700}>
                            {actorName}{" "}
                          </Text>
                          {action}
                        </Text>
                        {relativeTime && (
                          // Unread rows sit on a violet-light background,
                          // where dimmed (#6b7280) is only 3.66:1 — use the
                          // scheme-aware unread-time token (6.2:1 light).
                          <Text size="xs" c={notification.isRead ? "dimmed" : "var(--notification-unread-time)"}>
                            {relativeTime}
                          </Text>
                        )}
                      </Box>
                      {!notification.isRead && (
                        <Box
                          mt={6}
                          w={8}
                          h={8}
                          style={{ borderRadius: 999, backgroundColor: "var(--mantine-color-violet-filled)" }}
                          aria-hidden
                        />
                      )}
                    </Group>
                  </Card>
                </UnstyledButton>
              );
            })}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
