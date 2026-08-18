import Link from "next/link";
import SmallMasthead from "@/components/SmallMasthead";

export default function NotFound() {
  return (
    <>
      <SmallMasthead />
      <div className="page-head">
        <h1>Entry not found</h1>
        <p className="sub">
          No such folio in the register. <Link href="/">Back to the register</Link>
        </p>
      </div>
    </>
  );
}
