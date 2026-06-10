import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getContentItem } from "@/lib/cms";
import { formatDate, markdownToHtml } from "@/lib/markdown";
import { site } from "@/data/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = await getContentItem("events", slug);
  if (!event) return {};

  const title = `${event.title}｜王永才活動紀錄`;
  const description = event.excerpt || site.description;
  const image = event.coverImage || site.ogImage;

  return {
    title,
    description,
    alternates: {
      canonical: `/events/${event.slug}`
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: `/events/${event.slug}`,
      images: [{ url: image, alt: event.title }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image]
    }
  };
}

export default async function EventDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getContentItem("events", slug);
  if (!event) notFound();
  const html = await markdownToHtml(event.content);
  return (
    <article>
      {event.coverImage && <div className="h-[45vh] min-h-80 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(rgba(36,72,58,.2),rgba(36,72,58,.35)),url("${event.coverImage}")` }} />}
      <div className={`page-shell relative ${event.coverImage ? "-mt-16" : "pt-12"}`}>
        <div className="mx-auto max-w-4xl rounded-[2.5rem] bg-white p-7 shadow-soft md:p-14">
          <p className="font-bold text-rose">{formatDate(event.date)} ・ {event.location}</p>
          <h1 className="mt-4 text-3xl font-black leading-tight text-forest md:text-5xl">{event.title}</h1>
          <p className="mt-5 text-xl leading-8 text-forest/60">{event.excerpt}</p>
          <div className="prose-local mt-10 border-t border-forest/10 pt-5" dangerouslySetInnerHTML={{ __html: html }} />
          {(event.endImages?.length ?? 0) > 0 && (
            <div className="mt-10 grid gap-8">
              {(event.endImages ?? []).map((image, index) => <img key={`${image}-${index}`} src={image} alt={`${event.title} 照片 ${index + 1}`} className="h-auto w-full rounded-[2rem] shadow-soft" />)}
            </div>
          )}
        </div>
      </div>
      <div className="h-24" />
    </article>
  );
}
