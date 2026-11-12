import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
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
  TextInput,
  Title,
  UnstyledButton,
  useMantineColorScheme,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { Bell, Bookmark, Compass, Home, Moon, Plus, Search, Sun, User, X } from "lucide-react";
import AppRoutes from "./Routes.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import AccountMenu from "./components/AccountMenu.tsx";
import BackToTop from "./components/BackToTop.tsx";
import Brand from "./components/Brand.tsx";
import LanguageToggle from "./components/LanguageToggle.tsx";
import CreatePostModal from "./components/Posts/CreatePostModal.tsx";
import TrendingCard from "./components/TrendingCard.tsx";
import SuggestionsCard from "./components/Users/SuggestionsCard.tsx";
import { getProfile } from "./api/Profile/api.ts";
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
        <div className="av-ring">
          <Avatar src={user.photo} alt={user.name} radius="xl" size={44}>
            {user.name?.[0]}
          </Avatar>
        </div>
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

/**
 * Sidebar "at a glance" card: posts count, likes received, following —
 * real numbers from the same queries the profile page already uses, no
 * invented data. Likes received counts only the loaded first page of the
 * user's posts (the API has no totals endpoint), exactly like Profile.
 */
function WeekAtAGlance() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const profileQuery = useQuery({ queryKey: ["profile"], queryFn: getProfile, enabled: !!user });
  const postsQuery = useQuery({
    queryKey: ["userPosts", user?._id],
    queryFn: () => getUserPosts(user!._id),
    enabled: !!user?._id,
  });
  if (!user) return null;
  const totalPosts = postsQuery.data?.meta?.pagination?.total ?? postsQuery.data?.data.posts.length ?? 0;
  const likesReceived = (postsQuery.data?.data.posts ?? []).reduce(
    (sum, post) => sum + (post.likesCount ?? (post.likes ?? []).length),
    0,
  );
  const following = profileQuery.data?.data.followingCount ?? 0;
  const stats = [
    { label: t.common.posts, value: postsQuery.isPending ? "…" : totalPosts },
    { label: t.profile.likesReceived, value: postsQuery.isPending ? "…" : likesReceived },
    { label: t.common.followingCount, value: profileQuery.isPending ? "…" : following },
  ];

  return (
    <Card padding="md" aria-label={t.chrome.atAGlance}>
      <Text size="sm" fw={700} mb="sm">
        {t.chrome.atAGlance}
      </Text>
      <Group gap="xs" grow>
        {stats.map(({ label, value }) => (
          <div key={label} style={{ textAlign: "center", minWidth: 0 }}>
            <Text fw={700} ff="Sora, system-ui, sans-serif">
              {value}
            </Text>
            <Text size="xs" c="dimmed">
              {label}
            </Text>
          </div>
        ))}
      </Group>
    </Card>
  );
}

/**
 * Top-navbar search. Same behavior as the Home feed search: it filters
 * the loaded posts by text/author. The `?q=` URL param is the shared
 * state — Home reads it into its own input, so typing here and typing
 * there stay in sync. Typing from any other page jumps to the feed
 * (replace, so no history spam per keystroke). On mobile the search
 * stays on Home only — the navbar input is desktop-only.
 */
