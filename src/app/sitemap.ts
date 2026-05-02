import type { MetadataRoute } from "next";

const SITE = "https://stocksnet.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: `${SITE}/`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${SITE}/sector-map`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${SITE}/overlap`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE}/smart-money`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${SITE}/unusual-volume`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${SITE}/fire`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE}/support`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
