import { NextResponse } from "next/server";
import { isValidContentSlug, uploadContentImage } from "@/lib/content-images";
import type { ContentType } from "@/lib/markdown";

function authorized(request: Request) {
  const password = request.headers.get("x-admin-password");
  return password && password === (process.env.ADMIN_PASSWORD || "28122288");
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, message: "登入狀態已失效，請重新登入。" }, { status: 401 });
  }

  const formData = await request.formData();
  const type = String(formData.get("type") || "") as ContentType;
  const slug = String(formData.get("slug") || "").trim();
  const files = formData.getAll("files").filter((item): item is File => item instanceof File);

  if (type !== "blog" && type !== "events") {
    return NextResponse.json({ ok: false, message: "此內容類型不支援圖片附件。" }, { status: 400 });
  }
  if (!isValidContentSlug(slug)) {
    return NextResponse.json({ ok: false, message: "請先填寫英文網址代稱，例如 public-hearing-2026。" }, { status: 400 });
  }
  if (!files.length) {
    return NextResponse.json({ ok: false, message: "請選擇要加入的照片。" }, { status: 400 });
  }
  if (files.length > 10) {
    return NextResponse.json({ ok: false, message: "一次最多加入 10 張照片。" }, { status: 400 });
  }

  try {
    const uploaded = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json({ ok: false, message: "請只選擇圖片檔案。" }, { status: 400 });
      }
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ ok: false, message: "單張照片不可超過 5MB。" }, { status: 400 });
      }
      uploaded.push(await uploadContentImage(type, slug, file));
    }
    return NextResponse.json({ ok: true, images: uploaded });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      message: error instanceof Error ? error.message : "圖片上傳失敗。"
    }, { status: 500 });
  }
}
