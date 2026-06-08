import Link from "next/link";

export default function NotFound() {
  return <section className="page-shell grid min-h-[60vh] place-items-center py-20 text-center"><div><p className="text-6xl font-black text-rose">404</p><h1 className="mt-4 text-3xl font-black text-forest">這個頁面暫時找不到</h1><Link href="/" className="mt-8 inline-block rounded-full bg-forest px-6 py-3 font-bold text-white">回到首頁</Link></div></section>;
}
