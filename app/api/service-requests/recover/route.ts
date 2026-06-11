import { NextResponse } from "next/server";
import { checkTrackingRateLimit, isServiceRequestConfigured, normalizePhone, recoverServiceRequests } from "@/lib/service-requests";

const notFoundMessage = "查無符合的案件資料，請確認姓名與電話。";

function clientAddress(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: Request) {
  if (!isServiceRequestConfigured()) return NextResponse.json({ ok: false, message: "案件找回功能尚未開放。" }, { status: 503 });
  try {
    const body = await request.json();
    const website = String(body.website || "").trim();
    const startedAt = Number(body.startedAt || 0);
    const name = String(body.name || "").trim().slice(0, 80);
    const phone = normalizePhone(String(body.phone || "")).slice(0, 25);
    const address = clientAddress(request);
    const [sourceAllowed, lookupAllowed] = await Promise.all([
      checkTrackingRateLimit(`recover-source:${address}`, 20),
      checkTrackingRateLimit(`recover-lookup:${address}:${phone}`, 5)
    ]);
    if (!sourceAllowed || !lookupAllowed) return NextResponse.json({ ok: false, message: "查詢次數過多，請稍後再試。" }, { status: 429 });
    if (website || !startedAt || Date.now() - startedAt < 1500) return NextResponse.json({ ok: false, message: notFoundMessage });
    const results = await recoverServiceRequests(name, phone);
    return results.length ? NextResponse.json({ ok: true, results }) : NextResponse.json({ ok: false, message: notFoundMessage });
  } catch (error) {
    console.error("Service request recovery failed", error);
    return NextResponse.json({ ok: false, message: notFoundMessage });
  }
}
