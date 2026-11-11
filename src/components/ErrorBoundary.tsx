import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button, Card, Container, Stack, Text, Title } from "@mantine/core";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
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
      return (
        <Container size={640} px="md" py="xl">
          <Card padding="lg">
            <Stack gap="md">
              <Title order={3}>Something went wrong</Title>
              <Text c="dimmed">The app hit an unexpected error. Reloading usually fixes it.</Text>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </Stack>
          </Card>
        </Container>
      );
    }
    return this.props.children;
  }
}
