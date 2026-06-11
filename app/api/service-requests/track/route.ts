import { NextResponse } from "next/server";
import { checkTrackingRateLimit, isServiceRequestConfigured, normalizePublicReference, trackServiceRequest } from "@/lib/service-requests";

const notFoundMessage = "查無符合的案件資料，請確認案件編號與電話末四碼。";

function clientAddress(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: Request) {
  if (!isServiceRequestConfigured()) return NextResponse.json({ ok: false, message: "案件查詢功能尚未開放。" }, { status: 503 });
  try {
    const body = await request.json();
    const website = String(body.website || "").trim();
    const startedAt = Number(body.startedAt || 0);
    const reference = normalizePublicReference(String(body.reference || ""));
    const phoneLast4 = String(body.phoneLast4 || "").replace(/\D/g, "").slice(-4);
    const address = clientAddress(request);
    const [sourceAllowed, lookupAllowed] = await Promise.all([
      checkTrackingRateLimit(`track-source:${address}`, 30),
      checkTrackingRateLimit(`track-lookup:${address}:${reference}`, 8)
    ]);
    if (!sourceAllowed || !lookupAllowed) return NextResponse.json({ ok: false, message: "查詢次數過多，請稍後再試。" }, { status: 429 });
    if (website || !startedAt || Date.now() - startedAt < 1500) return NextResponse.json({ ok: false, message: notFoundMessage });
    const result = await trackServiceRequest(reference, phoneLast4);
    return result ? NextResponse.json({ ok: true, result }) : NextResponse.json({ ok: false, message: notFoundMessage });
  } catch (error) {
    console.error("Service request tracking failed", error);
    return NextResponse.json({ ok: false, message: notFoundMessage });
  }
}
