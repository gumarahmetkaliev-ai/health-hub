import type { UrgencyLevel } from "@/lib/ai-types";

const STYLES: Record<UrgencyLevel, { bg: string; label: Record<string, string> }> = {
  LOW: {
    bg: "bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] text-[var(--accent)]",
    label: { ru: "LOW — наблюдение", kk: "LOW — бақылау", en: "LOW — monitor" },
  },
  MEDIUM: {
    bg: "bg-[color-mix(in_srgb,var(--activity)_20%,transparent)] text-[var(--activity)]",
    label: { ru: "MEDIUM — к врачу", kk: "MEDIUM — дәрігерге", en: "MEDIUM — see doctor" },
  },
  HIGH: {
    bg: "bg-[color-mix(in_srgb,var(--aid)_18%,transparent)] text-[var(--aid)]",
    label: { ru: "HIGH — срочно", kk: "HIGH — шұғыл", en: "HIGH — urgent" },
  },
  EMERGENCY: {
    bg: "bg-[var(--aid)] text-white",
    label: { ru: "EMERGENCY — 103/112", kk: "EMERGENCY — 103/112", en: "EMERGENCY — 103/112" },
  },
};

export function UrgencyBadge({
  level,
  lang = "ru",
}: {
  level: UrgencyLevel;
  lang?: string;
}) {
  const s = STYLES[level];
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${s.bg}`}>
      {s.label[lang] ?? s.label.ru}
    </span>
  );
}
