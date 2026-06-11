import { BackHomeLink } from "@/components/BackHomeLink";
import { SectionTitle } from "@/components/SectionTitle";
import { ServiceRequestForm } from "@/components/ServiceRequestForm";

export const metadata = {
  title: "服務申請｜王永才",
  description: "聯繫王永才服務團隊，反映社區問題、長照協助、急難救助、基金會服務與活動合作需求。"
};

export default function ServiceRequestPage() {
  return (
    <section className="section-space page-shell">
      <div className="text-center"><BackHomeLink /></div>
      <SectionTitle
        eyebrow="我要聯繫永才"
        title="服務申請・問題反映"
        description="請留下需要協助的事情與聯絡方式，服務團隊會仔細閱讀並盡快與您聯繫。"
      />
      <ServiceRequestForm />
    </section>
  );
}
