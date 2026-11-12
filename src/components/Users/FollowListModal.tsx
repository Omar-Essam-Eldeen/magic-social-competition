import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Avatar,
  Button,
  Group,
  Modal,
  Skeleton,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { getUserProfile } from "../../api/Users/api.ts";
import type { User } from "../../types.ts";
import { useAuth } from "../../context/useAuth.ts";
import { useLanguage } from "../../context/useLanguage.ts";
import FollowButton from "./FollowButton.tsx";

interface FollowListModalProps {
  userId: string;
  kind: "followers" | "following";
  ids: string[];
  opened: boolean;
  onClose: () => void;
}

export default function FollowListModal({ userId, kind, ids, opened, onClose }: FollowListModalProps) {
  const { user: me } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const listQuery = useQuery({
    queryKey: ["followList", userId, kind, ids.join(",")],
    queryFn: async () => {
      const users = await Promise.all(
        ids.slice(0, 20).map(async (id) => {
          try {
            const response = await getUserProfile(id);
            return response.data;
          } catch {
            return null;
          }
        }),
      );
      return users.filter((u): u is User => u !== null);
    },
    enabled: opened,
  });
  const users = listQuery.data ?? [];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="sm"
      centered
      title={kind === "followers" ? t.followersList.followersTitle : t.followersList.followingTitle}>
      {listQuery.isPending ? (
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
      ) : listQuery.isError ? (
        <Alert color="red" title={t.followersList.loadErrorTitle}>
          <Button mt="sm" onClick={() => listQuery.refetch()}>
            {t.common.retry}
          </Button>
        </Alert>
      ) : users.length === 0 ? (
        <Text c="dimmed">
          {kind === "followers" ? t.followersList.emptyFollowers : t.followersList.emptyFollowing}
        </Text>
      ) : (
        <Stack gap="sm">
          {users.map((u) => (
            <Group key={u._id} gap="sm" wrap="nowrap">
              <UnstyledButton
                aria-label={t.post.viewProfile(u.name)}
                onClick={() => {
                  navigate(`/users/${u._id}`);
                  onClose();
                }}
                style={{ display: "flex" }}>
                <Avatar src={u.photo} alt={u.name} radius="xl" size={36}>
                  {u.name?.[0]}
                </Avatar>
              </UnstyledButton>
              <div style={{ flex: 1, minWidth: 0 }}>
                <UnstyledButton
                  aria-label={t.post.viewProfile(u.name)}
                  onClick={() => {
                    navigate(`/users/${u._id}`);
                    onClose();
                  }}
                  style={{ display: "block", width: "100%", textAlign: "start" }}>
                  <Text size="sm" fw={600} truncate>
                    {u.name}
                  </Text>
                </UnstyledButton>
                <Text size="xs" c="dimmed" truncate>
                  <span dir="ltr">@{u.username}</span>
                </Text>
              </div>
              {u._id !== me?._id && <FollowButton userId={u._id} initialFollowing={false} />}
            </Group>
          ))}
        </Stack>
      )}
    </Modal>
  );
}
