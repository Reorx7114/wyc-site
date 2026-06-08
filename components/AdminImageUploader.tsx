"use client";

import { FormEvent, useEffect, useState } from "react";

type ImageTarget = {
  label: string;
  path: string;
};

export function AdminImageUploader({ password }: { password: string }) {
  const [configured, setConfigured] = useState(false);
  const [targets, setTargets] = useState<ImageTarget[]>([]);
  const [path, setPath] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function loadTargets() {
      const response = await fetch("/api/admin/images", { cache: "no-store" });
      const result = await response.json();
      setConfigured(Boolean(result.configured));
      setTargets(result.targets ?? []);
      setPath(result.targets?.[0]?.path ?? "");
    }

    loadTargets();
  }, []);

  async function uploadImage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setMessage("請先選擇圖片檔。");
      return;
    }

    setBusy(true);
    setMessage("圖片同步中...");

    const formData = new FormData();
    formData.append("path", path);
    formData.append("file", file);

    const response = await fetch("/api/admin/images", {
      method: "POST",
      headers: { "x-admin-password": password },
      body: formData
    });
    const result = await response.json();

    setBusy(false);
    setMessage(result.ok ? result.message : result.message || "圖片同步失敗");
    if (result.ok) setFile(null);
  }

  return (
    <section className="mb-8 rounded-[2rem] bg-white p-7 shadow-soft">
      <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
        <div>
          <p className="font-bold tracking-[.2em] text-rose">圖片同步</p>
          <h2 className="mt-2 text-2xl font-black text-forest">上傳圖片到 GitHub</h2>
          <p className="mt-3 leading-7 text-forest/65">
            圖片會直接 commit 到 GitHub main，Vercel 會依照正式流程自動重新部署。
          </p>
          {!configured && (
            <p className="mt-3 rounded-2xl bg-pink-50 p-4 leading-7 text-forest/70">
              尚未設定 GitHub 圖片同步。請在 Vercel Environment Variables 設定 GITHUB_CONTENT_TOKEN。
            </p>
          )}
        </div>

        <form onSubmit={uploadImage} className="space-y-4">
          <label className="block">
            <span className="font-bold text-forest/70">要替換的位置</span>
            <select
              value={path}
              onChange={(event) => setPath(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-forest/10 bg-cream px-4 py-3 outline-none focus:border-rose"
            >
              {targets.map((target) => (
                <option key={target.path} value={target.path}>
                  {target.label} - {target.path}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="font-bold text-forest/70">圖片檔</span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="mt-2 w-full rounded-2xl border border-forest/10 bg-cream px-4 py-3 outline-none focus:border-rose"
            />
          </label>

          <button
            disabled={!configured || !file || busy}
            className="rounded-full bg-forest px-7 py-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "同步中..." : "同步到 GitHub"}
          </button>

          {message && <p className="rounded-2xl bg-cream p-4 font-bold text-forest">{message}</p>}
        </form>
      </div>
    </section>
  );
}
