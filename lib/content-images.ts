import type { ContentType } from "@/lib/markdown";

const bucket = "content-images";

function storageConfig() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url, key };
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
    throw new Error(`圖片上傳失敗：${await response.text()}`);
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
