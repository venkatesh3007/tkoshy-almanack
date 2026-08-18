import { cache } from "react";
import sanitizeHtml from "sanitize-html";
import { SITE } from "./site";

export interface Post {
  id: string;
  serial: number; // chronological, 1 = first post ever
  title: string;
  year: string; // "2026"
  month: string; // "08"
  slug: string;
  path: string; // "/2026/08/slug"
  sourceUrl: string; // original Blogger permalink
  published: string; // ISO
  updated: string; // ISO
  labels: string[];
  html: string; // sanitized full content
  text: string; // plain text of content
  excerpt: string;
  readingMinutes: number;
  thumbnail: string | null; // large variant, for OG/social
}

const PAGE_SIZE = 150;
const REVALIDATE_SECONDS = 3600;

/* ---------- helpers ---------- */

function stripText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function makeExcerpt(text: string, max = 200): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ")) + "…";
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "untitled";
}

function upscaleThumb(url: string): string {
  // Blogger thumbnails carry a size segment like /s72-w445-h210-c/ — swap for a large one.
  return url.replace(/\/(s|w|h)\d+(-[a-z0-9-]+)?\//i, "/s1600/");
}

function sanitize(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "b", "strong", "i", "em", "u", "s", "ul", "ol", "li",
      "blockquote", "h1", "h2", "h3", "h4", "h5", "h6", "a", "img",
      "table", "thead", "tbody", "tr", "td", "th", "span", "div", "hr",
      "sub", "sup", "figure", "figcaption", "center", "pre", "code",
    ],
    allowedAttributes: {
      a: ["href"],
      img: ["src", "alt", "loading"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href || "";
        const out: Record<string, string> = { href };
        if (/^https?:/i.test(href)) {
          out.target = "_blank";
          out.rel = "noopener";
        }
        return { tagName, attribs: out };
      },
      img: (tagName, attribs) => {
        let src = attribs.src || "";
        if (src.startsWith("//")) src = "https:" + src;
        return {
          tagName,
          attribs: { src, alt: attribs.alt || "", loading: "lazy" },
        };
      },
    },
    exclusiveFilter: (frame) =>
      frame.tag === "img" && !/^https?:/i.test(frame.attribs.src || ""),
  });
}

/* ---------- feed fetching ---------- */

/* Blogger Atom-as-JSON entry, loosely typed */
interface FeedEntry {
  id?: { $t?: string };
  published?: { $t?: string };
  updated?: { $t?: string };
  title?: { $t?: string };
  content?: { $t?: string };
  summary?: { $t?: string };
  link?: { rel?: string; href?: string }[];
  category?: { term?: string }[];
  "media$thumbnail"?: { url?: string };
}

async function fetchFeedPage(startIndex: number): Promise<{
  total: number;
  entries: FeedEntry[];
}> {
  const url = `${SITE.feedSource}?alt=json&max-results=${PAGE_SIZE}&start-index=${startIndex}`;
  const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) throw new Error(`Blogger feed returned HTTP ${res.status}`);
  const data = await res.json();
  const feed = data.feed || {};
  return {
    total: parseInt(feed["openSearch$totalResults"]?.$t || "0", 10),
    entries: feed.entry || [],
  };
}

function entryToPost(e: FeedEntry): Post | null {
  const published = e.published?.$t || "";
  if (!published) return null;

  const alt = (e.link || []).find((l) => l.rel === "alternate");
  const sourceUrl = alt?.href || "";

  let year = published.slice(0, 4);
  let month = published.slice(5, 7);
  let slug = "";
  const m = sourceUrl.match(/\/(\d{4})\/(\d{2})\/([^/]+)\.html$/);
  if (m) {
    year = m[1];
    month = m[2];
    slug = m[3];
  }

  const title =
    (e.title?.$t || "").replace(/\s+/g, " ").trim() || "(untitled)";
  if (!slug) slug = slugify(title);

  const rawHtml = e.content?.$t || e.summary?.$t || "";
  const html = sanitize(rawHtml);
  const text = stripText(html);
  const idMatch = (e.id?.$t || "").match(/post-(\d+)/);
  const thumb = e["media$thumbnail"]?.url;

  return {
    id: idMatch ? idMatch[1] : `${year}${month}-${slug}`,
    serial: 0, // assigned after sorting
    title,
    year,
    month,
    slug,
    path: `/${year}/${month}/${slug}`,
    sourceUrl,
    published,
    updated: e.updated?.$t || published,
    labels: (e.category || [])
      .map((c) => (c.term || "").replace(/\s+/g, " ").trim())
      .filter(Boolean),
    html,
    text,
    excerpt: makeExcerpt(text),
    readingMinutes: Math.max(1, Math.round(text.split(/\s+/).length / 220)),
    thumbnail: thumb ? upscaleThumb(thumb) : null,
  };
}

/**
 * All posts, newest first. Cached per render pass; the underlying fetch is
 * ISR-cached for an hour, so new Blogger posts appear without a redeploy.
 */
export const getAllPosts = cache(async (): Promise<Post[]> => {
  const posts: Post[] = [];
  let start = 1;
  for (;;) {
    const { total, entries } = await fetchFeedPage(start);
    for (const e of entries) {
      const p = entryToPost(e);
      if (p) posts.push(p);
    }
    if (entries.length === 0 || posts.length >= total) break;
    start += PAGE_SIZE;
  }
  posts.sort((a, b) => (a.published < b.published ? 1 : -1));
  const n = posts.length;
  posts.forEach((p, i) => (p.serial = n - i));
  return posts;
});

export async function getPost(
  year: string,
  month: string,
  slug: string
): Promise<Post | undefined> {
  const posts = await getAllPosts();
  return posts.find(
    (p) => p.year === year && p.month === month && p.slug === slug
  );
}

/* ---------- labels/topics ---------- */

export function labelSlug(label: string): string {
  return slugify(label);
}

export interface Topic {
  label: string;
  slug: string;
  count: number;
}

export async function getTopics(): Promise<Topic[]> {
  const posts = await getAllPosts();
  const map = new Map<string, Topic>();
  for (const p of posts) {
    for (const label of p.labels) {
      const slug = labelSlug(label);
      const existing = map.get(slug);
      if (existing) existing.count++;
      else map.set(slug, { label, slug, count: 1 });
    }
  }
  return [...map.values()].sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label)
  );
}

export async function getTopic(
  slug: string
): Promise<{ topic: Topic; posts: Post[] } | undefined> {
  const topics = await getTopics();
  const topic = topics.find((t) => t.slug === slug);
  if (!topic) return undefined;
  const posts = (await getAllPosts()).filter((p) =>
    p.labels.some((l) => labelSlug(l) === slug)
  );
  return { topic, posts };
}
