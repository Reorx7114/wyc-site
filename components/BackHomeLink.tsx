import Link from "next/link";

export function BackHomeLink() {
  return (
    <Link
      href="/"
      className="mb-6 inline-flex items-center rounded-full border border-forest/10 bg-white px-5 py-2 text-sm font-bold text-forest/70 shadow-soft transition hover:border-rose/30 hover:text-rose"
    >
      ← 回首頁
    </Link>
  );
}
