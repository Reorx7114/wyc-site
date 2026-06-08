import { videos as localVideos, type Video } from "@/data/videos";
import { type ContentItem, getAllContent, type ContentType } from "@/lib/markdown";

type SupabaseContentRow = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  cover_image: string;
  category?: string | null;
  location?: string | null;
  content: string;
};

type SupabaseVideoRow = {
  slug: string;
  title: string;
  description: string;
  category: Video["category"];
  type: Video["type"];
  src: string;
  date: string;
};

export type SupabaseResult<T> = {
  data: T | null;
  error: string | null;
  status: number | null;
  endpoint: string | null;
};

const tableByType: Record<ContentType, string> = {
  blog: "blog_posts",
  events: "events"
};

function supabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

async function supabaseRequest<T>(path: string, init?: RequestInit): Promise<SupabaseResult<T>> {
  const config = supabaseConfig();
  if (!config) {
    return {
      data: null,
      error: "Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      status: null,
      endpoint: null
    };
  }

  const endpoint = `${config.url}/rest/v1/${path}`;

  try {
    const response = await fetch(endpoint, {
      ...init,
      cache: "no-store",
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
        "Content-Type": "application/json",
        ...(init?.headers ?? {})
      }
    });

    const text = await response.text();
    let parsed: unknown = null;
    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = text;
      }
    }

    if (!response.ok) {
      const message = typeof parsed === "string" ? parsed : JSON.stringify(parsed);
      return {
        data: null,
        error: `Supabase request failed (${response.status} ${response.statusText}): ${message}`,
        status: response.status,
        endpoint
      };
    }

    return {
      data: parsed as T,
      error: null,
      status: response.status,
      endpoint
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : String(error),
      status: null,
      endpoint
    };
  }
}

async function supabaseFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  const result = await supabaseRequest<T>(path, init);
  if (result.error) console.error(result.error);
  return result.data;
}

function fromContentRow(row: SupabaseContentRow): ContentItem {
  return {
    slug: row.slug,
    title: row.title,
    date: row.date,
    excerpt: row.excerpt,
    coverImage: row.cover_image,
    category: row.category ?? undefined,
    location: row.location ?? undefined,
    content: row.content
  };
}

function toContentRow(item: ContentItem): SupabaseContentRow {
  return {
    slug: item.slug,
    title: item.title,
    date: item.date,
    excerpt: item.excerpt,
    cover_image: item.coverImage,
    category: item.category ?? null,
    location: item.location ?? null,
    content: item.content
  };
}

function sortContentByDate(items: ContentItem[]) {
  return [...items].sort((a, b) => b.date.localeCompare(a.date));
}

function sortVideosByDate(items: Video[]) {
  return [...items].sort((a, b) => b.date.localeCompare(a.date));
}

export async function getContentItems(type: ContentType): Promise<ContentItem[]> {
  const rows = await supabaseFetch<SupabaseContentRow[]>(
    `${tableByType[type]}?select=*&order=date.desc`
  );
  return rows ? sortContentByDate(rows.map(fromContentRow)) : getAllContent(type);
}

export async function getContentItem(type: ContentType, slug: string): Promise<ContentItem | undefined> {
  const rows = await supabaseFetch<SupabaseContentRow[]>(
    `${tableByType[type]}?slug=eq.${encodeURIComponent(slug)}&select=*&limit=1`
  );
  if (rows?.[0]) return fromContentRow(rows[0]);
  return getAllContent(type).find((item) => item.slug === slug);
}

export async function getVideoItems(): Promise<Video[]> {
  const rows = await supabaseFetch<SupabaseVideoRow[]>("videos?select=*&order=date.desc");
  return sortVideosByDate(rows ?? localVideos);
}

export async function upsertContentItem(type: ContentType, item: ContentItem) {
  return supabaseRequest<SupabaseContentRow[]>(
    `${tableByType[type]}?on_conflict=slug`,
    {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(toContentRow(item))
    }
  );
}

export async function upsertVideoItem(video: Video) {
  return supabaseRequest<SupabaseVideoRow[]>(
    "videos?on_conflict=slug",
    {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(video)
    }
  );
}

export async function deleteContentItem(type: ContentType, slug: string) {
  return supabaseRequest<SupabaseContentRow[]>(
    `${tableByType[type]}?slug=eq.${encodeURIComponent(slug)}`,
    {
      method: "DELETE",
      headers: { Prefer: "return=representation" }
    }
  );
}

export async function deleteVideoItem(slug: string) {
  return supabaseRequest<SupabaseVideoRow[]>(
    `videos?slug=eq.${encodeURIComponent(slug)}`,
    {
      method: "DELETE",
      headers: { Prefer: "return=representation" }
    }
  );
}

export function isCmsConfigured() {
  return Boolean(supabaseConfig());
}
