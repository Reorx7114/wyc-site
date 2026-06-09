import { AdminLoginForm } from "@/components/AdminLoginForm";
import { BackHomeLink } from "@/components/BackHomeLink";

export default function AdminLoginPage() {
  return (
    <section className="section-space page-shell text-center">
      <BackHomeLink />
      <p className="font-bold tracking-[.2em] text-rose">後台登入</p>
      <h1 className="mt-4 text-4xl font-black text-forest md:text-5xl">王永才官網管理入口</h1>
      <p className="mx-auto mb-10 mt-5 max-w-2xl text-lg leading-8 text-forest/65">
        登入後可新增或修改文章、活動與短影音。
      </p>
      <AdminLoginForm />
    </section>
  );
}
