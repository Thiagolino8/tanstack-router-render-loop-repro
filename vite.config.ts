import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    tanstackRouter({
      autoCodeSplitting: true,
      target: "react",
    }),
    react(),
  ],
  resolve: {
    alias: {
      // Custom shim that re-exports React's native useSyncExternalStore.
      // On React 19 the polyfill package is unnecessary; this alias avoids
      // bundling it. However, the `with-selector` shim has a subtle bug:
      // it calls setState during render, which can cause an infinite
      // re-render loop when the selector produces a new reference on every
      // snapshot (e.g. @tanstack/react-store selectors over computed atoms).
      "use-sync-external-store/shim": new URL("./src/shim", import.meta.url)
        .pathname,
    },
  },
});
