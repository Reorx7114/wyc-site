"use client";

import { FormEvent, useEffect, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import type { ContentItem } from "@/lib/markdown";
import type { Video } from "@/data/videos";
import { AdminServiceRequests } from "@/components/AdminServiceRequests";

type AdminData = {
  configured: boolean;
  blog: ContentItem[];
  events: ContentItem[];
  videos: Video[];
};

const emptyContent: ContentItem = {
  slug: "",
  title: "",
  date: new Date().toISOString().slice(0, 10),
  excerpt: "",
  coverImage: "",
  endImages: [],
  category: "",
  location: "",
  content: ""
};

const emptyVideo: Video = {
  slug: "",
  title: "",
  description: "",
  category: "地方日常",
  type: "youtube",
  src: "",
  date: new Date().toISOString().slice(0, 10)
};

export function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [data, setData] = useState<AdminData | null>(null);
  const [tab, setTab] = useState<"blog" | "events" | "videos" | "service-requests">("blog");
  const [contentForm, setContentForm] = useState<ContentItem>(emptyContent);
  const [videoForm, setVideoForm] = useState<Video>(emptyVideo);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedPassword = window.localStorage.getItem("wang-admin-password") || "";
    if (!savedPassword) {
      window.location.href = "/admin/login";
      return;
    }
    setPassword(savedPassword);
    loadData();
  }, []);

  async function loadData() {
    const response = await fetch("/api/admin/content", { cache: "no-store" });
    setData(await response.json());
  }

  async function saveContent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data?.configured) {
      setMessage("內容管理功能目前尚未開放，請聯絡網站管理人員。");
      return;
    }
    setMessage("儲存中...");
    const response = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ kind: tab, item: contentForm })
    });
    const result = await response.json();
    setMessage(result.ok ? "已儲存，公開網站會顯示最新內容。" : result.message || "儲存失敗");
    if (result.ok) {
      setContentForm(emptyContent);
      await loadData();
    }
  }

  async function saveVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data?.configured) {
      setMessage("內容管理功能目前尚未開放，請聯絡網站管理人員。");
      return;
    }
    setMessage("儲存中...");
    const response = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ kind: "videos", item: videoForm })
    });
    const result = await response.json();
    setMessage(result.ok ? "已儲存影片資料。" : result.message || "儲存失敗");
    if (result.ok) {
      setVideoForm(emptyVideo);
      await loadData();
    }
  }

  async function deleteItem(kind: "blog" | "events" | "videos", slug: string) {
    if (!data?.configured) {
      setMessage("內容管理功能目前尚未開放，請聯絡網站管理人員。");
      return;
    }
    if (!window.confirm(`確定要刪除 ${slug} 嗎？文章內上傳的照片也會一起刪除。`)) return;
    setMessage("刪除中...");
    const response = await fetch("/api/admin/content", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ kind, slug })
    });
    const result = await response.json();
    setMessage(result.ok ? "已刪除。" : result.message || "刪除失敗");
    if (result.ok) await loadData();
  }

  const contentList = tab === "events" ? data?.events ?? [] : data?.blog ?? [];
  const disabled = data ? !data.configured : true;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-bold tracking-[.2em] text-rose">王永才官網後台</p>
          <h1 className="mt-3 text-4xl font-black text-forest">內容管理</h1>
          <p className="mt-3 text-lg leading-8 text-forest/65">可新增或修改文章、活動與短影音。</p>
          <p className="mt-2 text-base leading-7 text-forest/55">如需修改後台密碼，請聯絡網站管理人員。</p>
        </div>
        <button
          onClick={() => {
            window.localStorage.removeItem("wang-admin-password");
            window.location.href = "/admin/login";
          }}
          className="rounded-full border border-forest/15 bg-white px-5 py-3 font-bold text-forest"
        >
          登出
        </button>
      </div>

      {data && !data.configured && (
        <div className="mb-8 rounded-[2rem] border border-rose/20 bg-pink-50 p-6 text-forest">
          <b className="text-rose">內容管理功能停用中。</b>
          <p className="mt-2 leading-7">此功能尚未開放，請聯絡網站管理人員協助處理。</p>
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-3">
        <TabButton active={tab === "blog"} onClick={() => setTab("blog")}>網誌文章</TabButton>
        <TabButton active={tab === "events"} onClick={() => setTab("events")}>近期活動</TabButton>
        <TabButton active={tab === "videos"} onClick={() => setTab("videos")}>短影音</TabButton>
        <TabButton active={tab === "service-requests"} onClick={() => setTab("service-requests")}>案件管理</TabButton>
      </div>

      {message && <p className="mb-6 rounded-2xl bg-white p-4 font-bold text-forest shadow-soft">{message}</p>}

      {tab === "service-requests" ? (
        <AdminServiceRequests password={password} />
      ) : tab === "videos" ? (
        <VideoEditor form={videoForm} setForm={setVideoForm} onSubmit={saveVideo} videos={data?.videos ?? []} disabled={disabled} onDelete={(slug) => deleteItem("videos", slug)} />
      ) : (
        <ContentEditor type={tab} form={contentForm} setForm={setContentForm} onSubmit={saveContent} items={contentList} disabled={disabled} password={password} onDelete={(slug) => deleteItem(tab, slug)} setMessage={setMessage} />
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return <button onClick={onClick} className={`rounded-full px-5 py-3 font-bold ${active ? "bg-forest text-white" : "bg-white text-forest"}`}>{children}</button>;
}

function TextInput({ label, value, onChange, type = "text" }: { label: string; value?: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="font-bold text-forest/70">{label}</span>
      <input type={type} value={value ?? ""} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-2xl border border-forest/10 bg-cream px-4 py-3 outline-none focus:border-rose" />
    </label>
  );
}

function TextArea({ label, value, onChange, rows = 5 }: { label: string; value?: string; onChange: (value: string) => void; rows?: number }) {
  return (
    <label className="block">
      <span className="font-bold text-forest/70">{label}</span>
      <textarea rows={rows} value={value ?? ""} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-2xl border border-forest/10 bg-cream px-4 py-3 outline-none focus:border-rose" />
    </label>
  );
}

async function compressImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const maxWidth = 1800;
  const scale = Math.min(1, maxWidth / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
  if (!blob) throw new Error("照片處理失敗，請重新選擇。");
  return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, { type: "image/webp" });
}

function automaticSlug(type: "blog" | "events") {
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

function ContentEditor({ type, form, setForm, onSubmit, items, disabled, password, onDelete, setMessage }: {
  type: "blog" | "events";
  form: ContentItem;
  setForm: (value: ContentItem) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  items: ContentItem[];
  disabled: boolean;
  password: string;
  onDelete: (slug: string) => void;
  setMessage: (message: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  async function uploadImages(event: ChangeEvent<HTMLInputElement>, purpose: "cover" | "end") {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!selected.length) return;

    const slug = form.slug.trim() || automaticSlug(type);
    const nextForm = form.slug.trim() ? form : { ...form, slug };
    if (!form.slug.trim()) setForm(nextForm);

    setUploading(true);
    setMessage(purpose === "cover" ? "正在上傳封面圖..." : `正在加入 ${selected.length} 張圖片...`);
    try {
      const chosen = purpose === "cover" ? selected.slice(0, 1) : selected;
      const files = await Promise.all(chosen.map(compressImage));
      const formData = new FormData();
      formData.append("type", type);
      formData.append("slug", slug);
      files.forEach((file) => formData.append("files", file));
      const response = await fetch("/api/admin/content-images", {
        method: "POST",
        headers: { "x-admin-password": password },
        body: formData
      });
      const result = await response.json();
      if (!result.ok) throw new Error(result.message || "照片上傳失敗。");
      const urls = result.images.map((image: { url: string }) => image.url);
      setForm(purpose === "cover"
        ? { ...nextForm, coverImage: urls[0] }
        : { ...nextForm, endImages: [...(nextForm.endImages ?? []), ...urls] });
      setMessage(purpose === "cover" ? "封面圖已設定。" : `已加入 ${urls.length} 張圖片。`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "照片上傳失敗。");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
      <form onSubmit={onSubmit} className="space-y-5 rounded-[2rem] bg-white p-7 shadow-soft">
        <h2 className="text-2xl font-black text-forest">{type === "blog" ? "編輯網誌文章" : "編輯近期活動"}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput label="網址名稱" value={form.slug} onChange={(slug) => setForm({ ...form, slug })} />
          <TextInput label="日期" type="date" value={form.date} onChange={(date) => setForm({ ...form, date })} />
        </div>
        <p className="-mt-3 text-sm leading-6 text-forest/55">網址名稱請使用英文與短橫線，例如：public-hearing-2026。</p>
        <TextInput label="標題" value={form.title} onChange={(title) => setForm({ ...form, title })} />
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput label={type === "blog" ? "分類" : "活動地點"} value={type === "blog" ? form.category : form.location} onChange={(value) => setForm(type === "blog" ? { ...form, category: value } : { ...form, location: value })} />
          <TextInput label="封面圖片網址（自動填入）" value={form.coverImage} onChange={(coverImage) => setForm({ ...form, coverImage })} />
        </div>
        <div className="rounded-2xl border border-rose/20 bg-pink-50 p-5">
          <p className="font-bold text-forest">封面圖</p>
          <p className="mt-1 text-sm leading-6 text-forest/60">會顯示在文章列表、文章頂部與分享預覽。沒有封面圖時，前台不會保留空白圖片區。</p>
          {form.coverImage && <img src={form.coverImage} alt="封面圖預覽" className="mt-4 h-40 w-full rounded-2xl object-cover" />}
          <div className="mt-4 flex flex-wrap gap-3">
            <label className={`inline-flex cursor-pointer rounded-full bg-rose px-6 py-3 font-bold text-white ${disabled || uploading ? "pointer-events-none opacity-50" : ""}`}>
              {uploading ? "照片上傳中..." : "選擇封面圖"}
              <input className="sr-only" type="file" accept="image/*" onChange={(event) => uploadImages(event, "cover")} disabled={disabled || uploading} />
            </label>
            {form.coverImage && <button type="button" onClick={() => setForm({ ...form, coverImage: "" })} className="rounded-full border border-rose/30 px-5 py-3 font-bold text-rose">移除封面圖</button>}
          </div>
        </div>
        <TextArea label="摘要" value={form.excerpt} onChange={(excerpt) => setForm({ ...form, excerpt })} rows={3} />
        <TextArea label="文章內文" value={form.content} onChange={(content) => setForm({ ...form, content })} rows={14} />
        <div className="rounded-2xl border border-rose/20 bg-pink-50 p-5">
          <p className="font-bold text-forest">插入圖片</p>
          <p className="mt-1 text-sm leading-6 text-forest/60">可一次選擇多張圖片，會依選擇順序顯示於文章下方。</p>
          {(form.endImages?.length ?? 0) > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
              {(form.endImages ?? []).map((image, index) => (
                <div key={`${image}-${index}`} className="relative">
                  <img src={image} alt={`文末圖片 ${index + 1}`} className="h-28 w-full rounded-xl object-cover" />
                  <button type="button" onClick={() => setForm({ ...form, endImages: (form.endImages ?? []).filter((_, imageIndex) => imageIndex !== index) })} className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-bold text-rose">移除</button>
                </div>
              ))}
            </div>
          )}
          <label className={`mt-4 inline-flex cursor-pointer rounded-full bg-rose px-6 py-3 font-bold text-white ${disabled || uploading ? "pointer-events-none opacity-50" : ""}`}>
            {uploading ? "照片上傳中..." : "插入圖片"}
            <input className="sr-only" type="file" accept="image/*" multiple onChange={(event) => uploadImages(event, "end")} disabled={disabled || uploading} />
          </label>
        </div>
        <button disabled={disabled || uploading} className="rounded-full bg-forest px-7 py-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">儲存並發布</button>
      </form>
      <ExistingList items={items} onEdit={(item) => setForm(item)} onDelete={onDelete} disabled={disabled} />
    </div>
  );
}

function VideoEditor({ form, setForm, onSubmit, videos, disabled, onDelete }: {
  form: Video;
  setForm: (value: Video) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  videos: Video[];
  disabled: boolean;
  onDelete: (slug: string) => void;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
      <form onSubmit={onSubmit} className="space-y-5 rounded-[2rem] bg-white p-7 shadow-soft">
        <h2 className="text-2xl font-black text-forest">編輯短影音</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput label="網址名稱" value={form.slug} onChange={(slug) => setForm({ ...form, slug })} />
          <TextInput label="日期" type="date" value={form.date} onChange={(date) => setForm({ ...form, date })} />
        </div>
        <TextInput label="標題" value={form.title} onChange={(title) => setForm({ ...form, title })} />
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput label="分類" value={form.category} onChange={(category) => setForm({ ...form, category: category as Video["category"] })} />
          <TextInput label="類型 youtube / mp4" value={form.type} onChange={(value) => setForm({ ...form, type: value as Video["type"] })} />
        </div>
        <TextInput label="YouTube 影片網址或 mp4 網址" value={form.src} onChange={(src) => setForm({ ...form, src })} />
        <TextArea label="說明" value={form.description} onChange={(description) => setForm({ ...form, description })} rows={5} />
        <button disabled={disabled} className="rounded-full bg-forest px-7 py-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">儲存</button>
      </form>
      <div className="space-y-4">
        {videos.length ? videos.map((video) => (
          <div key={video.slug} className="rounded-2xl bg-white p-5 shadow-soft">
            <button onClick={() => setForm(video)} className="block w-full text-left">
              <b className="text-forest">{video.title}</b>
              <p className="mt-1 text-sm text-forest/60">{video.category} ・ {video.date}</p>
            </button>
            <button disabled={disabled} onClick={() => onDelete(video.slug)} className="mt-4 rounded-full border border-rose/30 px-4 py-2 text-sm font-bold text-rose disabled:cursor-not-allowed disabled:opacity-40">刪除</button>
          </div>
        )) : <AdminEmptyList message="目前還沒有短影音資料，新增後會出現在這裡。" />}
      </div>
    </div>
  );
}

function ExistingList({ items, onEdit, onDelete, disabled }: { items: ContentItem[]; onEdit: (item: ContentItem) => void; onDelete: (slug: string) => void; disabled: boolean }) {
  return (
    <div className="space-y-4">
      {items.length ? items.map((item) => (
        <div key={item.slug} className="rounded-2xl bg-white p-5 shadow-soft">
          <button onClick={() => onEdit(item)} className="block w-full text-left">
            <b className="text-forest">{item.title}</b>
            <p className="mt-1 text-sm text-forest/60">{item.date} ・ {item.slug}</p>
          </button>
          <button disabled={disabled} onClick={() => onDelete(item.slug)} className="mt-4 rounded-full border border-rose/30 px-4 py-2 text-sm font-bold text-rose disabled:cursor-not-allowed disabled:opacity-40">刪除</button>
        </div>
      )) : <AdminEmptyList message="目前還沒有內容資料，新增後會出現在這裡。" />}
    </div>
  );
}

function AdminEmptyList({ message }: { message: string }) {
  return <p className="rounded-2xl bg-white p-5 leading-7 text-forest/60 shadow-soft">{message}</p>;
}
