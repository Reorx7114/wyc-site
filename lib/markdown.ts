import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

export type ContentType = "blog" | "events";

export type ContentItem = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  coverImage: string;
  category?: string;
  location?: string;
  content: string;
};

const contentRoot = path.join(process.cwd(), "content");

export function getAllContent(type: ContentType): ContentItem[] {
  const directory = path.join(contentRoot, type);
  if (!fs.existsSync(directory)) return [];

  return fs
    .readdirSync(directory)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(directory, file), "utf8");
      const { data, content } = matter(raw);
      return {
        slug,
        title: String(data.title ?? ""),
        date: String(data.date ?? ""),
        excerpt: String(data.excerpt ?? ""),
        coverImage: String(data.coverImage ?? ""),
        category: data.category ? String(data.category) : undefined,
        location: data.location ? String(data.location) : undefined,
        content
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getContentBySlug(type: ContentType, slug: string) {
  return getAllContent(type).find((item) => item.slug === slug);
}

export async function markdownToHtml(markdown: string) {
  const result = await remark().use(html).process(markdown);
  return result.toString();
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(new Date(`${date}T00:00:00`));
}
