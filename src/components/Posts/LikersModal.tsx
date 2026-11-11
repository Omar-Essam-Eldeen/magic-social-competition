import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Alert, Avatar, Button, Group, Modal, Skeleton, Stack, Text, UnstyledButton } from "@mantine/core";
import { getPostLikers } from "../../api/Posts/api.ts";
import { useLanguage } from "../../context/useLanguage.ts";

interface LikersModalProps {
  postId: string | null;
  onClose: () => void;
}

export default function LikersModal({ postId, onClose }: LikersModalProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const likersQuery = useQuery({
    queryKey: ["likers", postId],
    queryFn: () => getPostLikers(postId!),
    enabled: !!postId,
  });
  const likers = likersQuery.data?.data ?? [];

  const handleRowClick = (userId: string) => {
    onClose();
    navigate(`/users/${userId}`);
  };

  return (
    <Modal opened={postId !== null} onClose={onClose} title={t.post.likedByTitle} centered>
      {likersQuery.isPending ? (
        <Stack gap="sm">
          <Skeleton height={48} radius="md" />
          <Skeleton height={48} radius="md" />
          <Skeleton height={48} radius="md" />
        </Stack>
      ) : likersQuery.isError ? (
        <Alert color="red" title={t.post.likersLoadErrorTitle}>
          <Text size="sm" mb="sm">
            {t.errors.checkConnection}
          </Text>
          <Button onClick={() => likersQuery.refetch()}>{t.common.retry}</Button>
        </Alert>
      ) : likers.length === 0 ? (
        <Text c="dimmed">{t.post.noLikes}</Text>
      ) : (
        <Stack gap="sm">
          {likers.map((liker) => (
            <UnstyledButton key={liker._id} onClick={() => handleRowClick(liker._id)} style={{ display: "block" }}>
              <Group gap="sm">
                <Avatar src={liker.photo} alt={liker.name} radius="xl" size={40}>
                  {liker.name?.[0] ?? "?"}
                </Avatar>
                <div>
                  <Text fw={700} size="sm" ff="Sora, system-ui, sans-serif">
                    {liker.name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    <span dir="ltr">@{liker.username}</span>
                  </Text>
                </div>
              </Group>
            </UnstyledButton>
          ))}
        </Stack>
      )}
    </Modal>
  );
}
