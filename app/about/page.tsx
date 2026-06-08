import { BackHomeLink } from "@/components/BackHomeLink";
import { SectionTitle } from "@/components/SectionTitle";
import { profile } from "@/data/profile";

export default function AboutPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-pink-50 to-cream py-20 text-center md:py-28">
        <div className="page-shell">
          <BackHomeLink />
          <p className="font-bold tracking-[.2em] text-rose">關於王永才</p>
          <h1 className="mt-4 text-4xl font-black text-forest md:text-6xl">先做一個願意聽的人</h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl leading-9 text-forest/70">不是冷冰冰的履歷，而是一段關於陪伴、承擔與地方的故事。</p>
        </div>
      </section>
      <section className="section-space page-shell grid items-center gap-12 md:grid-cols-2">
        <div className="overflow-hidden rounded-[3rem] bg-gradient-to-br from-pink-50 to-blush shadow-soft">
          <div className="relative aspect-[4/5]">
            <img src="/images/wang-real-person-crop.png" alt="王永才真人照片" className="h-full w-full object-cover object-top" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-cream via-cream/85 to-transparent p-8 pt-24">
              <p className="text-2xl font-black leading-relaxed text-forest">「有生命歷練，<br />更懂得心疼人。」</p>
            </div>
          </div>
        </div>
        <div>
          <SectionTitle eyebrow="我是誰" title="我是王永才，也是葫蘆里的好厝邊" align="left" />
          {profile.story.map((paragraph) => <p key={paragraph} className="mb-5 text-lg leading-9 text-forest/70">{paragraph}</p>)}
        </div>
      </section>
      <section className="section-space bg-white">
        <div className="page-shell grid gap-12 md:grid-cols-2">
          <div>
            <SectionTitle eyebrow="為什麼站出來" title="希望每一個需要，都有人接住" align="left" />
            <p className="text-lg leading-9 text-forest/70">我站出來，不是因為選舉才看見地方，而是長期在服務中，看見許多事情還能做得更細、更快、更有人情味。</p>
          </div>
          <div className="rounded-[2rem] bg-cream p-8">
            <h3 className="text-2xl font-black text-forest">專業，是用來解決問題的</h3>
            <ul className="mt-6 space-y-4">
              {profile.experiences.map((item) => <li key={item} className="flex gap-3 text-lg leading-8 text-forest/70"><span className="font-black text-rose">✓</span>{item}</li>)}
            </ul>
          </div>
        </div>
      </section>
      <section className="section-space page-shell text-center">
        <blockquote className="mx-auto max-w-4xl text-3xl font-black leading-relaxed text-forest md:text-5xl">「不是為了選舉而出現，<br />而是希望葫蘆里更好。」</blockquote>
      </section>
    </>
  );
}
