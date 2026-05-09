import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    define: {
      "process.env.NEXT_PUBLIC_BASE_URL": JSON.stringify(
        env.NEXT_PUBLIC_BASE_URL,
      ),
      "process.env.NEXT_PUBLIC_POSTHOG_HOST": JSON.stringify(
        env.NEXT_PUBLIC_POSTHOG_HOST,
      ),
      "process.env.NEXT_PUBLIC_POSTHOG_KEY": JSON.stringify(
        env.NEXT_PUBLIC_POSTHOG_KEY,
      ),
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
      tanstackStart({
        srcDirectory: "src",
        router: {
          routesDirectory: "app",
        },
      }),
      viteReact(),
      nitro(),
    ],
  };
});
