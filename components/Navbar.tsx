import Link from "next/link";

const links = [
  ["關於永才", "/about"],
  ["近期活動", "/events"],
  ["短影音", "/videos"],
  ["網誌", "/blog"],
  ["聯絡我們", "/contact"]
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-forest/5 bg-cream/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-forest text-lg font-black text-white">王</span>
          <span>
            <b className="block text-lg leading-none text-forest">王永才</b>
            <small className="text-xs font-medium tracking-wider text-leaf">用心服務・蓮結鄉里</small>
          </span>
        </Link>
        <div className="hidden items-center gap-7 md:flex">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="font-bold text-forest/75 transition hover:text-rose">
              {label}
            </Link>
          ))}
        </div>
        <Link href="/contact" className="rounded-full bg-forest px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-leaf md:hidden">
          找永才
        </Link>
      </nav>
    </header>
  );
}
