// Clean + modern theme (Phase 2). Plain surfaces, 1px borders, no blur,
// no orbs, no gradients-as-chrome. The violet brand scale is kept and used
// sparingly (primary buttons, active nav, links).
import { createTheme, type CSSVariablesResolver } from "@mantine/core";

export const theme = createTheme({
  primaryColor: "brand",
  primaryShade: { light: 6, dark: 5 },
  colors: {
    brand: [
      "#f4f1ff",
      "#e9e2ff",
      "#d3c6ff",
      "#b7a2ff",
      "#9a7bff",
      "#8b5cf6",
      "#7c4de8",
      "#6d3fd1",
      "#5b34b0",
      "#4a2c8f",
    ],
  },
  fontFamily: '"Inter", "Cairo", system-ui, sans-serif',
  headings: {
    fontFamily: '"Sora", "Cairo", system-ui, sans-serif',
    fontWeight: "700",
  },
  // Cards 16px, buttons/inputs 10px (defaultRadius sm), avatars round.
  radius: { xs: "6px", sm: "10px", md: "16px", lg: "20px", xl: "24px" },
  defaultRadius: "sm",
  components: {
    // Cards: solid card background + 1px border, NO shadow.
    Card: {
      defaultProps: { radius: "md", withBorder: true },
      styles: {
        root: {
          backgroundColor: "var(--mantine-color-default)",
          borderColor: "var(--mantine-color-default-border)",
          boxShadow: "none",
        },
      },
    },
    Paper: {
      defaultProps: { radius: "md", withBorder: true },
      styles: {
        root: {
          backgroundColor: "var(--mantine-color-default)",
          borderColor: "var(--mantine-color-default-border)",
          boxShadow: "none",
        },
      },
    },
    Avatar: {
      // Round avatars at every size (radius "xl" is only 24px, which reads
      // as a rounded rectangle on the 104px profile photo).
      defaultProps: { radius: 999 },
    },
    Button: {
      defaultProps: { radius: "sm" },
    },
    // Fields: plain card-background inputs with the token border.
    TextInput: {
      styles: {
        input: {
          backgroundColor: "var(--mantine-color-default)",
          border: "1px solid var(--mantine-color-default-border)",
          borderRadius: "10px",
        },
      },
    },
    Textarea: {
      styles: {
        input: {
          backgroundColor: "var(--mantine-color-default)",
          border: "1px solid var(--mantine-color-default-border)",
          borderRadius: "10px",
        },
      },
    },
    PasswordInput: {
      styles: {
        input: {
          backgroundColor: "var(--mantine-color-default)",
          border: "1px solid var(--mantine-color-default-border)",
          borderRadius: "10px",
        },
      },
    },
    FileInput: {
      styles: {
        input: {
          backgroundColor: "var(--mantine-color-default)",
          border: "1px solid var(--mantine-color-default-border)",
          borderRadius: "10px",
        },
      },
    },
  },
});

// Minimal resolver: only the locked page/card/border/text/dimmed tokens.
// Light: page #f7f8fa, card #ffffff, border #e6e8ec, text #17181c, dimmed #6b7280.
// Dark: page #0e1013, card #171a20, border rgba(255,255,255,0.08), text #f2f3f5, dimmed #9aa0aa.
export const themeVariables: CSSVariablesResolver = () => ({
  variables: {},
  light: {
    "--mantine-color-body": "#f7f8fa",
    "--mantine-color-default": "#ffffff",
    "--mantine-color-default-border": "#e6e8ec",
    "--mantine-color-text": "#17181c",
    "--mantine-color-dimmed": "#6b7280",
  },
  dark: {
    "--mantine-color-body": "#0e1013",
    "--mantine-color-default": "#171a20",
    "--mantine-color-default-border": "rgba(255, 255, 255, 0.08)",
    "--mantine-color-text": "#f2f3f5",
    "--mantine-color-dimmed": "#9aa0aa",
  },
});
