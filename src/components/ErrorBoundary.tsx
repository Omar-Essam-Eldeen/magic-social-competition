import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button, Card, Container, Stack, Text, Title } from "@mantine/core";
import { useLanguage } from "../context/useLanguage.ts";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/** Fallback UI rendered by the class boundary — a function component so it
    can read the current language via the hook (class components can't). */
function ErrorFallback() {
  const { t } = useLanguage();
  return (
    <Container size={640} px="md" py="xl">
      <Card padding="lg">
        <Stack gap="md">
          <Title order={3}>{t.errors.unexpectedTitle}</Title>
          <Text c="dimmed">{t.errors.unexpectedText}</Text>
          <Button onClick={() => window.location.reload()}>{t.common.retry}</Button>
        </Stack>
      </Card>
    </Container>
  );
}

// Catches render errors anywhere below it so one broken component cannot
// blank the whole app. The fallback offers a reload, which is the only
// recovery that makes sense for a render crash.
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("ErrorBoundary caught a render error:", error, info);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
