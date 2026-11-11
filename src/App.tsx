import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./context/useAuth";
import { useLanguage } from "./context/useLanguage";
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
import { Bell, Bookmark, Home, LogOut, Moon, Sun, User } from "lucide-react";
import AppRoutes from "./Routes.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import Brand from "./components/Brand.tsx";
import LanguageToggle from "./components/LanguageToggle.tsx";
import SuggestionsCard from "./components/Users/SuggestionsCard.tsx";
import { getUserPosts } from "./api/Users/api.ts";
import { getUnreadCount } from "./api/Notifications/api.ts";

/** Right-rail mini profile: avatar, name, @username, Posts count, link to /profile. */
function ProfileMiniCard() {
  const { user } = useAuth();
  const { t } = useLanguage();
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
            <span dir="ltr">@{user.username}</span>
          </Text>
        </div>
      </Group>
      <Text size="sm" mb="sm">
        <Text span fw={700}>
          {totalPosts}
        </Text>{" "}
        <Text span c="dimmed">
          {t.common.posts}
        </Text>
      </Text>
      <Button variant="light" size="xs" fullWidth onClick={() => navigate("/profile")}>
        {t.common.viewProfile}
      </Button>
    </Card>
  );
}

export default function App() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";
  const { t } = useLanguage();

  // Nav labels and page titles come from the dictionary so they update
  // live when the language changes — they must live inside the component.
  const NAV_ITEMS = [
    { to: "/", label: t.nav.home, Icon: Home },
    { to: "/bookmarks", label: t.nav.saved, Icon: Bookmark },
    { to: "/notifications", label: t.nav.notifications, Icon: Bell },
    { to: "/profile", label: t.nav.profile, Icon: User },
  ] as const;

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
  // Titles come from the dictionary and live inside the effect so they
  // update when the language changes without re-creating a dep object.
  useEffect(() => {
    const pathname = location.pathname;
    const pageTitles: Record<string, string> = {
      "/": t.common.titles.home,
      "/login": t.common.titles.login,
      "/signup": t.common.titles.signup,
      "/profile": t.common.titles.profile,
      "/bookmarks": t.common.titles.saved,
      "/notifications": t.common.titles.notifications,
    };
    document.title = pathname.startsWith("/posts/")
      ? t.common.titles.post
      : (pageTitles[pathname] ?? t.common.titles.home);
  }, [location.pathname, t]);

  const handleLogout = () => {
    modals.openConfirmModal({
      title: t.common.logoutTitle,
      children: <Text size="sm">{t.common.logoutText}</Text>,
      labels: { confirm: t.common.logout, cancel: t.common.cancel },
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
      aria-label={dark ? t.common.switchToLight : t.common.switchToDark}
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
          <UnstyledButton aria-label={t.common.goHome} onClick={() => navigate("/")}>
            <Brand />
          </UnstyledButton>
          <Group gap="xs">
            <LanguageToggle />
            {themeToggle}
            {user && (
              // Icon-only here: this header is the mobile header when logged
              // in, and the full "تسجيل الخروج" label is too wide for 390px —
              // it wrapped out of the 60px header and covered page content.
              // The desktop navbar keeps the full labelled button.
              <ActionIcon
                variant="light"
                aria-label={t.common.logout}
                onClick={handleLogout}>
                <LogOut size={20} />
              </ActionIcon>
            )}
          </Group>
        </Group>
      </AppShell.Header>

      {/* Desktop left navbar: logo at top, nav, theme toggle + Logout at the bottom. */}
      <AppShell.Navbar p="md">
        <Stack h="100%" gap="md">
          <UnstyledButton aria-label={t.common.goHome} onClick={() => navigate("/")}>
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
                    <Badge size="sm" color="red" circle aria-label={t.common.unread(unreadCount)}>
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
            <Group gap="xs">
              <LanguageToggle />
              {themeToggle}
            </Group>
            {user && (
              <Button variant="light" size="sm" onClick={handleLogout}>
                {t.common.logout}
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
              {t.nav.aboutTitle}
            </Title>
            <Text size="sm" c="dimmed">
              {t.nav.aboutText}
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
                    aria-label={showBadge ? `${label}, ${t.common.unreadShort(unreadCount)}` : label}
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
