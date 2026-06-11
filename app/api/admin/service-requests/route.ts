import { NextResponse } from "next/server";
import {
  deleteServiceRequest,
  getServiceRequests,
  isServiceRequestConfigured,
  serviceRequestStatuses,
  updateServiceRequest,
  type ServiceRequestStatus
} from "@/lib/service-requests";

function authorized(request: Request) {
  const password = request.headers.get("x-admin-password");
  return password && password === (process.env.ADMIN_PASSWORD || "28122288");
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ ok: false, message: "請重新登入後台。" }, { status: 401 });
  if (!isServiceRequestConfigured()) return NextResponse.json({ ok: false, configured: false, requests: [] }, { status: 503 });

  try {
    return NextResponse.json({ ok: true, configured: true, requests: await getServiceRequests() });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "案件載入失敗。" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!authorized(request)) return NextResponse.json({ ok: false, message: "請重新登入後台。" }, { status: 401 });
  const body = await request.json();
  const status = String(body.status || "") as ServiceRequestStatus;
  if (!body.id || !serviceRequestStatuses.includes(status)) {
    return NextResponse.json({ ok: false, message: "案件資料不完整。" }, { status: 400 });
  }

  try {
    return NextResponse.json({ ok: true, request: await updateServiceRequest(body.id, status, String(body.adminNotes || "").slice(0, 4000)) });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "案件更新失敗。" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!authorized(request)) return NextResponse.json({ ok: false, message: "請重新登入後台。" }, { status: 401 });
  const body = await request.json();
  if (!body.id) return NextResponse.json({ ok: false, message: "缺少案件編號。" }, { status: 400 });

  try {
    await deleteServiceRequest(body.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "案件刪除失敗。" }, { status: 500 });
  }
}

