import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "My React App",
        short_name: "Wavve-test",
        start_url: "/",
        display: "standalone",
        background_color: "#ffff00",
        theme_color: "#000000",
        icons: [
          {
            src: "/m-icon-192.svg",
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
          {
            src: "/m-icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable", //
          },
        ],
      },
    }),
  ],
});
