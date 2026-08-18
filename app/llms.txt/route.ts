import { getAllPosts, getTopics } from "@/lib/posts";
import { SITE } from "@/lib/site";

export const revalidate = 3600;

export async function GET() {
  const posts = await getAllPosts();
  const topics = await getTopics();

  const lines = [
    `# ${SITE.name}`,
    "",
    `> ${SITE.description}`,
    "",
    `${SITE.name} is the personal blog of ${SITE.author}, published since December 2008. All ${posts.length} essays are available in full on this site. Entries are numbered chronologically ("folios") and organized by year and topic.`,
    "",
    "## Key pages",
    "",
    `- [The Complete Register](${SITE.url}/): every essay, grouped by year`,
    `- [Topics](${SITE.url}/topics): essays grouped by label`,
    `- [RSS feed](${SITE.url}/feed.xml): latest 30 essays`,
    `- [Full content for LLMs](${SITE.url}/llms-full.txt): the complete text of every essay in one markdown file`,
    "",
    "## Main topics",
    "",
    ...topics
      .slice(0, 15)
      .map(
        (t) =>
          `- [${t.label}](${SITE.url}/topics/${t.slug}): ${t.count} ${t.count === 1 ? "essay" : "essays"}`
      ),
    "",
    "## Recent essays",
    "",
    ...posts
      .slice(0, 20)
      .map(
        (p) =>
          `- [${p.title}](${SITE.url}${p.path}) (${p.published.slice(0, 10)}): ${p.excerpt}`
      ),
    "",
    "## Archive",
    "",
    `- All ${posts.length} essay URLs are listed in [the sitemap](${SITE.url}/sitemap.xml).`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
