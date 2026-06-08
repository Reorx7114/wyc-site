import Link from "next/link";
import { SectionTitle } from "@/components/SectionTitle";

const items = [
  {
    title: "後台可編輯內容",
    path: "/admin/login",
    description: "登入後可新增或修改網誌文章、近期活動、短影音。"
  },
  {
    title: "永久儲存資料",
    path: "Supabase",
    description: "需要建立 Supabase 專案並設定環境變數，後台送出的內容才會永久保存。"
  },
  {
    title: "本地備援內容",
    path: "/content 與 /data",
    description: "資料庫尚未設定時，網站仍會讀取本地 Markdown 與 TypeScript 範例內容。"
  }
];

export default function UpdateGuidePage() {
  return (
    <section className="section-space page-shell">
      <SectionTitle
        eyebrow="網站內容管理"
        title="現在可以做真正後台了"
        description="這版已經具備後台表單與 API。只要完成 Supabase 與 Vercel 環境變數設定，就能在上線後編輯並永久保存內容。"
      />
      <div className="mx-auto max-w-4xl space-y-6">
        {items.map((item, index) => (
          <article key={item.title} className="rounded-[2rem] bg-white p-7 shadow-soft md:p-9">
            <div className="flex gap-5">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-blush font-black text-forest">{index + 1}</span>
              <div>
                <h2 className="text-2xl font-black text-forest">{item.title}</h2>
                <code className="mt-3 inline-block rounded-lg bg-cream px-3 py-2 font-bold text-rose">{item.path}</code>
                <p className="mt-4 text-lg leading-8 text-forest/65">{item.description}</p>
              </div>
            </div>
          </article>
        ))}
        <div className="rounded-[2rem] bg-forest p-8 text-white">
          <h2 className="text-2xl font-black">上線前要準備</h2>
          <p className="mt-3 text-lg leading-8 text-white/75">
            請在 Supabase 執行 `supabase-schema.sql`，並在 Vercel 設定 `ADMIN_PASSWORD`、`SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`。
          </p>
          <Link href="/admin/login" className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-bold text-forest">
            前往後台登入
          </Link>
        </div>
      </div>
    </section>
  );
}
