import type { MetadataRoute } from "next";

import { getLiveTools } from "@/data/tools";
import { getSiteUrl } from "@/lib/site-url";

const baseUrl = getSiteUrl();

export default function sitemap(): MetadataRoute.Sitemap {
  const toolEntries = getLiveTools().map((tool) => ({
    path: tool.path,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    { path: "", changeFrequency: "weekly" as const, priority: 1 },
    ...toolEntries,
    { path: "/prof/stats", changeFrequency: "weekly" as const, priority: 0.7 },
    { path: "/privacy", changeFrequency: "monthly" as const, priority: 0.4 },
    { path: "/contact", changeFrequency: "monthly" as const, priority: 0.4 },
  ].map((entry) => ({
    url: `${baseUrl}${entry.path}`,
    lastModified: new Date(),
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
