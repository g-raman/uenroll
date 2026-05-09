import { envClient } from "@repo/env/client";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () =>
        new Response(
          [
            "User-agent: *",
            "Allow: /",
            `Sitemap: ${envClient.NEXT_PUBLIC_BASE_URL}/sitemap.xml`,
          ].join("\n"),
          {
            headers: {
              "content-type": "text/plain; charset=utf-8",
            },
          },
        ),
    },
  },
});
