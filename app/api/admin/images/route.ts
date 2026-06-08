import { NextResponse } from "next/server";
import {
  githubImageTargets,
  isGithubImageSyncConfigured,
  uploadImageToGithub,
  validateImagePath
} from "@/lib/github-images";

function authorized(request: Request) {
  const password = request.headers.get("x-admin-password");
  return password && password === (process.env.ADMIN_PASSWORD || "28122288");
}

export async function GET() {
  return NextResponse.json({
    configured: isGithubImageSyncConfigured(),
    targets: githubImageTargets
  });
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, message: "未授權" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const path = String(formData.get("path") || "");
  const validated = validateImagePath(path);

  if (!validated.ok) {
    return NextResponse.json({ ok: false, message: validated.message, path: validated.path }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, message: "請選擇圖片檔。" }, { status: 400 });
  }

  const result = await uploadImageToGithub(validated.path, file);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
