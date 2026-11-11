# PWA Setup — Magic Social (Phase 5)

> **Status:** assets are done. This file is the exact wiring the next agent
> applies. It does **not** touch `vite.config.ts`, `src/main.tsx`, or
> `index.html` itself — the wiring agent makes those three edits, using the
> snippets below verbatim.
>
> **Already shipped (this phase, do not regenerate):**
>
> - `public/manifest.webmanifest` — our own manifest file (see below)
> - `public/icons/icon-192.png` — 192×192, golden-M logo, full artwork
> - `public/icons/icon-512.png` — 512×512, golden-M logo, full artwork
> - `public/icons/icon-512-maskable.png` — 512×512 maskable: whole logo
>   artwork scaled to 410×410 (80% of the canvas) and centred on a solid
>   `#150238` fill sampled from the logo's own outer frame, so the fill and
>   the artwork's edge blend seamlessly and the mark sits well inside the
>   maskable safe zone.
>
> Source art: `public/logo.png` (1600×1600 golden-M logo). The "any" icons
> are straight Lanczos downscales of the full square artwork — the mark
> fills the frame, is centred, and nothing is clipped.

## 0. Decision log (so the wiring agent does not re-decide)

- **Ship our own manifest file** (`public/manifest.webmanifest`) instead of
  generating one inline in `vite.config.ts`. Reason: the manifest is a
  hand-checked asset (icons, colours, copy) and stays identical between
  dev/preview/prod; the plugin is only used for the service worker.
  Consequence: `VitePWA` gets `manifest: false`, and `index.html` must
  carry the `<link rel="manifest">` line itself (step 3).
- **`vite-plugin-pwa` is a devDependency** — it runs at build time only;
  nothing from it ships in the client bundle except the tiny generated
  service-worker registration.
- **`registerType: "autoUpdate"`** — the service worker updates itself
  silently; no "new version available" prompt UI is needed for this app.
- **Manual registration via `virtual:pwa-register`** in `main.tsx`
  (step 2), so `injectRegister: false` in the plugin config — otherwise
  the plugin would inject a second, duplicate registration script.

## 1. Install (devDependency)

```bash
npm install -D vite-plugin-pwa
```

After this step, `package.json` gains `"vite-plugin-pwa"` under
`devDependencies` and `package-lock.json` is updated. Commit both.

## 2. `vite.config.ts` — replace the whole file with this

```ts
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
});
```

Notes:

- `globPatterns` covers the built JS/CSS/HTML and the PNG/WebP images
  (including `public/icons/*`, which Vite copies to `dist/` as-is).
  `manifest.webmanifest` is intentionally **not** precached — browsers
  fetch it directly from `/manifest.webmanifest`; it does not need to be
  in the precache.
- No `devOptions.enabled` — the service worker is active in production
  builds (`vite preview` / Vercel) only, not in `vite dev`. That is the
  default and is what we want.

## 3. `index.html` — add / change these two lines in `<head>`

Add (place it next to the existing favicon / apple-touch-icon links):

```html
<link rel="manifest" href="/manifest.webmanifest" />
```

Change the existing theme-color meta so it matches the manifest
(`index.html` currently has `#f7f8fa`):

```html
<meta name="theme-color" content="#8b5cf6" />
```

> ⚠️ **Coordination note:** the README/SEO agent is editing `index.html`
> in parallel. Do not rewrite the whole file — apply only these two
> lines (add the manifest link, change the one `theme-color` value) on
> top of whatever is current, and keep the existing
> `<link rel="apple-touch-icon" href="/apple-touch-icon.png" />` line
> (it already exists and stays as-is).

## 4. `src/main.tsx` — register the service worker

Add this import with the other imports at the top of the file:

```ts
import { registerSW } from "virtual:pwa-register";
```

Add this call **before** the `createRoot(...).render(...)` call:

```ts
registerSW({ immediate: true });
```

Full context (only the added lines are new — everything else stays):

```ts
import { registerSW } from "virtual:pwa-register";
// ... existing imports ...

registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(
  // ... unchanged ...
);
```

`immediate: true` registers the worker as soon as the module loads
instead of waiting for `window.load`, so the app is installable on the
first visit.

## 5. Verify (run after all four steps)

```bash
npm run build            # must be green (tsc + vite build)
npm run preview -- --port 4173 --strictPort
```

Then, in a second terminal (or with `curl` while preview is running):

```bash
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" http://localhost:4173/manifest.webmanifest
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" http://localhost:4173/icons/icon-192.png
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" http://localhost:4173/icons/icon-512.png
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" http://localhost:4173/icons/icon-512-maskable.png
```

Expected: all four return `200` — `application/manifest+json` for the
manifest (Vite serves `.webmanifest` as `application/manifest+json`)
and `image/png` for the three icons. Also confirm in the browser:

- DevTools → Application → Manifest shows "Magic Social", the three
  icons, and no errors.
- DevTools → Application → Service Workers shows an active worker from
  `vite-plugin-pwa` after a production build.
- The install prompt / "Add to Home screen" appears (Chrome/Edge on
  desktop, Chrome on Android).

## 6. The manifest (reference — already shipped, do not duplicate inline)

`public/manifest.webmanifest`:

```json
{
  "name": "Magic Social",
  "short_name": "Magic Social",
  "description": "Connect with friends, share posts and keep up with the people you follow.",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#f7f8fa",
  "theme_color": "#8b5cf6",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "categories": ["social"]
}
```
