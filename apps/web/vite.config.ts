import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    define: {
      "process.env.VITE_BASE_URL": JSON.stringify(env.VITE_BASE_URL),
      "process.env.VITE_POSTHOG_HOST": JSON.stringify(env.VITE_POSTHOG_HOST),
      "process.env.VITE_POSTHOG_KEY": JSON.stringify(env.VITE_POSTHOG_KEY),
    },
    server: {
      port: 3000,
    },
    ssr: {
      noExternal: ["rrule"],
    },
    resolve: {
      tsconfigPaths: true,
    },
    plugins: [
      tailwindcss(),
      cloudflare({ viteEnvironment: { name: "ssr" } }),
      tanstackStart({
        srcDirectory: "src",
        router: {
          routesDirectory: "app",
        },
      }),
      viteReact(),
    ],
  };
});
