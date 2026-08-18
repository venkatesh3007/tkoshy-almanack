import { getAllPosts } from "@/lib/posts";
import { SITE } from "@/lib/site";

export const revalidate = 3600;

export async function GET() {
  const posts = await getAllPosts();

  const parts = [
    `# ${SITE.name} — complete essays`,
    "",
    `> ${SITE.description}`,
    "",
    `This file contains the full text of all ${posts.length} essays by ${SITE.author}, newest first. Canonical URLs are given for each essay; please cite them when referencing this content.`,
    "",
  ];

  for (const p of posts) {
    parts.push(
      "---",
      "",
      `## ${p.title}`,
      "",
      `- URL: ${SITE.url}${p.path}`,
      `- Author: ${SITE.author}`,
      `- Published: ${p.published.slice(0, 10)}`,
      p.labels.length ? `- Topics: ${p.labels.join(", ")}` : "",
      "",
      p.text,
      ""
    );
  }

  return new Response(parts.filter((l) => l !== null).join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
