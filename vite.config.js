import seoBuild from "./scripts/seo-build.js";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/",

  plugins: [react(), tailwindcss(), seoBuild()],

  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("/node_modules/")) {
            return undefined;
          }

          if (/\/node_modules\/(react|react-dom|scheduler)\//.test(id)) {
            return "react-vendor";
          }

          if (/\/node_modules\/(react-router|react-router-dom)\//.test(id)) {
            return "router-vendor";
          }

          return undefined;
        },
      },
    },
  },
});
