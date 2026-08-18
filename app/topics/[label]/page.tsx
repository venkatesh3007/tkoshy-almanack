import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SmallMasthead from "@/components/SmallMasthead";
import { getTopic, getTopics } from "@/lib/posts";
import { SITE } from "@/lib/site";

export const revalidate = 3600;
export const dynamicParams = true;

type Params = { label: string };

export async function generateStaticParams(): Promise<Params[]> {
  const topics = await getTopics();
  return topics.map((t) => ({ label: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { label } = await params;
  const data = await getTopic(label);
  if (!data) return {};
  return {
    title: `${data.topic.label} — essays`,
    description: `${data.topic.count} ${data.topic.count === 1 ? "essay" : "essays"} on ${data.topic.label} by ${SITE.author} in ${SITE.name}.`,
    alternates: { canonical: `/topics/${label}` },
  };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { label } = await params;
  const data = await getTopic(label);
  if (!data) notFound();
  const { topic, posts } = data;

  return (
    <>
      <SmallMasthead />
      <div className="page-head">
        <h1>{topic.label}</h1>
        <p className="sub">
          {posts.length} {posts.length === 1 ? "entry" : "entries"} ·{" "}
          <Link href="/topics">all topics</Link>
        </p>
      </div>
      <section style={{ marginTop: 20 }}>
        {posts.map((p) => (
          <div className="row" key={p.path}>
            <span className="ser">{String(p.serial).padStart(3, "0")}</span>
            <span className="d">{p.published.slice(0, 10)}</span>
            <span>
              <Link href={p.path}>{p.title}</Link>
            </span>
            <span className="lb">{p.labels.join(", ")}</span>
          </div>
        ))}
      </section>
    </>
  );
}
