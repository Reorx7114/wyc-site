import { BackHomeLink } from "@/components/BackHomeLink";
import { EventCard } from "@/components/EventCard";
import { EmptyState } from "@/components/EmptyState";
import { SectionTitle } from "@/components/SectionTitle";
import { getContentItems } from "@/lib/cms";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await getContentItems("events");
  return (
    <section className="section-space page-shell">
      <div className="text-center"><BackHomeLink /></div>
      <SectionTitle eyebrow="一起見面" title="近期活動" description="歡迎來坐坐、聊聊，也把你關心的事告訴我們。" />
      {events.length ? <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">{events.map((event) => <EventCard key={event.slug} event={event} />)}</div> : <EmptyState title="活動整理中" description="目前尚未發布活動紀錄，之後可從後台新增。" />}
    </section>
  );
}
