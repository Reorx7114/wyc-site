import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getContentItem } from "@/lib/cms";
import { formatDate, markdownToHtml } from "@/lib/markdown";
import { site } from "@/data/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getContentItem("blog", slug);
  if (!post) return {};

  const title = `${post.title}｜王永才`;
  const description = post.excerpt || site.description;
  const image = post.coverImage || site.ogImage;

  return {
    title,
    description,
    alternates: {
      canonical: `/blog/${post.slug}`
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: `/blog/${post.slug}`,
      images: [{ url: image, alt: post.title }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image]
    }
  };
}

export default async function BlogDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getContentItem("blog", slug);
  if (!post) notFound();
  const html = await markdownToHtml(post.content);
  return (
    <article>
      <header className="bg-gradient-to-b from-pink-50 to-cream py-20">
        <div className="page-shell max-w-4xl text-center">
          <p className="font-bold text-rose">{post.category} ・ {formatDate(post.date)}</p>
          <h1 className="mt-5 text-4xl font-black leading-tight text-forest md:text-6xl">{post.title}</h1>
          <p className="mt-6 text-xl leading-9 text-forest/60">{post.excerpt}</p>
        </div>
      </header>
      <div className="page-shell py-12">
        <div className="mx-auto max-w-4xl">
          <div className="aspect-[16/8] rounded-[2.5rem] bg-cover bg-center shadow-soft" style={{ backgroundImage: `url("${post.coverImage}")` }} />
          <div className="prose-local mx-auto mt-10 max-w-3xl" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
      <div className="h-20" />
    </article>
  );
}
