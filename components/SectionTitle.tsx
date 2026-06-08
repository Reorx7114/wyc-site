type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionTitle({ eyebrow, title, description, align = "center" }: Props) {
  return (
    <div className={align === "center" ? "mx-auto mb-10 max-w-2xl text-center" : "mb-8 max-w-2xl"}>
      {eyebrow && <p className="mb-2 text-sm font-bold tracking-[0.22em] text-rose">{eyebrow}</p>}
      <h2 className="text-3xl font-black tracking-tight text-forest md:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-lg leading-8 text-forest/70">{description}</p>}
    </div>
  );
}
