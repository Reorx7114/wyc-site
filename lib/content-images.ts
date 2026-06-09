import type { ContentType } from "@/lib/markdown";

const bucket = "content-images";

type SupabaseJwtClaims = {
  ref?: string;
  role?: string;
};

function normalizeSupabaseUrl(rawUrl: string) {
  return rawUrl.trim().replace(/\/$/, "");
}

function projectRefFromUrl(url: string) {
  try {
    const hostname = new URL(url).hostname;
    return hostname.endsWith(".supabase.co") ? hostname.split(".")[0] : null;
  } catch {
    return null;
  }
}

function decodeJwtClaims(key: string): SupabaseJwtClaims | null {
  const payload = key.split(".")[1];
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(Buffer.from(normalized, "base64").toString("utf8")) as SupabaseJwtClaims;
  } catch {
    return null;
  }
}

function storageConfig() {
  const rawUrl = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!rawUrl || !key) return null;

  const url = normalizeSupabaseUrl(rawUrl);
  const claims = decodeJwtClaims(key);
  const urlProjectRef = projectRefFromUrl(url);

  if (claims?.role && claims.role !== "service_role") {
    throw new Error(`SUPABASE_SERVICE_ROLE_KEY 實際角色為「${claims.role}」，請改用 service_role key。`);
  }
  if (claims?.ref && urlProjectRef && claims.ref !== urlProjectRef) {
    throw new Error("SUPABASE_URL 與 SUPABASE_SERVICE_ROLE_KEY 來自不同 Supabase 專案。");
  }

  return { url, key, role: claims?.role ?? "unknown", keyProjectRef: claims?.ref ?? null, urlProjectRef };
}

function storageHeaders(contentType?: string) {
  const config = storageConfig();
  if (!config) return null;
  return {
    apikey: config.key,
    Authorization: `Bearer ${config.key}`,
    ...(contentType ? { "Content-Type": contentType } : {})
  };
}

function contentFolder(type: ContentType, slug: string) {
  return `${type}/${slug}`;
}

export function isValidContentSlug(slug: string) {
  return /^[a-z0-9][a-z0-9-]{1,79}$/.test(slug);
}

export async function uploadContentImage(type: ContentType, slug: string, file: File) {
  const config = storageConfig();
  const headers = storageHeaders(file.type || "application/octet-stream");
  if (!config || !headers) throw new Error("網站圖片附件功能尚未設定完成。");

  const extension = file.type === "image/webp" ? "webp" : "jpg";
  const objectPath = `${contentFolder(type, slug)}/${crypto.randomUUID()}.${extension}`;
  const endpoint = `${config.url}/storage/v1/object/${bucket}/${objectPath}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { ...headers, "x-upsert": "false" },
    body: await file.arrayBuffer()
  });

  if (!response.ok) {
    const diagnostic = [
      `key role=${config.role}`,
      `URL/key project match=${!config.keyProjectRef || !config.urlProjectRef || config.keyProjectRef === config.urlProjectRef}`
    ].join(", ");
    throw new Error(`圖片上傳失敗：${await response.text()}（${diagnostic}）`);
  }

  return {
    path: objectPath,
    url: `${config.url}/storage/v1/object/public/${bucket}/${objectPath}`
  };
}

export async function deleteContentImages(type: ContentType, slug: string) {
  const config = storageConfig();
  const headers = storageHeaders("application/json");
  if (!config || !headers) throw new Error("網站圖片附件功能尚未設定完成。");

  const prefix = contentFolder(type, slug);
  const listResponse = await fetch(`${config.url}/storage/v1/object/list/${bucket}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ prefix, limit: 1000, offset: 0, sortBy: { column: "name", order: "asc" } })
  });

  if (!listResponse.ok) {
    if (listResponse.status === 404) return 0;
    throw new Error(`無法檢查文章附件：${await listResponse.text()}`);
  }

  const objects = await listResponse.json() as Array<{ name: string }>;
  if (!objects.length) return 0;

  const prefixes = objects.map((object) => `${prefix}/${object.name}`);
  const deleteResponse = await fetch(`${config.url}/storage/v1/object/${bucket}`, {
    method: "DELETE",
    headers,
    body: JSON.stringify({ prefixes })
  });

  if (!deleteResponse.ok) {
    throw new Error(`無法刪除文章附件：${await deleteResponse.text()}`);
  }

  return prefixes.length;
}
