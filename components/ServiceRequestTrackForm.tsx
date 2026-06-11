"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import type { PublicTrackingResult } from "@/lib/service-requests";

export function ServiceRequestTrackForm() {
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<PublicTrackingResult | null>(null);
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage("查詢中..."); setResult(null);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/service-requests/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reference: form.get("reference"), phoneLast4: form.get("phoneLast4"), website: form.get("website"), startedAt }) });
    const data = await response.json(); setResult(data.result ?? null); setMessage(data.ok ? "" : data.message || "目前無法查詢，請稍後再試。"); setStartedAt(Date.now()); setLoading(false);
  }
  return <div className="mx-auto max-w-3xl"><form onSubmit={submit} className="space-y-6 rounded-[2.5rem] bg-white p-6 shadow-soft md:p-10"><label className="absolute -left-[9999px]" aria-hidden="true">網站<input name="website" tabIndex={-1} autoComplete="off" /></label><label className="block"><span className="font-bold text-forest/75">案件編號</span><input name="reference" required className="form-control mt-2 uppercase" placeholder="例如：SR-6X8P3N" autoComplete="off" /></label><label className="block"><span className="font-bold text-forest/75">電話末四碼</span><input name="phoneLast4" required inputMode="numeric" pattern="[0-9]{4}" maxLength={4} className="form-control mt-2" placeholder="請輸入申請時電話的末四碼" autoComplete="off" /></label>{message && <p className="rounded-2xl bg-pink-50 p-4 font-bold text-rose">{message}</p>}<button disabled={loading} className="w-full rounded-full bg-forest px-7 py-4 text-lg font-bold text-white disabled:opacity-50">{loading ? "查詢中..." : "查詢案件進度"}</button><p className="text-center text-sm text-forest/55">忘記案件編號？<Link href="/track/recover" className="font-bold text-rose underline">找回案件編號</Link></p></form>{result && <article className="mt-8 rounded-[2.5rem] bg-white p-6 shadow-soft md:p-10"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-bold text-rose">案件編號</p><h2 className="mt-1 text-3xl font-black text-forest">{result.publicReference}</h2></div><span className="rounded-full bg-blush px-5 py-3 font-black text-forest">{result.status}</span></div><dl className="mt-7 grid gap-5 rounded-2xl bg-cream p-5 md:grid-cols-2"><div><dt className="font-bold text-forest/60">建立時間</dt><dd className="mt-1 text-forest">{new Date(result.createdAt).toLocaleString("zh-TW")}</dd></div><div><dt className="font-bold text-forest/60">最後更新</dt><dd className="mt-1 text-forest">{new Date(result.updatedAt).toLocaleString("zh-TW")}</dd></div></dl><div className="mt-6"><p className="font-bold text-forest/60">服務團隊回覆</p><p className="mt-2 whitespace-pre-wrap rounded-2xl border border-forest/10 p-5 leading-8 text-forest/80">{result.publicReply || "案件已收到，服務團隊將依處理進度更新回覆。"}</p></div></article>}</div>;
}
