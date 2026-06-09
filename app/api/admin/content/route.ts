import { NextResponse } from "next/server";
import {
  deleteContentItem,
  deleteVideoItem,
  getContentItems,
  getVideoItems,
  isCmsConfigured,
  upsertContentItem,
  upsertVideoItem
} from "@/lib/cms";
import { deleteContentImages } from "@/lib/content-images";

function authorized(request: Request) {
  const password = request.headers.get("x-admin-password");
  return password && password === (process.env.ADMIN_PASSWORD || "28122288");
}

export async function GET() {
  const [blog, events, videos] = await Promise.all([
    getContentItems("blog"),
    getContentItems("events"),
    getVideoItems()
  ]);

  return NextResponse.json({
    configured: isCmsConfigured(),
    blog,
    events,
    videos
  });
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, message: "未授權" }, { status: 401 });
  }
  if (!isCmsConfigured()) {
    return NextResponse.json({ ok: false, message: "尚未設定 Supabase，無法永久儲存內容。" }, { status: 400 });
  }

  const body = await request.json();
  if (body.kind === "blog" || body.kind === "events") {
    if (!body.item?.slug?.trim()) {
      return NextResponse.json({ ok: false, message: "網址代稱不可空白。" }, { status: 400 });
    }
    const result = await upsertContentItem(body.kind, body.item);
    if (result.error) {
      return NextResponse.json({
        ok: false,
        message: result.error,
        supabase: result
      }, { status: result.status ?? 500 });
    }
    return NextResponse.json({ ok: true, saved: result.data });
  }
  if (body.kind === "videos") {
    const result = await upsertVideoItem(body.item);
    if (result.error) {
      return NextResponse.json({
        ok: false,
        message: result.error,
        supabase: result
      }, { status: result.status ?? 500 });
    }
    return NextResponse.json({ ok: true, saved: result.data });
  }

  return NextResponse.json({ ok: false, message: "未知的內容類型" }, { status: 400 });
}

export async function DELETE(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, message: "未授權" }, { status: 401 });
  }
  if (!isCmsConfigured()) {
    return NextResponse.json({ ok: false, message: "尚未設定 Supabase，內容管理功能為停用狀態。" }, { status: 400 });
  }

  const body = await request.json();
  if ((body.kind === "blog" || body.kind === "events") && typeof body.slug === "string") {
    if (body.slug) {
      try {
        await deleteContentImages(body.kind, body.slug);
      } catch (error) {
        return NextResponse.json({
          ok: false,
          message: error instanceof Error ? error.message : "無法刪除內容附件。"
        }, { status: 500 });
      }
    }
    const result = await deleteContentItem(body.kind, body.slug);
    if (result.error) {
      return NextResponse.json({
        ok: false,
        message: result.error,
        supabase: result
      }, { status: result.status ?? 500 });
    }
    return NextResponse.json({ ok: true, deleted: result.data });
  }
  if (body.kind === "videos" && body.slug) {
    const result = await deleteVideoItem(body.slug);
    if (result.error) {
      return NextResponse.json({
        ok: false,
        message: result.error,
        supabase: result
      }, { status: result.status ?? 500 });
    }
    return NextResponse.json({ ok: true, deleted: result.data });
  }

  return NextResponse.json({ ok: false, message: "缺少內容類型或 slug" }, { status: 400 });
}
