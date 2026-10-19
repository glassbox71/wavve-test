//vite.config.ts
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const required = [
    "VITE_FIREBASE_API_KEY", "VITE_FIREBASE_AUTH_DOMAIN", "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_STORAGE_BUCKET", "VITE_FIREBASE_MESSAGING_SENDER_ID", "VITE_FIREBASE_APP_ID",
  ];
  const missing = required.filter(name => !env[name]?.trim());
  if (missing.length) {
    throw new Error(`Missing Firebase build variables: ${missing.join(', ')}. Set them in Netlify's build environment and rebuild.`);
  }
  return {
  plugins: [
    {
      name: "public-build-info",
      apply: "build",
      generateBundle() {
        // Only public project identifiers; never include API keys or tokens.
        this.emitFile({
          type: "asset",
          fileName: "build-info.json",
          source: JSON.stringify({
            builtAt: new Date().toISOString(),
            firebaseProjectId: env.VITE_FIREBASE_PROJECT_ID,
            firebaseAuthDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
          }, null, 2),
        });
      },
    },
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: { globIgnores: ["**/build-info.json"] },
      manifest: {
        //사이트앱 이름
        name: "Wavve App",
        short_name: "Wavve",
        start_url: "/",
        display: "standalone",
        // 화면이 열릴때 보이는 배경
        background_color: "#ffffff",
        theme_color: "#000000",
        icons: [
          {
            // src: "/Wavve_192x192.svg",
            // sizes: "192x192",
            // type: "image/svg+xml",
            src: "/Wavve_192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/Wavve_512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable", //
          },
        ],
      },
    }),
  ],
  };
});
