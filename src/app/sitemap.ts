import type { MetadataRoute } from "next";

const baseUrl = "https://gridpulse-three.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${baseUrl}/judge`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/report`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];
}
