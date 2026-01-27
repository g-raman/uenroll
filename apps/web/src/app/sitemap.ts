import { envClient } from "@repo/env/client";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: envClient.NEXT_PUBLIC_BASE_URL,
      lastModified: new Date(),
      priority: 1,
    },
  ];
}
