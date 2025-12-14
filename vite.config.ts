import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import {crx} from "@crxjs/vite-plugin";
import manifest from "./public/manifest.json";
import path from "path";

export default defineConfig({
  plugins: [react(), crx({manifest})],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "src"),
    },
  },
  build: {
    outDir: "build",
  },
  css: {
    postcss: "./postcss.config.js",
  },
});
