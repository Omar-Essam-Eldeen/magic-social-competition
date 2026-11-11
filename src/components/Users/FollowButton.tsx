import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { followUser } from "../../api/Users/api.ts";

interface FollowButtonProps {
  userId: string;
  initialFollowing?: boolean;
}

export default function FollowButton({ userId, initialFollowing = false }: FollowButtonProps) {
  const queryClient = useQueryClient();
  const [following, setFollowing] = useState(initialFollowing);

  const followMutation = useMutation({
    mutationFn: () => followUser(userId),
    onSuccess: (response) => {
      // The API tells us the new state — trust it, don't guess from the old one.
      setFollowing(response.data.following);
      void queryClient.invalidateQueries({ queryKey: ["suggestions"] });
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
      void queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
    },
    onError: () => {
      notifications.show({
        color: "red",
        title: "Couldn't update follow",
        message: "Try again.",
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
      {following ? "Following" : "Follow"}
    </Button>
  );
}
