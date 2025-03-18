import type { MetadataRoute } from "next";

const BASE_URL = "https://uenroll.ca";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      priority: 1,
    },
  ];
}
