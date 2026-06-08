# 王永才｜葫蘆里個人品牌／競選官網

以 Next.js App Router、TypeScript 與 Tailwind CSS 製作的個人品牌／競選官網。

目前已升級為「可接資料庫的真正後台」：

- 未設定資料庫時：使用本地 Markdown／TypeScript 範例內容。
- 設定 Supabase 後：後台可新增與修改文章、活動、短影音，並永久保存。

## 本機開發

```bash
npm install
npm run dev
```

開啟 `http://localhost:3000`。

## 後台登入

本機開啟：

```text
http://localhost:3000/admin/login
```

預設示範密碼為 `28122288`。正式上線請在 Vercel 設定：

```text
ADMIN_PASSWORD=你的正式密碼
```

## 啟用真正可編輯後台

1. 建立 Supabase 專案。
2. 在 Supabase SQL Editor 執行 `supabase-schema.sql`。
3. 在 Vercel Project Settings → Environment Variables 設定：

```text
ADMIN_PASSWORD=你的正式後台密碼
SUPABASE_URL=https://你的專案.supabase.co
SUPABASE_SERVICE_ROLE_KEY=你的 service_role key
```

4. 重新部署 Vercel。

完成後，後台儲存內容會寫入 Supabase，公開網站會讀取最新資料。

## 新增網誌

在 `content/blog` 新增 `.md` 檔案，檔名會成為網址 slug：

```md
---
title: "文章標題"
date: "2026-06-06"
category: "地方日常"
coverImage: "圖片網址或 /images/example.jpg"
excerpt: "文章摘要"
---

文章 Markdown 內文。
```

## 新增活動

在 `content/events` 新增 `.md` 檔案：

```md
---
title: "活動名稱"
date: "2026-06-21"
location: "活動地點"
coverImage: "圖片網址或 /images/example.jpg"
excerpt: "活動摘要"
---

活動 Markdown 內文。
```

## 新增影片

編輯 `data/videos.ts`，在 `videos` 陣列新增一筆資料。`type` 可使用 `youtube` 或 `mp4`；YouTube 請填入 embed 網址。

## 部署到 Vercel

1. 將專案推送至 GitHub。
2. 在 Vercel 選擇 **Add New Project** 並匯入該 repository。
3. Framework Preset 選擇 **Next.js**。
4. 不需要設定環境變數，直接部署。

每次新增或修改 Markdown／影片資料後，提交並推送至 GitHub，Vercel 就會自動重新部署。

網站內也提供 `/update-guide` 內容更新指南頁面。
