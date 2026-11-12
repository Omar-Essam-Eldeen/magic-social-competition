// Glass theme (Round 2, Stage A). Cinematic glass foundation per the
// locked glass theme spec: violet→cyan accent, translucent glass panels
// over a drifting gradient-mesh backdrop, Sora display + Inter body.
// Mantine supplies components and the colour-scheme machinery; the glass
// itself (blur, lit top edge, layered shadows) lives in src/styles/glass.css.
import { createTheme, type CSSVariablesResolver } from "@mantine/core";

const ACCENT_GRADIENT =
  "linear-gradient(120deg, #8b5cf6 0%, #6366f1 45%, #22d3ee 110%)";
const GRADIENT_SHADOW =
  "inset 0 1px 0 rgba(255, 255, 255, 0.55), inset 0 -8px 14px rgba(10, 0, 50, 0.22), 0 12px 24px -8px rgba(99, 102, 241, 0.75)";
const FIELD_BORDER = "1px solid var(--glass-border)";
const FOCUS_BORDER = "rgba(139, 92, 246, 0.65)";

const fieldInput = {
  backgroundColor: "var(--glass-field)",
  border: FIELD_BORDER,
  borderRadius: "16px",
  boxShadow: "inset 0 1px 0 var(--glass-edge)",
  "&:focus": {
    borderColor: FOCUS_BORDER,
  },
};

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
  radius: { xs: "8px", sm: "12px", md: "16px", lg: "22px", xl: "28px" },
  defaultRadius: "md",
  shadows: {
    md: "var(--glass-shadow)",
    lg: "var(--glass-shadow)",
    xl: "var(--glass-shadow)",
  },
  components: {
    // Glass panels: Mantine supplies the box, the .glass-card class in
    // glass.css supplies translucency, blur, lit top edge and shadow.
    // Never set a Mantine background colour here — it would cover the fill.
    Card: {
      defaultProps: { radius: "lg", withBorder: true },
      classNames: { root: "glass-card" },
    },
    Paper: {
      defaultProps: { radius: "lg", withBorder: true },
      classNames: { root: "glass-card" },
    },
    Avatar: {
      defaultProps: { radius: 999 },
    },
    Button: {
      // Custom "gradient" variant: the spec's 3-stop 120deg gradient.
      // Mantine already ships a variant named "gradient"; the vars/styles
      // below restyle it to the exact spec gradient (theme vars merge
      // after Mantine's own vars resolver, so these win).
      vars: (_theme: unknown, props: { variant?: string }) =>
        props.variant === "gradient"
          ? {
              root: {
                "--button-bg": "var(--accent-grad)",
                "--button-hover": "var(--accent-grad)",
                "--button-color": "#ffffff",
                "--button-hover-color": "#ffffff",
                "--button-bd": "1px solid transparent",
                "--button-radius": "999px",
              },
            }
          : { root: {} },
      styles: (_theme: unknown, props: { variant?: string }) =>
        props.variant === "gradient"
          ? {
              root: {
                boxShadow: GRADIENT_SHADOW,
                transition:
                  "transform 0.18s ease, filter 0.18s ease, background 0.18s ease",
                "&:hover": {
                  filter: "brightness(1.07)",
                  transform: "translateY(-1px)",
                },
                "&:active": {
                  transform: "scale(0.98)",
                },
                "&:disabled, &[data-disabled]": {
                  opacity: 0.45,
                  transform: "none",
                  filter: "none",
                },
              },
            }
          : {},
    },
    // Fields: the field recipe — field fill, glass border, radius md.
    // Focus changes only the border, to the composer focus colour.
    TextInput: {
      styles: { input: fieldInput },
    },
    Textarea: {
      styles: { input: fieldInput },
    },
    PasswordInput: {
      styles: { input: fieldInput },
    },
    FileInput: {
      styles: { input: fieldInput },
    },
    Modal: {
      // The glass goes on the dialog content, NOT the root: the root is
      // the full-viewport portal wrapper, and styling it painted the
      // whole screen (same container-layer mistake as Notifications).
      classNames: { content: "glass-pop" },
    },
  },
});

// All glass tokens from the spec's tables, resolved per colour scheme so
// they follow Mantine's data-mantine-color-scheme attribute. Text tiers
// map onto Mantine's own variables; the placeholder colour stays
// contrast-safe (Mantine's default #adb5bd is 2.07:1 on white) and the
// unread-notification timestamp keeps its own token.
export const themeVariables: CSSVariablesResolver = () => ({
  variables: {
    "--accent-grad": ACCENT_GRADIENT,
  },
  light: {
    "--glass": "rgba(255, 255, 255, 0.50)",
    "--glass-strong": "rgba(255, 255, 255, 0.78)",
    "--glass-soft": "rgba(255, 255, 255, 0.45)",
    "--glass-border": "rgba(255, 255, 255, 0.75)",
    "--glass-edge": "rgba(255, 255, 255, 0.95)",
    "--glass-field": "rgba(255, 255, 255, 0.55)",
    "--glass-chip": "rgba(255, 255, 255, 0.55)",
    "--glass-bar": "rgba(250, 249, 255, 0.62)",
    "--glass-pop": "rgba(252, 251, 255, 0.95)",
    "--glass-hover": "rgba(80, 60, 180, 0.07)",
    "--glass-divider": "rgba(60, 40, 140, 0.10)",
    "--glass-shadow":
      "0 24px 44px -18px rgba(76, 52, 160, 0.35), 0 4px 14px rgba(76, 52, 160, 0.12)",
    "--bg-0": "#e9eafc",
    "--bg-1": "#f6eafd",
    "--tag-color": "#6d28d9",
    "--mantine-color-body": "#e9eafc",
    "--mantine-color-text": "#191233",
    "--mantine-color-dimmed": "#6d6595",
    "--mantine-color-placeholder": "#5c5f66",
    "--notification-unread-time": "#495057",
  },
  dark: {
    "--glass": "rgba(20, 14, 44, 0.52)",
    "--glass-strong": "rgba(24, 17, 52, 0.72)",
    "--glass-soft": "rgba(255, 255, 255, 0.055)",
    "--glass-border": "rgba(255, 255, 255, 0.13)",
    "--glass-edge": "rgba(255, 255, 255, 0.28)",
    "--glass-field": "rgba(255, 255, 255, 0.07)",
    "--glass-chip": "rgba(255, 255, 255, 0.08)",
    "--glass-bar": "rgba(10, 6, 28, 0.60)",
    "--glass-pop": "rgba(23, 15, 50, 0.94)",
    "--glass-hover": "rgba(255, 255, 255, 0.08)",
    "--glass-divider": "rgba(255, 255, 255, 0.09)",
    "--glass-shadow":
      "0 24px 48px -16px rgba(2, 0, 16, 0.75), 0 4px 14px rgba(2, 0, 16, 0.40)",
    "--bg-0": "#05030d",
    "--bg-1": "#0b0620",
    "--tag-color": "#22d3ee",
    "--mantine-color-body": "#05030d",
    "--mantine-color-text": "#f4f2ff",
    "--mantine-color-dimmed": "#9d97c4",
    "--mantine-color-placeholder": "#a9adb3",
    "--notification-unread-time": "#9aa0aa",
  },
});
