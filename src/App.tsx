import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./context/useAuth";
import {
  ActionIcon,
  AppShell,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Group,
  Indicator,
  NavLink,
  Stack,
  Text,
  Title,
  UnstyledButton,
  useMantineColorScheme,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { Bell, Bookmark, Home, Moon, Sun, User } from "lucide-react";
import AppRoutes from "./Routes.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import Brand from "./components/Brand.tsx";
import SuggestionsCard from "./components/Users/SuggestionsCard.tsx";
import { getUserPosts } from "./api/Users/api.ts";
import { getUnreadCount } from "./api/Notifications/api.ts";

const NAV_ITEMS = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/bookmarks", label: "Saved", Icon: Bookmark },
  { to: "/notifications", label: "Notifications", Icon: Bell },
  { to: "/profile", label: "Profile", Icon: User },
] as const;

const PAGE_TITLES: Record<string, string> = {
  "/": "Magic Social",
  "/login": "Log in — Magic Social",
  "/signup": "Sign up — Magic Social",
  "/profile": "Profile — Magic Social",
  "/bookmarks": "Saved — Magic Social",
  "/notifications": "Notifications — Magic Social",
};

/** Right-rail mini profile: avatar, name, @username, Posts count, link to /profile. */
function ProfileMiniCard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const postsQuery = useQuery({
    queryKey: ["userPosts", user?._id],
    queryFn: () => getUserPosts(user!._id),
    enabled: !!user?._id,
  });
  if (!user) return null;
  const totalPosts = postsQuery.data?.meta?.pagination?.total ?? postsQuery.data?.data.posts.length ?? 0;

  return (
    <Card padding="md">
      <Group gap="sm" mb="sm">
        <Avatar src={user.photo} alt={user.name} radius="xl" size={44}>
          {user.name?.[0]}
        </Avatar>
        <div>
          <Text fw={700} size="sm" ff="Sora, system-ui, sans-serif">
            {user.name}
          </Text>
          <Text size="xs" c="dimmed">
            @{user.username}
          </Text>
        </div>
      </Group>
      <Text size="sm" mb="sm">
        <Text span fw={700}>
          {totalPosts}
        </Text>{" "}
        <Text span c="dimmed">
          Posts
        </Text>
      </Text>
      <Button variant="light" size="xs" fullWidth onClick={() => navigate("/profile")}>
        View profile
      </Button>
    </Card>
  );
}

export default function App() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Unread notification count, polled once a minute — drives the badge
  // on the Notifications nav item (desktop) and tab (mobile).
  const unreadQuery = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getUnreadCount,
    refetchInterval: 60_000,
    enabled: !!user,
  });
  const unreadCount = unreadQuery.data?.data.unreadCount ?? 0;
  const unreadLabel = unreadCount > 99 ? "99+" : unreadCount;

  // Per-page document title, so tabs and history entries say where you are.
  useEffect(() => {
    const pathname = location.pathname;
    document.title = pathname.startsWith("/posts/")
      ? "Post — Magic Social"
      : (PAGE_TITLES[pathname] ?? "Magic Social");
  }, [location.pathname]);

  const handleLogout = () => {
    modals.openConfirmModal({
      title: "Log out?",
      children: <Text size="sm">Are you sure you want to log out of Magic Social?</Text>,
      labels: { confirm: "Log out", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        logout();
        navigate("/login");
      },
    });
  };

  const themeToggle = (
    <ActionIcon
      variant="default"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggleColorScheme}>
      {dark ? <Sun size={20} /> : <Moon size={20} />}
    </ActionIcon>
  );

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 264, breakpoint: "sm", collapsed: { mobile: true, desktop: !user } }}
      aside={{ width: 320, breakpoint: "lg", collapsed: { mobile: true, desktop: !user } }}
      footer={{ height: 60 }}
      padding="md">
      {/* Top header: logo + theme toggle (+ Logout when logged in).
          On mobile it is always shown. On desktop it is shown only when
          logged out — otherwise the navbar carries the logo and toggle,
          and a logged-out desktop user would have no way to switch themes. */}
      <AppShell.Header hiddenFrom={user ? "sm" : undefined}>
        <Group h="100%" px="md" justify="space-between">
          <UnstyledButton aria-label="Magic Social — go to home" onClick={() => navigate("/")}>
            <Brand />
          </UnstyledButton>
          <Group gap="xs">
            {themeToggle}
            {user && (
              <Button variant="light" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            )}
          </Group>
        </Group>
      </AppShell.Header>

      {/* Desktop left navbar: logo at top, nav, theme toggle + Logout at the bottom. */}
      <AppShell.Navbar p="md">
        <Stack h="100%" gap="md">
          <UnstyledButton aria-label="Magic Social — go to home" onClick={() => navigate("/")}>
            <Brand />
          </UnstyledButton>
          <Stack gap={4}>
            {NAV_ITEMS.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                label={label}
                leftSection={<Icon size={18} />}
                rightSection={
                  to === "/notifications" && unreadCount > 0 ? (
                    <Badge size="sm" color="red" circle aria-label={`${unreadCount} unread notifications`}>
                      {unreadLabel}
                    </Badge>
                  ) : undefined
                }
                active={location.pathname === to}
                onClick={() => navigate(to)}
              />
            ))}
          </Stack>
          <Box style={{ flex: 1 }} />
          <Group justify="space-between">
            {themeToggle}
            {user && (
              <Button variant="light" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            )}
          </Group>
        </Stack>
      </AppShell.Navbar>

      {/* Desktop right aside: mini profile + suggestions + about. Hidden on mobile/tablet. */}
      <AppShell.Aside p="md">
        <Stack gap="md">
          <ProfileMiniCard />
          {user && <SuggestionsCard />}
          <Card padding="md">
            <Title order={4} mb="xs">
              About Magic Social
            </Title>
            <Text size="sm" c="dimmed">
              Share posts with photos, follow people you like, and save the posts you love — all in
              one clean feed.
            </Text>
          </Card>
        </Stack>
      </AppShell.Aside>

      <AppShell.Main>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </AppShell.Main>

      {/* Mobile bottom tab bar — Home, Saved, Notifications, Profile. */}
      {user && (
        <AppShell.Footer hiddenFrom="sm">
          <Group h="100%" px="md" justify="space-around">
            {NAV_ITEMS.map(({ to, label, Icon }) => {
              const active = location.pathname === to;
              const showBadge = to === "/notifications" && unreadCount > 0;
              return (
                <Indicator
                  key={to}
                  label={unreadLabel}
                  size={16}
                  color="red"
                  disabled={!showBadge}
                  position="top-end">
                  <ActionIcon
                    variant={active ? "filled" : "subtle"}
                    size="lg"
                    aria-label={showBadge ? `${label}, ${unreadCount} unread` : label}
                    aria-current={active ? "page" : undefined}
                    onClick={() => navigate(to)}>
                    <Icon size={22} />
                  </ActionIcon>
                </Indicator>
              );
            })}
          </Group>
        </AppShell.Footer>
      )}
    </AppShell>
  );
}
