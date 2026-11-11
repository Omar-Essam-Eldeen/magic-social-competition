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
    <Container size={720} py="xl">
      <Stack gap="xl" align="center">
        <Stack gap="md" align="center" ta="center">
          <LogoMark size={72} />
          <Title order={1} ff="Sora, system-ui, sans-serif">
            Magic Social
          </Title>
          <Text size="lg" c="dimmed" maw={480}>
            {t.landing.tagline}
          </Text>
          <Group gap="sm" mt="xs">
            <Button size="md" onClick={() => navigate("/login")}>
              {t.common.login}
            </Button>
            <Button size="md" variant="outline" onClick={() => navigate("/signup")}>
              {t.common.signup}
            </Button>
          </Group>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" w="100%">
          {features.map(({ Icon, title, text }) => (
            <Card key={title} padding="lg">
              <ThemeIcon variant="light" size="lg" radius="md" mb="sm" aria-hidden="true">
                <Icon size={20} />
              </ThemeIcon>
              <Title order={4} mb="xs">
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
