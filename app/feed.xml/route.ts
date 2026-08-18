import { getAllPosts } from "@/lib/posts";
import { SITE } from "@/lib/site";

export const revalidate = 3600;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const posts = (await getAllPosts()).slice(0, 30);
  const items = posts
    .map(
      (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${SITE.url}${p.path}</link>
      <guid isPermaLink="true">${SITE.url}${p.path}</guid>
      <pubDate>${new Date(p.published).toUTCString()}</pubDate>
      ${p.labels.map((l) => `<category>${esc(l)}</category>`).join("\n      ")}
      <description>${esc(p.excerpt)}</description>
    </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE.name)} — ${esc(SITE.author)}'s Blog</title>
    <link>${SITE.url}</link>
    <atom:link href="${SITE.url}/feed.xml" rel="self" type="application/rss+xml"/>
    <description>${esc(SITE.description)}</description>
    <language>en</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
