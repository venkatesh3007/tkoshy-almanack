import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SmallMasthead from "@/components/SmallMasthead";
import { getAllPosts, getPost, labelSlug } from "@/lib/posts";
import { SITE } from "@/lib/site";

export const revalidate = 3600;
export const dynamicParams = true;

type Params = { year: string; month: string; slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const posts = await getAllPosts();
  return posts.map((p) => ({ year: p.year, month: p.month, slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { year, month, slug } = await params;
  const post = await getPost(year, month, slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: post.path },
    keywords: post.labels,
    openGraph: {
      type: "article",
      url: `${SITE.url}${post.path}`,
      siteName: SITE.name,
      title: post.title,
      description: post.excerpt,
      publishedTime: post.published,
      modifiedTime: post.updated,
      authors: [SITE.author],
      tags: post.labels,
      ...(post.thumbnail ? { images: [{ url: post.thumbnail }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];
function fmtDate(iso: string): string {
  return `${iso.slice(8, 10)} ${MONTHS[parseInt(iso.slice(5, 7), 10) - 1]} ${iso.slice(0, 4)}`;
}

export default async function PostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { year, month, slug } = await params;
  const post = await getPost(year, month, slug);
  if (!post) notFound();

  const posts = await getAllPosts();
  const i = posts.findIndex((p) => p.id === post.id);
  const newer = posts[i - 1];
  const older = posts[i + 1];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${SITE.url}${post.path}#article`,
    headline: post.title,
    url: `${SITE.url}${post.path}`,
    datePublished: post.published,
    dateModified: post.updated,
    inLanguage: "en",
    wordCount: post.text.split(/\s+/).length,
    keywords: post.labels.join(", "),
    description: post.excerpt,
    ...(post.thumbnail ? { image: post.thumbnail } : {}),
    author: {
      "@type": "Person",
      "@id": `${SITE.url}/#author`,
      name: SITE.author,
      url: SITE.url,
    },
    publisher: {
      "@type": "Person",
      "@id": `${SITE.url}/#author`,
      name: SITE.author,
    },
    isPartOf: { "@type": "Blog", "@id": `${SITE.url}/#blog`, name: SITE.name },
    mainEntityOfPage: `${SITE.url}${post.path}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SmallMasthead />
      <article>
        <div className="rnav">
          <Link href="/">&larr; Back to the register</Link>
          <span className="fol">
            FOLIO {String(post.serial).padStart(3, "0")} / {posts.length} ·{" "}
            {post.readingMinutes} MIN READ
          </span>
        </div>
        <div className="ahead">
          <div className="aeyebrow">
            <time dateTime={post.published}>{fmtDate(post.published)}</time>
            {post.labels.length > 0 && (
              <>
                {" · "}
                {post.labels.map((l, k) => (
                  <span key={l}>
                    {k > 0 && " · "}
                    <Link href={`/topics/${labelSlug(l)}`}>{l.toUpperCase()}</Link>
                  </span>
                ))}
              </>
            )}
          </div>
          <h1>{post.title}</h1>
          {post.sourceUrl && (
            <div className="srcline">
              First published on{" "}
              <a href={post.sourceUrl} target="_blank" rel="noopener">
                the original blog ↗
              </a>
            </div>
          )}
        </div>
        {post.html ? (
          <div
            className="abody"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
        ) : (
          <div className="missing">
            FULL TEXT NOT INCLUDED IN THE FEED FOR THIS ENTRY — use the link
            above to read it on the original blog.
          </div>
        )}
        <nav className="afoot" aria-label="Adjacent entries">
          {older ? (
            <Link href={older.path}>
              <span className="dir">&larr; OLDER · {fmtDate(older.published)}</span>
              {older.title}
            </Link>
          ) : (
            <span />
          )}
          {newer ? (
            <Link href={newer.path} className="next">
              <span className="dir">NEWER · {fmtDate(newer.published)} &rarr;</span>
              {newer.title}
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </article>
    </>
  );
}
