import { BackHomeLink } from "@/components/BackHomeLink";
import { BlogCard } from "@/components/BlogCard";
import { EmptyState } from "@/components/EmptyState";
import { SectionTitle } from "@/components/SectionTitle";
import { getContentItems } from "@/lib/cms";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getContentItems("blog");
  return (
    <section className="section-space page-shell">
      <div className="text-center"><BackHomeLink /></div>
      <SectionTitle eyebrow="永才的話" title="網誌文章" description="長一點的文字，慢慢說地方的故事，也好好說我們相信的事。" />
      {posts.length ? <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">{posts.map((post) => <BlogCard key={post.slug} post={post} />)}</div> : <EmptyState title="文章準備中" description="目前尚未發布文章，之後可從後台新增最新消息或長文。" />}
    </section>
  );
}
