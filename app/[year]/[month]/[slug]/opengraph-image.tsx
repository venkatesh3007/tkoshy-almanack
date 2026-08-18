import { ImageResponse } from "next/og";
import { getPost } from "@/lib/posts";
import { SITE } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Article card";

const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

export default async function OgImage({
  params,
}: {
  params: Promise<{ year: string; month: string; slug: string }>;
}) {
  const { year, month, slug } = await params;
  const post = await getPost(year, month, slug);
  const title = post?.title || SITE.name;
  const date = post
    ? `${post.published.slice(8, 10)} ${MONTHS[parseInt(post.published.slice(5, 7), 10) - 1]} ${post.published.slice(0, 4)}`
    : "";
  const labels = post?.labels.slice(0, 3).join(" · ").toUpperCase() || "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#EDEFE6",
          borderLeft: "24px solid #8E2B26",
          padding: "70px 80px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderBottom: "4px solid #232E3B",
            paddingBottom: 28,
          }}
        >
          <div
            style={{
              fontSize: 26,
              letterSpacing: 8,
              color: "#6A7263",
              textTransform: "uppercase",
            }}
          >
            {SITE.name}
          </div>
        </div>
        <div
          style={{
            fontSize: title.length > 70 ? 52 : 64,
            lineHeight: 1.15,
            color: "#232E3B",
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
            color: "#6A7263",
            letterSpacing: 3,
          }}
        >
          <div style={{ display: "flex" }}>{date}</div>
          <div style={{ display: "flex", color: "#8E2B26" }}>{labels}</div>
        </div>
      </div>
    ),
    size
  );
}
