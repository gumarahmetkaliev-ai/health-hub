import Link from "next/link";
import { EmergencyBar } from "@/components/emergency-bar";
import { FIRST_AID } from "@/lib/first-aid";

const TONE = {
  urgent: "Срочно оценить",
  soon: "Нужна оценка",
  self: "Базовый уход",
};

export default function FirstAidPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Первая помощь</h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--fg-muted)]">
          Справочник с пошаговыми действиями из открытых материалов NHS, Red Cross, CDC, WHO и Mayo Clinic.
          Это не замена врачу. При угрозе жизни звоните 103 или 112.
        </p>
      </div>
      <EmergencyBar />
      <div className="grid gap-3 sm:grid-cols-2">
        {FIRST_AID.map((g) => (
          <Link key={g.slug} href={`/first-aid/${g.slug}`} className="card p-5">
            <div className="text-xs text-[var(--aid)]">{TONE[g.urgency]}</div>
            <h2 className="mt-1 font-semibold">{g.title}</h2>
            <p className="mt-2 text-sm text-[var(--fg-muted)]">{g.summary}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
