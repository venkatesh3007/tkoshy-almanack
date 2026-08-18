import type { Metadata } from "next";
import Link from "next/link";
import SmallMasthead from "@/components/SmallMasthead";
import { getTopics } from "@/lib/posts";
import { SITE } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Topics",
  description: `Every topic in ${SITE.author}'s ${SITE.name} — browse essays on management, public policy, governance, capital markets, AI and more.`,
  alternates: { canonical: "/topics" },
};

export default async function TopicsPage() {
  const topics = await getTopics();
  return (
    <>
      <SmallMasthead />
      <div className="page-head">
        <h1>Topics</h1>
        <p className="sub">
          {topics.length} labels across the register — sorted by holdings
        </p>
      </div>
      <nav className="topic-cloud" aria-label="Topics">
        {topics.map((t) => (
          <Link key={t.slug} href={`/topics/${t.slug}`}>
            {t.label} <span className="cnt">({t.count})</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
