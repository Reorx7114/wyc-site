import { BackHomeLink } from "@/components/BackHomeLink";
import { SectionTitle } from "@/components/SectionTitle";
import { site } from "@/data/site";

export default function ContactPage() {
  return (
    <>
      <section className="section-space page-shell">
        <div className="text-center"><BackHomeLink /></div>
        <SectionTitle eyebrow="永才在這裡" title="聯絡我們" description="不論是一個問題、一個建議，或只是想聊聊，我們都願意好好聽你說。" />
        <div className="grid gap-5 md:grid-cols-2">
          <ContactCard title="服務專線" value={site.phone} detail="有需要，打電話來" />
          <ContactCard title="服務處地址" value={site.address} detail="歡迎來坐坐聊聊" />
        </div>
        <div className="mt-8 grid gap-7 md:grid-cols-2">
          <QrCard title="LINE 官方帳號" description="掃描綠色 QR Code 加入好友，傳訊息給我們。" image="/images/line-qrcode.jpg" />
          <QrCard title="Facebook" description="掃描黑色 QR Code，追蹤王永才的最新服務消息。" image="/images/facebook-qrcode.png" />
        </div>
      </section>
      <section className="bg-pink-50 py-20">
        <div className="page-shell">
          <div className="mx-auto max-w-4xl rounded-[2.5rem] border-2 border-dashed border-rose/30 bg-white/60 p-12 text-center">
            <p className="text-2xl font-black text-forest">Google Form 服務需求表單</p>
            <p className="mt-3 text-forest/60">正式上線時，將 Google Form iframe 貼在此區塊即可。</p>
            <div className="mt-8 grid h-48 place-items-center rounded-2xl bg-cream font-bold text-forest/40">表單預留區</div>
          </div>
        </div>
      </section>
    </>
  );
}

function ContactCard({ title, value, detail }: { title: string; value: string; detail: string }) {
  return <div className="rounded-[2rem] bg-white p-7 shadow-soft"><p className="font-bold text-rose">{title}</p><p className="mt-3 text-2xl font-black text-forest">{value}</p><p className="mt-2 text-forest/60">{detail}</p></div>;
}

function QrCard({ title, description, image }: { title: string; description: string; image: string }) {
  return <div className="grid items-center gap-6 rounded-[2rem] bg-white p-7 shadow-soft sm:grid-cols-[180px_1fr]"><img src={image} alt={`${title} QR Code`} className="mx-auto aspect-square w-full max-w-[180px] rounded-2xl border border-forest/10 bg-white object-contain p-2" /><div><p className="text-2xl font-black text-forest">{title}</p><p className="mt-3 leading-7 text-forest/65">{description}</p></div></div>;
}
