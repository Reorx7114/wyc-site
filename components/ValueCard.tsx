type Props = { icon: string; title: string; description: string };

export function ValueCard({ icon, title, description }: Props) {
  return (
    <div className="rounded-[2rem] border border-forest/5 bg-white p-6 text-center shadow-soft transition hover:-translate-y-1">
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-blush/60 text-2xl">{icon}</div>
      <h3 className="text-xl font-black text-forest">{title}</h3>
      <p className="mt-2 leading-7 text-forest/65">{description}</p>
    </div>
  );
}
