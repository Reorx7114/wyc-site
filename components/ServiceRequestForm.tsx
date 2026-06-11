"use client";

import { FormEvent, useRef, useState } from "react";
import { serviceRequestCategories } from "@/lib/service-requests";

export function ServiceRequestForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("正在整理照片並送出服務申請...");
    setSuccess(false);

    try {
      const formData = new FormData(event.currentTarget);
      const photos = formData.getAll("photos").filter((item): item is File => item instanceof File && item.size > 0);
      if (photos.length > 5) throw new Error("一次最多上傳 5 張照片。");
      formData.delete("photos");
      const compressed = await Promise.all(photos.map(compressPhoto));
      compressed.forEach((photo) => formData.append("photos", photo));

      const response = await fetch("/api/service-requests", {
        method: "POST",
        body: formData
      });
      const result = await response.json();
      if (!result.ok) throw new Error(result.message || "送出失敗，請稍後再試。");

      setSuccess(true);
      setMessage(`申請已送出，案件編號：${result.reference}`);
      formRef.current?.reset();
      setStartedAt(Date.now());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "送出失敗，請稍後再試。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={submit} className="mx-auto max-w-3xl space-y-6 rounded-[2.5rem] bg-white p-6 shadow-soft md:p-10">
      <input type="hidden" name="startedAt" value={startedAt} />
      <label className="absolute -left-[9999px]" aria-hidden="true">
        網站
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="姓名 *"><input name="name" required maxLength={80} autoComplete="name" className="form-control" /></Field>
        <Field label="電話 *"><input name="phone" required maxLength={30} inputMode="tel" autoComplete="tel" className="form-control" placeholder="例如：0912-345-678" /></Field>
      </div>

      <Field label="地址">
        <input name="address" maxLength={200} autoComplete="street-address" className="form-control" placeholder="可填寫問題發生地點或聯絡地址" />
      </Field>

      <Field label="服務分類 *">
        <select name="category" required defaultValue="" className="form-control">
          <option value="" disabled>請選擇分類</option>
          {serviceRequestCategories.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
      </Field>

      <Field label="問題內容 *">
        <textarea name="content" required maxLength={4000} rows={8} className="form-control" placeholder="請描述需要協助的事情、發生時間與希望我們如何聯繫您。" />
      </Field>

      <Field label="照片（選填）">
        <input name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple className="form-control file:mr-4 file:rounded-full file:border-0 file:bg-rose file:px-5 file:py-2 file:font-bold file:text-white" />
        <p className="mt-2 text-sm leading-6 text-forest/55">最多 5 張；每張不超過 5MB；支援 JPG、PNG、WebP。照片僅供服務團隊於後台查看。</p>
      </Field>

      <label className="flex items-start gap-3 rounded-2xl bg-cream p-4 text-sm leading-6 text-forest/65">
        <input type="checkbox" name="isTest" value="true" className="mt-1 h-4 w-4 accent-rose" />
        <span>這是一筆測試資料。測試案件會在後台明確標示，方便驗收後刪除。</span>
      </label>

      {message && <p className={`rounded-2xl p-4 font-bold ${success ? "bg-emerald-50 text-forest" : "bg-pink-50 text-rose"}`}>{message}</p>}

      <button disabled={submitting} className="w-full rounded-full bg-forest px-7 py-4 text-lg font-bold text-white transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50">
        {submitting ? "送出中..." : "送出服務申請"}
      </button>
      <p className="text-center text-sm leading-6 text-forest/55">送出後，服務團隊會依案件狀況與您聯繫。緊急狀況請直接撥打 110、119 或相關專線。</p>
    </form>
  );
}

async function compressPhoto(file: File) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("照片僅支援 JPG、PNG 或 WebP。");
  }
  const bitmap = await createImageBitmap(file);
  const maxWidth = 1400;
  const scale = Math.min(1, maxWidth / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.75));
  if (!blob) throw new Error("照片處理失敗，請重新選擇。");
  if (blob.size > 5 * 1024 * 1024) throw new Error("單張照片不可超過 5MB。");
  return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, { type: "image/webp" });
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-bold text-forest/75">{label}</span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}
