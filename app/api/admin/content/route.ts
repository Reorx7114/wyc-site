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
    const saved = await upsertContentItem(body.kind, body.item);
    return NextResponse.json({ ok: Boolean(saved), saved });
  }
  if (body.kind === "videos") {
    const saved = await upsertVideoItem(body.item);
    return NextResponse.json({ ok: Boolean(saved), saved });
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
  if ((body.kind === "blog" || body.kind === "events") && body.slug) {
    const deleted = await deleteContentItem(body.kind, body.slug);
    return NextResponse.json({ ok: Boolean(deleted), deleted });
  }
  if (body.kind === "videos" && body.slug) {
    const deleted = await deleteVideoItem(body.slug);
    return NextResponse.json({ ok: Boolean(deleted), deleted });
  }

  return NextResponse.json({ ok: false, message: "缺少內容類型或 slug" }, { status: 400 });
}
