import { videos as localVideos, type Video } from "@/data/videos";
import { type ContentItem, getAllContent, type ContentType } from "@/lib/markdown";

type SupabaseBaseContentRow = { slug: string; title: string; date: string; excerpt: string; cover_image: string; content: string; updated_at?: string };
type SupabaseBlogRow = SupabaseBaseContentRow & { category?: string | null };
type SupabaseEventRow = SupabaseBaseContentRow & { location?: string | null };
type SupabaseVideoRow = { slug: string; title: string; description: string; category: Video["category"]; type: Video["type"]; src: string; date: string; updated_at?: string };
export type SupabaseResult<T> = { data: T | null; error: string | null; status: number | null; endpoint: string | null };

const tableByType: Record<ContentType, string> = { blog: "blog_posts", events: "events" };

function normalizeSupabaseUrl(rawUrl: string) {
  const trimmed = rawUrl.trim().replace(/\/$/, "");
  try {
    const parsed = new URL(trimmed);
    const dashboardMarker = parsed.pathname.includes("/dashboard/project/") ? "/dashboard/project/" : parsed.pathname.includes("/project/") ? "/project/" : null;
    if ((parsed.hostname === "supabase.com" || parsed.hostname === "app.supabase.com") && dashboardMarker) {
      const projectRef = parsed.pathname.split(dashboardMarker)[1]?.split("/")[0];
      if (projectRef) return `https://${projectRef}.supabase.co`;
    }
    // PostgREST endpoints must be built from the Project URL origin, never an existing /rest/v1 path.
    return parsed.origin;
  } catch { return trimmed; }
}

function supabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url: normalizeSupabaseUrl(url), key, isSecretKey: key.startsWith("sb_secret_") };
}

async function supabaseRequest<T>(path: string, init?: RequestInit): Promise<SupabaseResult<T>> {
  const config = supabaseConfig();
  if (!config) return { data: null, error: "Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.", status: null, endpoint: null };
  try {
    const hostname = new URL(config.url).hostname;
    if (!hostname.endsWith(".supabase.co")) return { data: null, error: `Invalid SUPABASE_URL: "${config.url}". Use the Project URL format: https://<project-ref>.supabase.co`, status: null, endpoint: null };
  } catch { return { data: null, error: `Invalid SUPABASE_URL: "${config.url}". Use the Project URL format: https://<project-ref>.supabase.co`, status: null, endpoint: null }; }

  const endpoint = `${config.url}/rest/v1/${path}`;
  try {
    const response = await fetch(endpoint, {
      ...init,
      cache: "no-store",
      headers: { apikey: config.key, ...(!config.isSecretKey ? { Authorization: `Bearer ${config.key}` } : {}), "Content-Type": "application/json", ...(init?.headers ?? {}) }
    });
    const text = await response.text();
    let parsed: unknown = null;
    if (text) { try { parsed = JSON.parse(text); } catch { parsed = text; } }
    if (!response.ok) {
      const message = typeof parsed === "string" ? parsed : JSON.stringify(parsed);
      return { data: null, error: `Supabase request failed (${response.status} ${response.statusText}) at ${endpoint}: ${message}`, status: response.status, endpoint };
    }
    return { data: parsed as T, error: null, status: response.status, endpoint };
  } catch (error) { return { data: null, error: error instanceof Error ? error.message : String(error), status: null, endpoint }; }
}

async function supabaseFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  const result = await supabaseRequest<T>(path, init);
  if (result.error) console.error(result.error);
  return result.data;
}

function fromContentRow(row: SupabaseBlogRow | SupabaseEventRow): ContentItem {
  return { slug: row.slug, title: row.title, date: row.date, excerpt: row.excerpt, coverImage: row.cover_image, category: "category" in row ? row.category ?? undefined : undefined, location: "location" in row ? row.location ?? undefined : undefined, content: row.content };
}
function toBaseContentRow(item: ContentItem): SupabaseBaseContentRow { return { slug: item.slug, title: item.title, date: item.date, excerpt: item.excerpt, cover_image: item.coverImage, content: item.content, updated_at: new Date().toISOString() }; }
function toBlogRow(item: ContentItem): SupabaseBlogRow { return { ...toBaseContentRow(item), category: item.category ?? null }; }
function toEventRow(item: ContentItem): SupabaseEventRow { return { ...toBaseContentRow(item), location: item.location ?? null }; }
function toVideoRow(video: Video): SupabaseVideoRow { return { slug: video.slug, title: video.title, description: video.description, category: video.category, type: video.type, src: video.src, date: video.date, updated_at: new Date().toISOString() }; }
function sortContentByDate(items: ContentItem[]) { return [...items].sort((a, b) => b.date.localeCompare(a.date)); }
function sortVideosByDate(items: Video[]) { return [...items].sort((a, b) => b.date.localeCompare(a.date)); }

export async function getContentItems(type: ContentType): Promise<ContentItem[]> {
  const rows = await supabaseFetch<Array<SupabaseBlogRow | SupabaseEventRow>>(`${tableByType[type]}?select=*&order=date.desc`);
  return rows ? sortContentByDate(rows.map(fromContentRow)) : getAllContent(type);
}
export async function getContentItem(type: ContentType, slug: string): Promise<ContentItem | undefined> {
  const rows = await supabaseFetch<Array<SupabaseBlogRow | SupabaseEventRow>>(`${tableByType[type]}?slug=eq.${encodeURIComponent(slug)}&select=*&limit=1`);
  if (rows?.[0]) return fromContentRow(rows[0]);
  return getAllContent(type).find((item) => item.slug === slug);
}
export async function getVideoItems(): Promise<Video[]> { const rows = await supabaseFetch<SupabaseVideoRow[]>("videos?select=*&order=date.desc"); return sortVideosByDate(rows ?? localVideos); }
export async function upsertContentItem(type: ContentType, item: ContentItem) {
  const payload = type === "blog" ? toBlogRow(item) : toEventRow(item);
  return supabaseRequest<Array<SupabaseBlogRow | SupabaseEventRow>>(`${tableByType[type]}?on_conflict=slug`, { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify(payload) });
}
export async function upsertVideoItem(video: Video) { return supabaseRequest<SupabaseVideoRow[]>("videos?on_conflict=slug", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify(toVideoRow(video)) }); }
export async function deleteContentItem(type: ContentType, slug: string) { return supabaseRequest<Array<SupabaseBlogRow | SupabaseEventRow>>(`${tableByType[type]}?slug=eq.${encodeURIComponent(slug)}`, { method: "DELETE", headers: { Prefer: "return=representation" } }); }
export async function deleteVideoItem(slug: string) { return supabaseRequest<SupabaseVideoRow[]>(`videos?slug=eq.${encodeURIComponent(slug)}`, { method: "DELETE", headers: { Prefer: "return=representation" } }); }
export function isCmsConfigured() { return Boolean(supabaseConfig()); }
