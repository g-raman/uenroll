import { envClient } from "@repo/env/client";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () =>
        new Response(
          `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${envClient.NEXT_PUBLIC_BASE_URL}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>1</priority>
  </url>
</urlset>`,
          {
            headers: {
              "content-type": "application/xml; charset=utf-8",
            },
          },
        ),
    },
  },
});
