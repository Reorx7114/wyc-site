import { NextResponse } from "next/server";
import {
  createServiceRequest,
  deleteServiceRequest,
  isServiceRequestConfigured,
  serviceRequestCategories,
  setServiceRequestImages,
  uploadRequestImage,
  type ServiceRequestCategory
} from "@/lib/service-requests";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxFileSize = 5 * 1024 * 1024;
const maxFiles = 5;

function clean(value: FormDataEntryValue | null, maxLength: number) {
  return String(value ?? "").trim().slice(0, maxLength);
}

export async function POST(request: Request) {
  if (!isServiceRequestConfigured()) {
    return NextResponse.json({ ok: false, message: "服務申請功能尚未開放，請改用電話或 LINE 聯繫。" }, { status: 503 });
  }

  const formData = await request.formData();
  const honeypot = clean(formData.get("website"), 200);
  const startedAt = Number(formData.get("startedAt") || 0);
  if (honeypot || !startedAt || Date.now() - startedAt < 2500) {
    return NextResponse.json({ ok: false, message: "無法送出申請，請重新整理後再試一次。" }, { status: 400 });
  }

  const name = clean(formData.get("name"), 80);
  const phone = clean(formData.get("phone"), 30);
  const address = clean(formData.get("address"), 200);
  const category = clean(formData.get("category"), 30) as ServiceRequestCategory;
  const content = clean(formData.get("content"), 4000);
  const consent = clean(formData.get("consent"), 10) === "true";
  const isProduction = process.env.VERCEL_ENV === "production";
  const isTest = !isProduction && clean(formData.get("isTest"), 10) === "true";
  const files = formData.getAll("photos").filter((item): item is File => item instanceof File && item.size > 0);

  if (!name || !phone || !category || !content) {
    return NextResponse.json({ ok: false, message: "請填寫姓名、電話、分類與問題內容。" }, { status: 400 });
  }
  if (!consent) {
    return NextResponse.json({ ok: false, message: "請先同意資料使用說明後再送出申請。" }, { status: 400 });
  }
  if (!/^[0-9+\-()#\s]{8,25}$/.test(phone)) {
    return NextResponse.json({ ok: false, message: "電話格式不正確，請確認後再送出。" }, { status: 400 });
  }
  if (!serviceRequestCategories.includes(category)) {
    return NextResponse.json({ ok: false, message: "請選擇有效的服務分類。" }, { status: 400 });
  }
  if (files.length > maxFiles) {
    return NextResponse.json({ ok: false, message: `一次最多上傳 ${maxFiles} 張照片。` }, { status: 400 });
  }
  for (const file of files) {
    if (!allowedTypes.has(file.type)) {
      return NextResponse.json({ ok: false, message: "照片僅支援 JPG、PNG 或 WebP。" }, { status: 400 });
    }
    if (file.size > maxFileSize) {
      return NextResponse.json({ ok: false, message: "單張照片不可超過 5MB。" }, { status: 400 });
    }
  }

  let createdId = "";
  try {
    const serviceRequest = await createServiceRequest({ name, phone, address, category, content, isTest });
    createdId = serviceRequest.id;
    const imagePaths = [];
    for (const file of files) imagePaths.push(await uploadRequestImage(serviceRequest.id, file));
    if (imagePaths.length) await setServiceRequestImages(serviceRequest.id, imagePaths);

    return NextResponse.json({ ok: true, reference: serviceRequest.id.slice(0, 8).toUpperCase() });
  } catch (error) {
    console.error("Service request submission failed", error);
    if (createdId) {
      try {
        await deleteServiceRequest(createdId);
      } catch {
        // Keep the original submission error; administrators can inspect rare cleanup failures in Supabase.
      }
    }
    return NextResponse.json({
      ok: false,
      message: "服務申請送出失敗，請稍後再試；也可以改用電話或 LINE 聯繫。"
    }, { status: 500 });
  }
}
