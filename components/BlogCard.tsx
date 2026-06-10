import Link from "next/link";
import { ContentItem, formatDate } from "@/lib/markdown";

export function BlogCard({ post }: { post: ContentItem }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group overflow-hidden rounded-[2rem] bg-white shadow-soft transition hover:-translate-y-1">
      {post.coverImage && <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url("${post.coverImage}")` }} />}
      <div className="p-6">
        <div className="flex gap-3 text-sm font-bold text-rose">
          <span>{post.category}</span><span>・</span><span>{formatDate(post.date)}</span>
        </div>
        <h3 className="mt-3 text-xl font-black leading-8 text-forest group-hover:text-rose">{post.title}</h3>
        <p className="mt-3 line-clamp-2 leading-7 text-forest/65">{post.excerpt}</p>
      </div>
    </Link>
  );
}
