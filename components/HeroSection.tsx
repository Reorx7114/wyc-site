import Link from "next/link";

function FigureCard({ src, alt, tone, lift = false }: { src: string; alt: string; tone: "green" | "pink"; lift?: boolean }) {
  const background = tone === "green" ? "from-emerald-100 to-emerald-50" : "from-pink-100 to-pink-50";
  return (
    <div className={`relative mx-auto flex aspect-[0.78] h-[520px] w-[360px] max-w-full items-end overflow-hidden rounded-t-[12rem] bg-gradient-to-b ${background} ${lift ? "-translate-y-8" : ""}`}>
      <img src={src} alt={alt} className="relative z-10 h-full w-full object-cover object-top" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-20 bg-gradient-to-t from-cream to-transparent" />
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative min-h-[740px] overflow-hidden bg-gradient-to-br from-cream via-white to-pink-50">
      <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-blush/40 blur-3xl" />
      <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-emerald-100/70 blur-3xl" />
      <img
        src="/images/chongyang-bridge.png"
        alt="重陽大橋手繪插畫"
        className="pointer-events-none absolute bottom-20 left-1/2 w-[1120px] max-w-none -translate-x-1/2 opacity-35"
      />
      <div className="relative mx-auto grid min-h-[740px] max-w-7xl items-end gap-8 px-5 pt-14 md:grid-cols-[1fr_1.35fr_1fr]">
        <div className="hidden -translate-x-8 pb-0 md:block lg:-translate-x-12">
          <FigureCard src="/images/wang-real-person-crop.png" alt="王永才真人照片" tone="green" lift />
        </div>
        <div className="z-10 self-center pb-28 text-center md:pb-40">
          <p className="mb-5 font-bold tracking-[0.25em] text-rose">葫蘆里的好厝邊</p>
          <h1 className="text-7xl font-black tracking-tight text-forest md:text-8xl lg:text-9xl">王永才</h1>
          <p className="mt-5 text-2xl font-black text-rose md:text-3xl">用心服務・蓮結鄉里</p>
          <p className="mx-auto mt-6 max-w-xl text-lg font-medium leading-8 text-forest/70">
            傾聽里民的聲音，解決里民的問題，<br className="hidden md:block" />一起建設更好的葫蘆里
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link href="/about" className="rounded-full bg-forest px-7 py-4 font-bold text-white shadow-soft transition hover:-translate-y-1">
              認識王永才
            </Link>
            <Link href="/events" className="rounded-full border-2 border-forest/15 bg-white px-7 py-4 font-bold text-forest transition hover:-translate-y-1">
              近期活動
            </Link>
          </div>
        </div>
        <div className="hidden translate-x-8 pb-0 md:block lg:translate-x-12">
          <FigureCard src="/images/wang-chibi-person-crop.png" alt="王永才 Q 版娃娃" tone="pink" />
        </div>
      </div>
    </section>
  );
}
