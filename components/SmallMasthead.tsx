import Link from "next/link";
import { SITE } from "@/lib/site";

export default function SmallMasthead() {
  return (
    <header className="masthead">
      <div className="eyebrow">{SITE.author}&rsquo;s ledger of essays</div>
      <p className="site-title-small">
        <Link href="/">{SITE.name}</Link>
      </p>
    </header>
  );
}
