import type { MetadataRoute } from "next";
import { getAllPosts, getTopics } from "@/lib/posts";
import { SITE } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();
  const topics = await getTopics();
  const newest = posts[0]?.updated;

  return [
    {
      url: SITE.url,
      lastModified: newest ? new Date(newest) : new Date(0),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE.url}/topics`,
      lastModified: newest ? new Date(newest) : new Date(0),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    ...topics.map((t) => ({
      url: `${SITE.url}/topics/${t.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.4,
    })),
    ...posts.map((p) => ({
      url: `${SITE.url}${p.path}`,
      lastModified: new Date(p.updated),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
