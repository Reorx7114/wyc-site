import { Video } from "@/data/videos";

export function VideoCard({ video }: { video: Video }) {
  return (
    <article className="overflow-hidden rounded-[2rem] bg-white shadow-soft">
      <div className="aspect-video bg-forest/10">
        {video.type === "youtube" ? (
          <iframe className="h-full w-full" src={video.src} title={video.title} loading="lazy" allowFullScreen />
        ) : (
          <video className="h-full w-full object-cover" src={video.src} controls />
        )}
      </div>
      <div className="p-6">
        <span className="rounded-full bg-blush/60 px-3 py-1 text-sm font-bold text-forest">{video.category}</span>
        <h3 className="mt-4 text-xl font-black text-forest">{video.title}</h3>
        <p className="mt-2 leading-7 text-forest/65">{video.description}</p>
      </div>
    </article>
  );
}
