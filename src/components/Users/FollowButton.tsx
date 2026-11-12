import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { followUser } from "../../api/Users/api.ts";
import { useLanguage } from "../../context/useLanguage.ts";

interface FollowButtonProps {
  userId: string;
  /** Display name shown in the follow/unfollow toast. */
  userName: string;
  initialFollowing?: boolean;
}

export default function FollowButton({ userId, userName, initialFollowing = false }: FollowButtonProps) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [following, setFollowing] = useState(initialFollowing);

  const followMutation = useMutation({
    mutationFn: () => followUser(userId),
    onSuccess: (response) => {
      // The API tells us the new state — trust it, don't guess from the old one.
      setFollowing(response.data.following);
      notifications.show({
        title: response.data.following ? t.toasts.followed(userName) : t.toasts.unfollowed(userName),
        message: "",
      });
      void queryClient.invalidateQueries({ queryKey: ["suggestions"] });
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
      void queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
    },
    onError: () => {
      notifications.show({
        color: "red",
        title: t.errors.followErrorTitle,
        message: t.common.tryAgain,
      });
    },
  });

  return (
    <Button
      size="xs"
      variant={following ? "light" : "filled"}
      loading={followMutation.isPending}
      disabled={followMutation.isPending}
      onClick={() => followMutation.mutate()}>
      {following ? t.common.followingState : t.common.follow}
    </Button>
  );
}
