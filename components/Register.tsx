"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export interface RegisterItem {
  serial: number;
  path: string;
  date: string; // YYYY-MM-DD
  title: string;
  labels: string[];
  labelSlugs: string[];
}

export default function Register({ items }: { items: RegisterItem[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const f = q.trim().toLowerCase();
    if (!f) return items;
    return items.filter(
      (p) =>
        p.title.toLowerCase().includes(f) ||
        p.labels.join(", ").toLowerCase().includes(f)
    );
  }, [q, items]);

  const byYear = useMemo(() => {
    const map = new Map<string, RegisterItem[]>();
    for (const p of filtered) {
      const y = p.date.slice(0, 4);
      const arr = map.get(y);
      if (arr) arr.push(p);
      else map.set(y, [p]);
    }
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filtered]);

  const totals = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of items) {
      const y = p.date.slice(0, 4);
      map.set(y, (map.get(y) || 0) + 1);
    }
    return map;
  }, [items]);

  const spine = useMemo(() => {
    const years = [...totals.keys()].map(Number);
    const min = Math.min(...years);
    const max = Math.max(...years);
    const maxCount = Math.max(...totals.values());
    const out: { year: number; count: number }[] = [];
    for (let y = min; y <= max; y++)
      out.push({ year: y, count: totals.get(String(y)) || 0 });
    return { out, maxCount };
  }, [totals]);

  return (
    <>
      <section className="spine" aria-label="Posts per year">
        <div className="spine-head">
          <span className="t">Holdings by year · click a year to jump</span>
          <span className="count">{items.length} entries in the register</span>
        </div>
        <div className="bars">
          {spine.out.map(({ year, count }) => (
            <a
              key={year}
              className="yr"
              href={`#y${year}`}
              aria-label={`${year}: ${count} ${count === 1 ? "entry" : "entries"}`}
            >
              <span className="n">{count || ""}</span>
              <span
                className="exp"
                style={{
                  height: `${count ? 6 + Math.round((count / spine.maxCount) * 74) : 3}px`,
                }}
              >
                <span className="got" />
              </span>
              <span className="lab">’{String(year).slice(2)}</span>
            </a>
          ))}
        </div>
      </section>

      <div className="tools">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search titles and labels"
          aria-label="Search entries"
        />
      </div>

      <div>
        {byYear.map(([year, posts]) => (
          <section key={year} aria-label={`Entries from ${year}`}>
            <div className="yhead" id={`y${year}`}>
              <span className="y">{year}</span>
              <span className="meta">
                {q
                  ? `${posts.length} matching`
                  : `${posts.length} ${posts.length === 1 ? "entry" : "entries"}`}
              </span>
            </div>
            {posts.map((p) => (
              <div className="row" key={p.path}>
                <span className="ser">
                  {String(p.serial).padStart(3, "0")}
                </span>
                <span className="d">{p.date.slice(5).replace("-", " · ")}</span>
                <span>
                  <Link href={p.path}>{p.title}</Link>
                </span>
                <span className="lb">
                  {p.labels.map((l, i) => (
                    <span key={l}>
                      {i > 0 && ", "}
                      <Link href={`/topics/${p.labelSlugs[i]}`}>{l}</Link>
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </section>
        ))}
        {filtered.length === 0 && (
          <p className="empty-note">
            Nothing in the register matches that search.
          </p>
        )}
      </div>
    </>
  );
}
