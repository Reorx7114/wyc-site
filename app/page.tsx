import Link from "next/link";
import { HeroSection } from "@/components/HeroSection";
import { ValueCard } from "@/components/ValueCard";
import { EventCard } from "@/components/EventCard";
import { BlogCard } from "@/components/BlogCard";
import { VideoCard } from "@/components/VideoCard";
import { SectionTitle } from "@/components/SectionTitle";
import { EmptyState } from "@/components/EmptyState";
import { getContentItems, getVideoItems } from "@/lib/cms";

export const dynamic = "force-dynamic";

const values = [
  ["♥", "用心", "真心服務里民"],
  ["◎", "專業", "推動里政發展"],
  ["☀", "誠懇", "溝通零距離"],
  ["✓", "效率", "行動力不打折"],
  ["⌂", "關懷", "打造溫暖家園"]
];

export default async function Home() {
  const events = (await getContentItems("events")).slice(0, 3);
  const posts = (await getContentItems("blog")).slice(0, 3);
  const videos = (await getVideoItems()).slice(0, 3);

  return (
    <>
      <HeroSection />
      <section className="section-space page-shell">
        <SectionTitle eyebrow="永才的初心" title="把每一件小事，放在心上" description="服務不是選舉時才出現，而是每一天都願意傾聽、願意陪伴，也願意採取行動。" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {values.map(([icon, title, description]) => <ValueCard key={title} icon={icon} title={title} description={description} />)}
        </div>
      </section>
      <section className="section-space bg-pink-50/70">
        <div className="page-shell">
          <SectionTitle eyebrow="一起見面" title="近期活動" description="來坐坐、聊聊，讓我們一起把關心變成改變。" />
          {events.length ? <div className="grid gap-7 md:grid-cols-3">{events.map((event) => <EventCard key={event.slug} event={event} />)}</div> : <EmptyState title="活動整理中" description="近期活動紀錄會陸續更新，歡迎稍後再回來看看。" />}
          <MoreLink href="/events" label="看看所有活動" />
        </div>
      </section>
      <section className="section-space page-shell">
        <SectionTitle eyebrow="永才說給你聽" title="短影音" description="用幾分鐘，聊聊生活裡真正重要的事。" />
        {videos.length ? <div className="grid gap-7 md:grid-cols-3">{videos.map((video) => <VideoCard key={video.slug} video={video} />)}</div> : <EmptyState title="短影音準備中" description="影片連結更新後，這裡會自動顯示最新內容。" />}
        <MoreLink href="/videos" label="觀看更多影音" />
      </section>
      <section className="section-space bg-white">
        <div className="page-shell">
          <SectionTitle eyebrow="永才的話" title="最新文章" description="記下地方的故事，也分享我們可以一起努力的方向。" />
          {posts.length ? <div className="grid gap-7 md:grid-cols-3">{posts.map((post) => <BlogCard key={post.slug} post={post} />)}</div> : <EmptyState title="文章準備中" description="最新消息與長文內容會在整理後放到這裡。" />}
          <MoreLink href="/blog" label="閱讀所有文章" />
        </div>
      </section>
    </>
  );
}

function MoreLink({ href, label }: { href: string; label: string }) {
  return <div className="mt-10 text-center"><Link href={href} className="inline-block rounded-full border-2 border-forest/15 bg-white px-7 py-3 font-bold text-forest transition hover:-translate-y-1 hover:border-rose">{label} →</Link></div>;
}