function HeaderSearch() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const value = searchParams.get("q") ?? "";

  const applySearch = (next: string) => {
    if (location.pathname !== "/") {
      navigate(next ? `/?q=${encodeURIComponent(next)}` : "/", { replace: true });
    } else {
      setSearchParams(next ? { q: next } : {}, { replace: true });
    }
  };

  return (
    <TextInput
      aria-label={t.search.ariaLabel}
      placeholder={t.search.placeholder}
      value={value}
      onChange={(e) => applySearch(e.currentTarget.value)}
      leftSection={<Search size={16} />}
      rightSection={
        value ? (
          <ActionIcon variant="subtle" aria-label={t.search.clearAria} onClick={() => applySearch("")}>
            <X size={16} />
          </ActionIcon>
        ) : undefined
      }
      style={{ flex: "1 1 auto", maxWidth: 480 }}
      visibleFrom="sm"
    />
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
    { to: "/explore", label: t.nav.explore, Icon: Compass },
    { to: "/bookmarks", label: t.nav.saved, Icon: Bookmark },
    { to: "/notifications", label: t.nav.notifications, Icon: Bell },
    { to: "/profile", label: t.nav.profile, Icon: User },
  ] as const;

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [createOpen, setCreateOpen] = useState(false);

  // Unread notification count, polled once a minute — drives the badge
  // on the Notifications nav item (desktop) and tab (mobile), and on the
  // top-navbar bell.
  const unreadQuery = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getUnreadCount,
    refetchInterval: 60_000,
    enabled: !!user,
  });
  const unreadCount = unreadQuery.data?.data.unreadCount ?? 0;
  const unreadLabel = unreadCount > 99 ? "99+" : unreadCount;
  const bellLabel =
    unreadCount > 0 ? `${t.nav.notifications}, ${t.common.unreadShort(unreadCount)}` : t.nav.notifications;

  // Per-page document title, so tabs and history entries say where you are.
  // Titles come from the dictionary and live inside the effect so they
  // update when the language changes without re-creating a dep object.
  useEffect(() => {
    const pathname = location.pathname;
    const pageTitles: Record<string, string> = {
      "/": t.common.titles.home,
      "/explore": t.common.titles.explore,
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
      // Round 4, R2: withBorder={false} kills Mantine's own 1px AppShell
      // borders (header bottom, navbar inline-end, aside inline-start,
      // footer top) — the hard lines slicing the layout. Separation is
      // soft glass blur + shadow only; see .glass-bar in glass.css.
      withBorder={false}
      header={{ height: 60 }}
      navbar={{ width: 264, breakpoint: "sm", collapsed: { mobile: true, desktop: !user } }}
      aside={{ width: 320, breakpoint: "lg", collapsed: { mobile: true, desktop: !user } }}
      footer={{ height: 60 }}
      padding="md">
      {/* Sticky glass top navbar (Round 3, N1): compact brand mark, search
          (desktop), notifications bell with unread badge, "New post"
          button, avatar menu. Logged out it is just the mark plus the
          language/theme controls — the sidebar is collapsed then, so the
          header is the only place those controls live. */}
      <AppShell.Header className="glass-bar glass-header">
        <Group h="100%" px="md" justify="space-between" gap="sm" wrap="nowrap">
          {/* Round 4, R1: the full brand (logo + "Magic Social" name) lives
              here in the top navbar only — it was removed from the sidebar,
              so this is the single brand on the page. Compact on mobile. */}
          <UnstyledButton
            aria-label={t.common.goHome}
            onClick={() => navigate("/")}
            style={{ display: "flex", flexShrink: 0 }}>
            <Brand size={32} />
          </UnstyledButton>
          {user && <HeaderSearch />}
          <Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
            {user && (
              <>
                <Indicator
                  label={unreadLabel}
                  size={16}
                  color="red"
                  disabled={unreadCount === 0}
                  position="top-end">
                  <ActionIcon
                    variant="default"
                    size="lg"
                    aria-label={bellLabel}
                    onClick={() => navigate("/notifications")}>
                    <Bell size={20} />
                  </ActionIcon>
                </Indicator>
                <Button
                  variant="gradient"
                  size="sm"
                  leftSection={<Plus size={16} />}
                  visibleFrom="sm"
                  aria-label={t.chrome.newPostAria}
                  onClick={() => setCreateOpen(true)}>
                  {t.chrome.newPost}
                </Button>
                <ActionIcon
                  variant="filled"
                  size="lg"
                  hiddenFrom="sm"
                  aria-label={t.chrome.newPostAria}
                  onClick={() => setCreateOpen(true)}>
                  <Plus size={20} />
                </ActionIcon>
                <AccountMenu onLogout={handleLogout} />
              </>
            )}
            {!user && (
              <>
                <LanguageToggle />
                {themeToggle}
              </>
            )}
          </Group>
        </Group>
      </AppShell.Header>

      {/* Desktop left navbar (Round 4, R3): the rail is a transparent
          full-height column — height runs from below the header to the
          viewport bottom (Mantine's default subtracts the 60px mobile
          tab bar even on desktop, where it is hidden). The glass lives
          on the inner panel, inset 12px so its 22px corners show. */}
      <AppShell.Navbar
        className="chrome-rail"
        style={{
          height: "calc(100dvh - var(--app-shell-header-offset, 3.75rem))",
          padding: 0,
          background: "transparent",
        }}>
        <div className="chrome-rail-panel">
          <Stack h="100%" gap="md">
            <Stack gap={4}>
              {NAV_ITEMS.map(({ to, label, Icon }) => {
                const active = location.pathname === to;
                return (
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
                    active={active}
                    style={
                      active
                        ? {
                            background: "var(--accent-grad)",
                            color: "#fff",
                            borderRadius: 14,
                            boxShadow: "0 10px 22px -8px rgba(99,102,241,0.8)",
                          }
                        : undefined
                    }
                    onClick={() => navigate(to)}
                  />
                );
              })}
            </Stack>
            {user && (
              <>
                <Button
                  variant="gradient"
                  fullWidth
                  leftSection={<Plus size={18} />}
                  aria-label={t.chrome.newPostAria}
                  onClick={() => setCreateOpen(true)}>
                  {t.chrome.newPost}
                </Button>
                <WeekAtAGlance />
              </>
            )}
          <Box style={{ flex: 1 }} />
          <Group justify="space-between">
            <LanguageToggle />
            {themeToggle}
          </Group>
          </Stack>
        </div>
      </AppShell.Navbar>

      {/* Desktop right aside: mini profile + suggestions + about. Hidden on mobile/tablet.
          Same full-height rail + inset glass panel as the navbar (Round 4, R3);
          the inner scroll that makes the bottom cards reachable lands in R4. */}
      <AppShell.Aside
        className="chrome-rail"
        style={{
          height: "calc(100dvh - var(--app-shell-header-offset, 3.75rem))",
          padding: 0,
          background: "transparent",
        }}>
        <div className="chrome-rail-panel">
          <Stack gap="md">
            <ProfileMiniCard />
            {user && <SuggestionsCard />}
            {user && <TrendingCard />}
            <Card padding="md">
              <Title order={4} mb="xs">
                {t.nav.aboutTitle}
              </Title>
              <Text size="sm" c="dimmed">
                {t.nav.aboutText}
              </Text>
            </Card>
          </Stack>
        </div>
      </AppShell.Aside>

      <AppShell.Main className="app-main-pad">
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </AppShell.Main>

      {/* Mobile bottom tab bar — Home, Saved, Notifications, Profile. */}
      {user && (
        <AppShell.Footer hiddenFrom="sm" className="glass-bar glass-bar-footer">
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

      <CreatePostModal opened={createOpen} onClose={() => setCreateOpen(false)} />
      <BackToTop />
    </AppShell>
  );
}
