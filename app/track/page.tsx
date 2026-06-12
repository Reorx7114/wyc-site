import { BackHomeLink } from "@/components/BackHomeLink";
import { SectionTitle } from "@/components/SectionTitle";
import { ServiceRequestTrackForm } from "@/components/ServiceRequestTrackForm";

export const metadata = {
  title: "案件進度查詢｜王永才",
  description: "使用案件編號與電話末四碼，查詢服務申請案件的處理進度。"
};

export default function TrackPage() {
  return (
    <section className="section-space page-shell">
      <div className="text-center"><BackHomeLink /></div>
      <SectionTitle eyebrow="服務進度" title="案件進度查詢" description="請輸入案件編號與申請時電話的末四碼。" />
      <ServiceRequestTrackForm />
    </section>
  );
}
