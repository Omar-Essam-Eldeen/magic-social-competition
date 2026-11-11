import { useNavigate } from "react-router-dom";
import { Button, Card, Center, Container, Group, Loader, SimpleGrid, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { Bookmark, Image as ImageIcon, Users } from "lucide-react";
import { useAuth } from "../../context/useAuth.ts";
import Home from "../Home/Home.tsx";
import { LogoMark } from "../../components/Brand.tsx";

const FEATURES = [
  {
    Icon: ImageIcon,
    title: "Share posts with photos",
    text: "Write what's on your mind and add a photo — your posts show up in the feed right away.",
  },
  {
    Icon: Users,
    title: "Follow people and see their posts",
    text: "Follow the people you like and switch the feed to Following to see just their posts.",
  },
  {
    Icon: Bookmark,
    title: "Save what you love",
    text: "Tap the bookmark on any post to keep it in Saved, ready whenever you want it back.",
  },
] as const;

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

  return (
    <Container size={720} py="xl">
      <Stack gap="xl" align="center">
        <Stack gap="md" align="center" ta="center">
          <LogoMark size={72} />
          <Title order={1} ff="Sora, system-ui, sans-serif">
            Magic Social
          </Title>
          <Text size="lg" c="dimmed" maw={480}>
            Share posts with photos, follow people you like, and save the posts you love.
          </Text>
          <Group gap="sm" mt="xs">
            <Button size="md" onClick={() => navigate("/login")}>
              Log in
            </Button>
            <Button size="md" variant="outline" onClick={() => navigate("/signup")}>
              Sign up
            </Button>
          </Group>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" w="100%">
          {FEATURES.map(({ Icon, title, text }) => (
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
          Magic Social — connect, share, and save what you love.
        </Text>
      </Stack>
    </Container>
  );
}
