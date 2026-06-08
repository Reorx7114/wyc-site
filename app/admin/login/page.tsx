import { AdminLoginForm } from "@/components/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <section className="section-space page-shell text-center">
      <p className="font-bold tracking-[.2em] text-rose">後台登入</p>
      <h1 className="mt-4 text-4xl font-black text-forest md:text-5xl">王永才官網管理入口</h1>
      <p className="mx-auto mb-10 mt-5 max-w-2xl text-lg leading-8 text-forest/65">
        登入後可查看文章、活動與短影音的更新位置。這一版維持本地檔案管理，不串資料庫。
      </p>
      <AdminLoginForm />
    </section>
  );
}
