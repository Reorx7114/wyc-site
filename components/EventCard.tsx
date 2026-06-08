import Link from "next/link";
import { ContentItem, formatDate } from "@/lib/markdown";

export function EventCard({ event }: { event: ContentItem }) {
  return (
    <Link href={`/events/${event.slug}`} className="group overflow-hidden rounded-[2rem] bg-white shadow-soft transition hover:-translate-y-1">
      <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(0deg, rgba(36,72,58,.18), rgba(36,72,58,.02)), url("${event.coverImage}")` }} />
      <div className="p-6">
        <p className="text-sm font-bold text-rose">{formatDate(event.date)}</p>
        <h3 className="mt-2 text-xl font-black text-forest group-hover:text-rose">{event.title}</h3>
        <p className="mt-2 font-medium text-leaf">地點｜{event.location}</p>
        <p className="mt-3 line-clamp-2 leading-7 text-forest/65">{event.excerpt}</p>
      </div>
    </Link>
  );
}
