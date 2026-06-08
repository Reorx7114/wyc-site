"use client";

import { FormEvent, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { ContentItem } from "@/lib/markdown";
import type { Video } from "@/data/videos";

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
  const [tab, setTab] = useState<"blog" | "events" | "videos">("blog");
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
    setMessage("儲存中...");
    const response = await fetch("/api/admin/content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password
      },
      body: JSON.stringify({ kind: tab, item: contentForm })
    });
    const result = await response.json();
    setMessage(result.ok ? "已儲存，公開網站會讀取最新資料。" : result.message || "儲存失敗");
    if (result.ok) {
      setContentForm(emptyContent);
      await loadData();
    }
  }

  async function saveVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("儲存中...");
    const response = await fetch("/api/admin/content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password
      },
      body: JSON.stringify({ kind: "videos", item: videoForm })
    });
    const result = await response.json();
    setMessage(result.ok ? "已儲存影片資料。" : result.message || "儲存失敗");
    if (result.ok) {
      setVideoForm(emptyVideo);
      await loadData();
    }
  }

  const contentList = tab === "events" ? data?.events ?? [] : data?.blog ?? [];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-bold tracking-[.2em] text-rose">王永才官網後台</p>
          <h1 className="mt-3 text-4xl font-black text-forest">內容管理</h1>
          <p className="mt-3 text-lg leading-8 text-forest/65">
            可新增或修改文章、活動與短影音。儲存功能需要 Supabase 環境變數。
          </p>
          <p className="mt-2 text-base leading-7 text-forest/55">
            如需修改後台密碼，請至 Vercel Environment Variables 修改 ADMIN_PASSWORD。
          </p>
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
          <b className="text-rose">尚未連接資料庫。</b>
          <p className="mt-2 leading-7">請先建立 Supabase 專案，執行 `supabase-schema.sql`，並在 Vercel 設定 `SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`、`ADMIN_PASSWORD`。完成後這個後台就能真正永久儲存。</p>
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-3">
        <TabButton active={tab === "blog"} onClick={() => setTab("blog")}>網誌文章</TabButton>
        <TabButton active={tab === "events"} onClick={() => setTab("events")}>近期活動</TabButton>
        <TabButton active={tab === "videos"} onClick={() => setTab("videos")}>短影音</TabButton>
      </div>

      {message && <p className="mb-6 rounded-2xl bg-white p-4 font-bold text-forest shadow-soft">{message}</p>}

      {tab === "videos" ? (
        <VideoEditor form={videoForm} setForm={setVideoForm} onSubmit={saveVideo} videos={data?.videos ?? []} />
      ) : (
        <ContentEditor type={tab} form={contentForm} setForm={setContentForm} onSubmit={saveContent} items={contentList} />
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

function ContentEditor({ type, form, setForm, onSubmit, items }: {
  type: "blog" | "events";
  form: ContentItem;
  setForm: (value: ContentItem) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  items: ContentItem[];
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
      <form onSubmit={onSubmit} className="space-y-5 rounded-[2rem] bg-white p-7 shadow-soft">
        <h2 className="text-2xl font-black text-forest">{type === "blog" ? "編輯網誌文章" : "編輯近期活動"}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput label="網址代稱 slug" value={form.slug} onChange={(slug) => setForm({ ...form, slug })} />
          <TextInput label="日期" type="date" value={form.date} onChange={(date) => setForm({ ...form, date })} />
        </div>
        <TextInput label="標題" value={form.title} onChange={(title) => setForm({ ...form, title })} />
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput label={type === "blog" ? "分類" : "活動地點"} value={type === "blog" ? form.category : form.location} onChange={(value) => setForm(type === "blog" ? { ...form, category: value } : { ...form, location: value })} />
          <TextInput label="封面圖片網址" value={form.coverImage} onChange={(coverImage) => setForm({ ...form, coverImage })} />
        </div>
        <TextArea label="摘要" value={form.excerpt} onChange={(excerpt) => setForm({ ...form, excerpt })} rows={3} />
        <TextArea label="Markdown 內文" value={form.content} onChange={(content) => setForm({ ...form, content })} rows={12} />
        <button className="rounded-full bg-forest px-7 py-4 font-bold text-white">儲存</button>
      </form>
      <ExistingList items={items} onEdit={(item) => setForm(item)} />
    </div>
  );
}

function VideoEditor({ form, setForm, onSubmit, videos }: {
  form: Video;
  setForm: (value: Video) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  videos: Video[];
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
      <form onSubmit={onSubmit} className="space-y-5 rounded-[2rem] bg-white p-7 shadow-soft">
        <h2 className="text-2xl font-black text-forest">編輯短影音</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput label="網址代稱 slug" value={form.slug} onChange={(slug) => setForm({ ...form, slug })} />
          <TextInput label="日期" type="date" value={form.date} onChange={(date) => setForm({ ...form, date })} />
        </div>
        <TextInput label="標題" value={form.title} onChange={(title) => setForm({ ...form, title })} />
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput label="分類" value={form.category} onChange={(category) => setForm({ ...form, category: category as Video["category"] })} />
          <TextInput label="類型 youtube / mp4" value={form.type} onChange={(type) => setForm({ ...form, type: type as Video["type"] })} />
        </div>
        <TextInput label="影片網址或 YouTube embed" value={form.src} onChange={(src) => setForm({ ...form, src })} />
        <TextArea label="說明" value={form.description} onChange={(description) => setForm({ ...form, description })} rows={5} />
        <button className="rounded-full bg-forest px-7 py-4 font-bold text-white">儲存</button>
      </form>
      <div className="space-y-4">
        {videos.length ? videos.map((video) => (
          <button key={video.slug} onClick={() => setForm(video)} className="block w-full rounded-2xl bg-white p-5 text-left shadow-soft">
            <b className="text-forest">{video.title}</b>
            <p className="mt-1 text-sm text-forest/60">{video.category} ・ {video.date}</p>
          </button>
        )) : <AdminEmptyList message="目前還沒有短影音資料，新增後會出現在這裡。" />}
      </div>
    </div>
  );
}

function ExistingList({ items, onEdit }: { items: ContentItem[]; onEdit: (item: ContentItem) => void }) {
  return (
    <div className="space-y-4">
      {items.length ? items.map((item) => (
        <button key={item.slug} onClick={() => onEdit(item)} className="block w-full rounded-2xl bg-white p-5 text-left shadow-soft">
          <b className="text-forest">{item.title}</b>
          <p className="mt-1 text-sm text-forest/60">{item.date} ・ {item.slug}</p>
        </button>
      )) : <AdminEmptyList message="目前還沒有內容資料，新增後會出現在這裡。" />}
    </div>
  );
}

function AdminEmptyList({ message }: { message: string }) {
  return <p className="rounded-2xl bg-white p-5 leading-7 text-forest/60 shadow-soft">{message}</p>;
}
