"use client";

import { ChangeEvent, useState } from "react";

async function compressImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1800 / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
  if (!blob) throw new Error("照片處理失敗，請重新選擇。");
  return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, { type: "image/webp" });
}

function activeContentForm() {
  const active = Array.from(document.querySelectorAll("button")).find((button) =>
    button.className.includes("bg-forest") && ["網誌文章", "近期活動", "短影音"].includes(button.textContent?.trim() ?? "")
  );
  const label = active?.textContent?.trim();
  if (label === "短影音") return null;
  const form = document.querySelector("form");
  const slug = form?.querySelector("input") as HTMLInputElement | null;
  const textareas = form?.querySelectorAll("textarea");
  const content = textareas?.item((textareas?.length ?? 1) - 1) as HTMLTextAreaElement | null;
  if (!form || !slug || !content) return null;
  return { type: label === "近期活動" ? "events" : "blog", slug, content };
}

function updateTextarea(textarea: HTMLTextAreaElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
  setter?.call(textarea, value);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

export function AdminImageUploader({ password }: { password: string }) {
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  async function addImages(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    const editor = activeContentForm();
    if (!editor) return setMessage("請先切換到網誌文章或近期活動，再加入照片。");
    if (!editor.slug.value.trim()) return setMessage("請先填寫網址代稱，再加入照片。");
    if (!selected.length) return;

    setUploading(true);
    setMessage(`正在加入 ${selected.length} 張照片...`);
    try {
      const data = new FormData();
      data.append("type", editor.type);
      data.append("slug", editor.slug.value.trim());
      const files = await Promise.all(selected.map(compressImage));
      files.forEach((file) => data.append("files", file));
      const response = await fetch("/api/admin/content-images", {
        method: "POST",
        headers: { "x-admin-password": password },
        body: data
      });
      const result = await response.json();
      if (!result.ok) throw new Error(result.message || "照片上傳失敗。");
      const markdown = result.images.map((image: { url: string }) => `![活動照片](${image.url})`).join("\n\n");
      updateTextarea(editor.content, `${editor.content.value.trimEnd()}\n\n${markdown}\n\n`);
      setMessage(`已加入 ${result.images.length} 張照片，可以繼續輸入文字或儲存發布。`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "照片上傳失敗。");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mb-8 rounded-[2rem] border border-rose/20 bg-white p-6 shadow-soft">
      <p className="font-bold text-forest">在文章中加入照片</p>
      <p className="mt-1 leading-7 text-forest/60">請先切換到網誌文章或近期活動並填寫網址代稱。照片會加入文章末端，可繼續輸入文字。</p>
      <label className={`mt-4 inline-flex cursor-pointer rounded-full bg-rose px-6 py-3 font-bold text-white ${uploading ? "pointer-events-none opacity-50" : ""}`}>
        {uploading ? "照片加入中..." : "加入圖片"}
        <input className="sr-only" type="file" accept="image/*" multiple onChange={addImages} disabled={uploading} />
      </label>
      {message && <p className="mt-4 font-bold text-forest">{message}</p>}
    </div>
  );
}
