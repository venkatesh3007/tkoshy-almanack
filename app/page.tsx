import Link from "next/link";
import Register from "@/components/Register";
import { getAllPosts, labelSlug } from "@/lib/posts";
import { SITE } from "@/lib/site";

export const revalidate = 3600;

export default async function HomePage() {
  const posts = await getAllPosts();
  const newest = posts[0];
  const oldest = posts[posts.length - 1];
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric" });

  const items = posts.map((p) => ({
    serial: p.serial,
    path: p.path,
    date: p.published.slice(0, 10),
    title: p.title,
    labels: p.labels,
    labelSlugs: p.labels.map(labelSlug),
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${SITE.url}/#blog`,
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    inLanguage: "en",
    author: {
      "@type": "Person",
      "@id": `${SITE.url}/#author`,
      name: SITE.author,
      url: SITE.url,
    },
    blogPost: posts.slice(0, 10).map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${SITE.url}${p.path}`,
      datePublished: p.published,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="masthead">
        <div className="eyebrow">
          The Complete Register · {oldest ? fmt(oldest.published) : ""} –{" "}
          {newest ? fmt(newest.published) : ""}
        </div>
        <h1 className="site-title">
          <Link href="/">{SITE.name}</Link>
        </h1>
        <p className="standfirst">
          Every entry in {SITE.author}&rsquo;s ledger of essays — management,
          public policy, capital markets, open networks —{" "}
          <em>updated from the publisher&rsquo;s feed</em> and readable in full
          below.
        </p>
        <nav className="mastnav" aria-label="Site">
          <Link href="/topics">Browse by topic</Link>
          <a href="/feed.xml">RSS feed</a>
        </nav>
      </header>
      <Register items={items} />
    </>
  );
}
