type GithubImageResult = {
  ok: boolean;
  message: string;
  path?: string;
  url?: string;
  commitSha?: string;
};

type GithubContentResponse = {
  sha?: string;
  content?: { html_url?: string };
  commit?: { sha?: string };
  message?: string;
  documentation_url?: string;
};

const defaultImagePaths = new Set([
  "public/images/wang-real-person-crop.png",
  "public/images/wang-chibi-person-crop.png",
  "public/images/chongyang-bridge.png",
  "public/images/facebook-qrcode.png",
  "public/images/line-qrcode.jpg"
]);

function githubConfig() {
  const token = process.env.GITHUB_CONTENT_TOKEN || process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_REPO_OWNER || "Reorx7114";
  const repo = process.env.GITHUB_REPO_NAME || "wyc-site";
  const branch = process.env.GITHUB_BRANCH || "main";

  if (!token) return null;
  return { token, owner, repo, branch };
}

function normalizeRepoImagePath(path: string) {
  return path.trim().replace(/^\/+/, "").replaceAll("\\", "/");
}

export function isGithubImageSyncConfigured() {
  return Boolean(githubConfig());
}

export function validateImagePath(path: string) {
  const normalized = normalizeRepoImagePath(path);
  if (!defaultImagePaths.has(normalized)) {
    return {
      ok: false,
      path: normalized,
      message: "圖片路徑不在允許清單內，請使用後台提供的圖片位置。"
    };
  }
  return { ok: true, path: normalized, message: "" };
}

async function githubRequest<T>(endpoint: string, init?: RequestInit) {
  const config = githubConfig();
  if (!config) {
    return {
      ok: false,
      status: null,
      data: null as T | null,
      message: "尚未設定 GitHub 圖片同步。請在 Vercel Environment Variables 設定 GITHUB_CONTENT_TOKEN。"
    };
  }

  const response = await fetch(`https://api.github.com${endpoint}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers ?? {})
    }
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) as T : null;

  if (!response.ok) {
    const githubMessage = typeof data === "object" && data && "message" in data
      ? String((data as GithubContentResponse).message)
      : text;
    return {
      ok: false,
      status: response.status,
      data,
      message: `GitHub request failed (${response.status} ${response.statusText}): ${githubMessage}`
    };
  }

  return { ok: true, status: response.status, data, message: "" };
}

export async function uploadImageToGithub(path: string, file: File): Promise<GithubImageResult> {
  const config = githubConfig();
  if (!config) {
    return {
      ok: false,
      message: "尚未設定 GitHub 圖片同步。請在 Vercel Environment Variables 設定 GITHUB_CONTENT_TOKEN。"
    };
  }

  if (!file.type.startsWith("image/")) {
    return { ok: false, message: "請上傳圖片檔。" };
  }

  if (file.size > 4 * 1024 * 1024) {
    return { ok: false, message: "圖片不可超過 4MB，請先壓縮後再上傳。" };
  }

  const validated = validateImagePath(path);
  if (!validated.ok) return { ok: false, message: validated.message, path: validated.path };

  const encodedPath = validated.path.split("/").map(encodeURIComponent).join("/");
  const endpoint = `/repos/${config.owner}/${config.repo}/contents/${encodedPath}`;
  const existing = await githubRequest<GithubContentResponse>(`${endpoint}?ref=${encodeURIComponent(config.branch)}`);
  const existingSha = existing.ok ? existing.data?.sha : undefined;

  if (!existing.ok && existing.status !== 404) {
    return { ok: false, message: existing.message, path: validated.path };
  }

  const content = Buffer.from(await file.arrayBuffer()).toString("base64");
  const updated = await githubRequest<GithubContentResponse>(endpoint, {
    method: "PUT",
    body: JSON.stringify({
      message: `Update image ${validated.path}`,
      content,
      branch: config.branch,
      sha: existingSha
    })
  });

  if (!updated.ok) {
    return { ok: false, message: updated.message, path: validated.path };
  }

  return {
    ok: true,
    message: "圖片已同步到 GitHub main，Vercel 會自動重新部署。",
    path: validated.path,
    url: updated.data?.content?.html_url,
    commitSha: updated.data?.commit?.sha
  };
}

export const githubImageTargets = [
  { label: "首頁／關於頁真人照片", path: "public/images/wang-real-person-crop.png" },
  { label: "首頁 Q 版人物", path: "public/images/wang-chibi-person-crop.png" },
  { label: "重陽橋插圖", path: "public/images/chongyang-bridge.png" },
  { label: "Facebook QR Code", path: "public/images/facebook-qrcode.png" },
  { label: "LINE QR Code", path: "public/images/line-qrcode.jpg" }
];