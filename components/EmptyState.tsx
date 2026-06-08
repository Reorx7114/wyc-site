export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[2rem] border border-forest/10 bg-white p-8 text-center shadow-soft">
      <p className="text-2xl font-black text-forest">{title}</p>
      <p className="mx-auto mt-3 max-w-2xl text-lg leading-8 text-forest/60">{description}</p>
    </div>
  );
}
