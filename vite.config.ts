import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // We ship our own manifest file (public/manifest.webmanifest) —
      // do NOT let the plugin generate one.
      manifest: false,
      // We register the service worker ourselves in src/main.tsx
      // (virtual:pwa-register), so do not inject a second registration.
      injectRegister: false,
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,webp}"],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/react-router-dom/") ||
            id.includes("/react-router/") ||
            id.includes("/scheduler/")
          ) {
            return "vendor-react";
          }
          if (id.includes("/@mantine/")) return "vendor-mantine";
          return "vendor-lib";
        },
      },
    },
  },
});
