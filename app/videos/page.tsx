import { SectionTitle } from "@/components/SectionTitle";
import { VideoCard } from "@/components/VideoCard";
import { EmptyState } from "@/components/EmptyState";
import { getVideoItems } from "@/lib/cms";

export const dynamic = "force-dynamic";

const categories = ["全部", "銀髮長照", "都更危老", "婦幼安全", "AI里政", "毛孩友善", "地方日常"];

export default async function VideosPage() {
  const videos = await getVideoItems();
  return (
    <section className="section-space page-shell">
      <SectionTitle eyebrow="永才說給你聽" title="短影音" description="簡單說、認真做，快速掌握地方議題與日常服務。" />
      <div className="mb-10 flex flex-wrap justify-center gap-3">{categories.map((category) => <span key={category} className="rounded-full border border-forest/10 bg-white px-4 py-2 font-bold text-forest/70">{category}</span>)}</div>
      {videos.length ? <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">{videos.map((video) => <VideoCard key={video.slug} video={video} />)}</div> : <EmptyState title="短影音準備中" description="目前尚未發布影片，之後可從後台新增 YouTube 或 mp4 連結。" />}
    </section>
  );
}
