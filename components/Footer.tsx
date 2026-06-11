import Link from "next/link";
import { site } from "@/data/site";

export function Footer() {
  return (
    <footer className="bg-forest text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-3">
        <div>
          <p className="text-2xl font-black">王永才</p>
          <p className="mt-2 text-white/70">用心服務・蓮結鄉里</p>
        </div>
        <div className="space-y-2 text-white/75">
          <p>服務專線：{site.phone}</p>
          <p>服務處：{site.address}</p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-3 md:justify-end">
          <Link href="/about" className="whitespace-nowrap">關於永才</Link>
          <Link href="/events" className="whitespace-nowrap">近期活動</Link>
          <Link href="/service-request" className="whitespace-nowrap">服務申請</Link>
          <Link href="/contact" className="whitespace-nowrap">聯絡我們</Link>
          <Link href="/admin/login" className="whitespace-nowrap">後台登入</Link>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-sm text-white/50">
        © 2026 王永才・葫蘆里個人品牌網站
      </div>
    </footer>
  );
}
