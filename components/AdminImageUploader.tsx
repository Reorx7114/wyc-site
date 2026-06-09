"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type EditorFields = {
  type: "blog" | "events";
  slug: HTMLInputElement;
  content: HTMLTextAreaElement;
};

function setNativeValue(element: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const prototype = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, "value")?.set?.call(element, value);
  element.dispatchEvent(new Event("input", { bubbles: true }));
}

function currentEditor(): EditorFields | null {
  const activeTab = Array.from(document.querySelectorAll("button")).find((button) =>
    button.className.includes("bg-forest") &&
    ["網誌文章", "近期活動", "短影音"].includes(button.textContent?.trim() ?? "")
  )?.textContent?.trim();

  if (!activeTab || activeTab === "短影音") return null;
  const form = document.querySelector("form");
  const slug = form?.querySelector("input") as HTMLInputElement | null;
  const textareas = form?.querySelectorAll("textarea");
  const content = textareas?.item((textareas.length ?? 1) - 1) as HTMLTextAreaElement | null;
  if (!form || !slug || !content) return null;
  return { type: activeTab === "近期活動" ? "events" : "blog", slug, content };
}

function ensureEditorTarget() {
  const existing = document.getElementById("article-image-insert");
  const editor = currentEditor();
  if (!editor) {
    existing?.remove();
    return null;
  }
  if (existing?.previousElementSibling === editor.content.parentElement) return existing;
  const target = existing ?? document.createElement("div");
  target.id = "article-image-insert";
  editor.content.parentElement?.insertAdjacentElement("afterend", target);
  return target;
}

function automaticSlug(type: EditorFields["type"]) {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0")
  ].join("");
  return `${type === "blog" ? "post" : "event"}-${stamp}`;
}

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

export function AdminImageUploader({ password }: { password: string }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const refresh = () => setTarget(ensureEditorTarget());
    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      document.getElementById("article-image-insert")?.remove();
    };
  }, []);

  async function insertImages(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    const editor = currentEditor();
    if (!editor || !selected.length) return;

    const slug = editor.slug.value.trim() || automaticSlug(editor.type);
    if (!editor.slug.value.trim()) setNativeValue(editor.slug, slug);
    const cursor = editor.content.selectionStart ?? editor.content.value.length;

    setUploading(true);
    setMessage(`正在插入 ${selected.length} 張照片...`);
    try {
      const data = new FormData();
      data.append("type", editor.type);
      data.append("slug", slug);
      const files = await Promise.all(selected.map(compressImage));
      files.forEach((file) => data.append("files", file));
      const response = await fetch("/api/admin/content-images", {
        method: "POST",
        headers: { "x-admin-password": password },
        body: data
      });
      const result = await response.json();
      if (!result.ok) throw new Error(result.message || "照片上傳失敗。");

      const markdown = result.images
        .map((image: { url: string }) => `![活動照片](${image.url})`)
        .join("\n\n");
      const before = editor.content.value.slice(0, cursor);
      const after = editor.content.value.slice(cursor);
      const insertion = `${before && !before.endsWith("\n") ? "\n\n" : ""}${markdown}\n\n`;
      setNativeValue(editor.content, `${before}${insertion}${after}`);
      requestAnimationFrame(() => {
        const nextCursor = before.length + insertion.length;
        editor.content.focus();
        editor.content.setSelectionRange(nextCursor, nextCursor);
      });
      setMessage(`已插入 ${result.images.length} 張照片，可以繼續輸入文字。`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "照片上傳失敗。");
    } finally {
      setUploading(false);
    }
  }

  if (!target) return null;
  return createPortal(
    <div className="rounded-2xl border border-rose/20 bg-pink-50 p-4">
      <p className="text-sm leading-6 text-forest/60">把游標放在文章內想加入照片的位置，再按下插入圖片。</p>
      <label className={`mt-3 inline-flex cursor-pointer rounded-full bg-rose px-5 py-3 font-bold text-white ${uploading ? "pointer-events-none opacity-50" : ""}`}>
        {uploading ? "照片插入中..." : "插入圖片"}
        <input className="sr-only" type="file" accept="image/*" multiple onChange={insertImages} disabled={uploading} />
      </label>
      {message && <p className="mt-3 font-bold text-forest">{message}</p>}
    </div>,
    target
  );
}
