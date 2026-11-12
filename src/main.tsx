import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import App from "./App.tsx";
import { theme, themeVariables } from "./theme.ts";
import "./styles/glass.css";
import { Backdrop } from "./components/Backdrop.tsx";
import { AuthProvider } from "./context/AuthProvider.tsx";
import { LanguageProvider } from "./context/LanguageProvider.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} cssVariablesResolver={themeVariables} defaultColorScheme="auto">
        <Backdrop />
        <LanguageProvider>
          <Notifications classNames={{ notification: "glass-toast" }} />
          <ModalsProvider>
            <BrowserRouter>
              <AuthProvider>
                <App />
              </AuthProvider>
            </BrowserRouter>
          </ModalsProvider>
        </LanguageProvider>
      </MantineProvider>
    </QueryClientProvider>
  </StrictMode>,
);
