import Link from "next/link";
import { notFound } from "next/navigation";
import { EmergencyBar } from "@/components/emergency-bar";
import { FIRST_AID } from "@/lib/first-aid";

export function generateStaticParams() {
  return FIRST_AID.map((g) => ({ slug: g.slug }));
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = FIRST_AID.find((g) => g.slug === slug);
  if (!guide) notFound();

  const blocks = [
    { title: "Что делать сейчас", items: guide.doNow },
    { title: "Чего не делать", items: guide.dont },
    { title: "Когда обращаться за помощью", items: guide.seekHelp },
    { title: "Когда нужна экстренная помощь", items: guide.emergency },
  ];

  return (
    <div className="space-y-6">
      <Link href="/first-aid" className="text-sm text-[var(--accent)]">
        ← Все ситуации
      </Link>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{guide.title}</h1>
        <p className="mt-1 text-sm text-[var(--fg-muted)]">{guide.summary}</p>
      </div>
      <EmergencyBar />
      {blocks.map((b) => (
        <section key={b.title} className="card p-5">
          <h2 className="mb-3 font-semibold">{b.title}</h2>
          <ol className="space-y-2 text-sm">
            {b.items.map((item) => (
              <li key={item} className="rounded-2xl bg-[var(--bg-soft)] px-4 py-3">
                {item}
              </li>
            ))}
          </ol>
        </section>
      ))}
      <section className="card p-5">
        <h2 className="mb-3 font-semibold">Источники</h2>
        <ul className="space-y-2 text-sm">
          {guide.sources.map((s) => (
            <li key={s.url}>
              <a className="text-[var(--accent)] underline-offset-2 hover:underline" href={s.url} target="_blank" rel="noreferrer">
                {s.name}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-[var(--fg-muted)]">
          Инструкции сжаты для быстрого чтения. При сомнении действуйте по указаниям диспетчера 103/112.
        </p>
      </section>
    </div>
  );
}
