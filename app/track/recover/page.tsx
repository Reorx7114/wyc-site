import { BackHomeLink } from "@/components/BackHomeLink";
import { SectionTitle } from "@/components/SectionTitle";
import { ServiceRequestRecoverForm } from "@/components/ServiceRequestRecoverForm";

export const metadata = {
  title: "找回案件編號｜王永才",
  description: "使用申請人姓名與電話，找回服務申請案件編號。"
};

export default function RecoverTrackPage() {
  return (
    <section className="section-space page-shell">
      <div className="text-center"><BackHomeLink /></div>
      <SectionTitle eyebrow="忘記案件編號" title="找回案件編號" description="請輸入申請時填寫的姓名與完整電話。" />
      <ServiceRequestRecoverForm />
    </section>
  );
}
