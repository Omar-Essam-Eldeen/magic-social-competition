import { useNavigate } from "react-router-dom";
import { Button, Card, Center, Container, Group, Loader, SimpleGrid, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { Bookmark, Image as ImageIcon, Users } from "lucide-react";
import { useAuth } from "../../context/useAuth.ts";
import { useLanguage } from "../../context/useLanguage.ts";
import Home from "../Home/Home.tsx";
import { LogoMark } from "../../components/Brand.tsx";

/** Root switch for "/": logged in → feed, logged out → landing page. */
export function RootSwitch() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <Center h="60vh">
        <Loader />
      </Center>
    );
  }
  return user ? <Home /> : <Landing />;
}

/** CSS-only mock feed preview: gradient avatar dots, fake text bars and a
    gradient image block — clearly a mockup, no real user data. */
function MockFeed() {
  const rows = [0, 1];
  return (
    <div aria-hidden="true" style={{ width: "100%", maxWidth: 640 }}>
      <Card padding="lg" w="100%">
        <Stack gap="lg">
          {rows.map((row) => (
            <Stack key={row} gap="md">
              <Group gap="sm" align="flex-start">
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "var(--accent-grad)",
                    flexShrink: 0,
                  }}
                />
                <Stack gap="xs" style={{ flex: 1 }} pt={4}>
                  <div style={{ background: "var(--glass-chip)", borderRadius: 6, width: "60%", height: 10 }} />
                  <div style={{ background: "var(--glass-chip)", borderRadius: 6, width: "40%", height: 10 }} />
                </Stack>
              </Group>
              <div
                style={{
                  borderRadius: 17,
                  height: 140,
                  background: "linear-gradient(135deg,#7c3aed,#0e7490)",
                  opacity: 0.8,
                }}
              />
            </Stack>
          ))}
        </Stack>
      </Card>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const features = [
    {
      Icon: ImageIcon,
      title: t.landing.featureShareTitle,
      text: t.landing.featureShareText,
    },
    {
      Icon: Users,
      title: t.landing.featureFollowTitle,
      text: t.landing.featureFollowText,
    },
    {
      Icon: Bookmark,
      title: t.landing.featureSaveTitle,
      text: t.landing.featureSaveText,
    },
  ] as const;

  return (
    <Container size={900} py="xl">
      <Stack gap="xl" align="center">
        <Stack gap="md" align="center" ta="center">
          <LogoMark size={72} />
          <Title order={1} ff="Sora, system-ui, sans-serif">
            Magic <span className="grad-text">Social</span>
          </Title>
          <Text size="lg" c="dimmed" maw={480}>
            {t.landing.tagline}
          </Text>
          <Group gap="sm" mt="xs">
            <Button size="md" variant="gradient" onClick={() => navigate("/login")}>
              {t.common.login}
            </Button>
            <Button size="md" variant="outline" onClick={() => navigate("/signup")}>
              {t.common.signup}
            </Button>
          </Group>
        </Stack>

        <MockFeed />

        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" w="100%">
          {features.map(({ Icon, title, text }) => (
            <Card key={title} padding="lg">
              <ThemeIcon variant="light" size="lg" radius="md" mb="sm" aria-hidden="true">
                <Icon size={20} />
              </ThemeIcon>
              {/* h2 (was h4 — skipped h2/h3 after the h1 above), kept at the h4 visual size. */}
              <Title order={2} fz="var(--mantine-h4-font-size)" lh="var(--mantine-h4-line-height)" mb="xs">
                {title}
              </Title>
              <Text size="sm" c="dimmed">
                {text}
              </Text>
            </Card>
          ))}
        </SimpleGrid>

        <Text size="sm" c="dimmed" ta="center">
          {t.landing.footer}
        </Text>
      </Stack>
    </Container>
  );
}
