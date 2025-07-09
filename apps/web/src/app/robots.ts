import { envClient } from "@repo/env";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${envClient.NEXT_PUBLIC_BASE_URL}/sitemap.xml`,
  };
}
