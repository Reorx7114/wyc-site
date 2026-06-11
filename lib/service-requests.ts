export const serviceRequestCategories = [
  "社區問題",
  "長照協助",
  "急難救助",
  "基金會服務",
  "活動合作",
  "其他"
] as const;

export const serviceRequestStatuses = [
  "新案件",
  "已聯繫",
  "追蹤中",
  "已完成",
  "結案"
] as const;

export type ServiceRequestCategory = (typeof serviceRequestCategories)[number];
export type ServiceRequestStatus = (typeof serviceRequestStatuses)[number];

export type ServiceRequest = {
  id: string;
  name: string;
  phone: string;
  address: string;
  category: ServiceRequestCategory;
  content: string;
  imagePaths: string[];
  imageUrls?: string[];
  status: ServiceRequestStatus;
  adminNotes: string;
  isTest: boolean;
  createdAt: string;
  updatedAt: string;
};

type ServiceRequestRow = {
  id: string;
  name: string;
  phone: string;
  address: string;
  category: ServiceRequestCategory;
  content: string;
  image_paths: string[] | null;
  status: ServiceRequestStatus;
  admin_notes: string;
  is_test: boolean;
  created_at: string;
  updated_at: string;
};

const requestBucket = "service-request-images";

function supabaseConfig() {
  const rawUrl = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!rawUrl || !key) return null;

  try {
    return { url: new URL(rawUrl.trim()).origin, key, isSecretKey: key.startsWith("sb_secret_") };
  } catch {
    return null;
  }
}

function authHeaders(contentType = "application/json") {
  const config = supabaseConfig();
  if (!config) return null;
  return {
    apikey: config.key,
    ...(!config.isSecretKey ? { Authorization: `Bearer ${config.key}` } : {}),
    "Content-Type": contentType
  };
}

async function restRequest<T>(path: string, init?: RequestInit) {
  const config = supabaseConfig();
  const headers = authHeaders();
  if (!config || !headers) throw new Error("服務申請功能尚未完成設定。");

  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    cache: "no-store",
    headers: { ...headers, ...(init?.headers ?? {}) }
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.message || "服務申請資料處理失敗。");
  return data as T;
}

function fromRow(row: ServiceRequestRow): ServiceRequest {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    address: row.address,
    category: row.category,
    content: row.content,
    imagePaths: row.image_paths ?? [],
    status: row.status,
    adminNotes: row.admin_notes,
    isTest: row.is_test,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function isServiceRequestConfigured() {
  return Boolean(supabaseConfig());
}

export async function createServiceRequest(input: {
  name: string;
  phone: string;
  address: string;
  category: ServiceRequestCategory;
  content: string;
  isTest: boolean;
}) {
  const rows = await restRequest<ServiceRequestRow[]>("service_requests", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      name: input.name,
      phone: input.phone,
      address: input.address,
      category: input.category,
      content: input.content,
      is_test: input.isTest
    })
  });
  return fromRow(rows[0]);
}

export async function setServiceRequestImages(id: string, imagePaths: string[]) {
  const rows = await restRequest<ServiceRequestRow[]>(`service_requests?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ image_paths: imagePaths, updated_at: new Date().toISOString() })
  });
  return rows[0] ? fromRow(rows[0]) : null;
}

export async function getServiceRequests() {
  const rows = await restRequest<ServiceRequestRow[]>("service_requests?select=*&order=created_at.desc");
  return Promise.all(rows.map(async (row) => ({
    ...fromRow(row),
    imageUrls: await Promise.all((row.image_paths ?? []).map(createSignedImageUrl))
  })));
}

export async function updateServiceRequest(id: string, status: ServiceRequestStatus, adminNotes: string) {
  const rows = await restRequest<ServiceRequestRow[]>(`service_requests?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ status, admin_notes: adminNotes, updated_at: new Date().toISOString() })
  });
  return rows[0] ? fromRow(rows[0]) : null;
}

export async function deleteServiceRequest(id: string) {
  const existing = await restRequest<ServiceRequestRow[]>(`service_requests?id=eq.${encodeURIComponent(id)}&select=*`);
  const paths = existing[0]?.image_paths ?? [];
  if (paths.length) await deleteRequestImages(paths);

  return restRequest<ServiceRequestRow[]>(`service_requests?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Prefer: "return=representation" }
  });
}

export async function uploadRequestImage(requestId: string, file: File) {
  const config = supabaseConfig();
  const headers = authHeaders(file.type || "application/octet-stream");
  if (!config || !headers) throw new Error("服務申請照片功能尚未完成設定。");

  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${requestId}/${crypto.randomUUID()}.${extension}`;
  const response = await fetch(`${config.url}/storage/v1/object/${requestBucket}/${path}`, {
    method: "POST",
    headers: { ...headers, "x-upsert": "false" },
    body: await file.arrayBuffer()
  });
  if (!response.ok) throw new Error(`照片上傳失敗：${await response.text()}`);
  return path;
}

async function createSignedImageUrl(path: string) {
  const config = supabaseConfig();
  const headers = authHeaders();
  if (!config || !headers) return "";

  const response = await fetch(`${config.url}/storage/v1/object/sign/${requestBucket}/${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ expiresIn: 3600 })
  });
  if (!response.ok) return "";
  const result = await response.json() as { signedURL?: string; signedUrl?: string };
  const signedPath = result.signedURL ?? result.signedUrl;
  return signedPath ? `${config.url}/storage/v1${signedPath}` : "";
}

async function deleteRequestImages(paths: string[]) {
  const config = supabaseConfig();
  const headers = authHeaders();
  if (!config || !headers) throw new Error("服務申請照片功能尚未完成設定。");

  const response = await fetch(`${config.url}/storage/v1/object/${requestBucket}`, {
    method: "DELETE",
    headers,
    body: JSON.stringify({ prefixes: paths })
  });
  if (!response.ok) throw new Error(`照片刪除失敗：${await response.text()}`);
}

