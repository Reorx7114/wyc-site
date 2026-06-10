"use client";

import { useState } from "react";
import { Video } from "@/data/videos";
import { getYouTubeDisplayData } from "@/lib/youtube";

export function VideoCard({ video }: { video: Video }) {
  const youtube = video.type === "youtube" ? getYouTubeDisplayData(video.src) : null;
  const [playing, setPlaying] = useState(false);

  return (
    <article className="overflow-hidden rounded-[2rem] bg-white shadow-soft">
      <div className="aspect-video bg-forest/10">
        {video.type === "youtube" && youtube && playing ? (
          <iframe
            className="h-full w-full"
            src={youtube.embedUrl}
            title={video.title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : video.type === "youtube" && youtube ? (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="relative flex h-full w-full items-center justify-center bg-cover bg-center"
            style={{ backgroundImage: `linear-gradient(rgba(36,72,58,.15),rgba(36,72,58,.4)),url("${youtube.thumbnailUrl}")` }}
            aria-label={`播放 ${video.title}`}
          >
            <span className="rounded-full bg-white/95 px-6 py-3 font-bold text-forest shadow-soft">播放影片</span>
          </button>
        ) : video.type === "youtube" ? (
          <div className="flex h-full items-center justify-center bg-forest/5 p-6 text-center font-bold text-forest/60">
            影片網址尚未設定完成
          </div>
        ) : (
          <video className="h-full w-full object-cover" src={video.src} controls />
        )}
      </div>
      <div className="p-6">
        <span className="rounded-full bg-blush/60 px-3 py-1 text-sm font-bold text-forest">{video.category}</span>
        <h3 className="mt-4 text-xl font-black text-forest">{video.title}</h3>
        <p className="mt-2 leading-7 text-forest/65">{video.description}</p>
        {youtube && (
          <a href={youtube.watchUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full border border-forest/15 px-5 py-3 font-bold text-forest hover:border-rose hover:text-rose">
            前往 YouTube 觀看
          </a>
        )}
      </div>
    </article>
  );
}
