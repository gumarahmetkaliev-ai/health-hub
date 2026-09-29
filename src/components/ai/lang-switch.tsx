"use client";

import type { Lang } from "@/lib/ai-types";

const OPTIONS: { id: Lang; label: string }[] = [
  { id: "ru", label: "Русский" },
  { id: "kk", label: "Қазақша" },
  { id: "en", label: "English" },
];

export function LangSwitch({
  value,
  onChange,
}: {
  value: Lang;
  onChange: (lang: Lang) => void;
}) {
  return (
    <div className="flex gap-1 rounded-2xl bg-[var(--bg-soft)] p-1">
      {OPTIONS.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`rounded-xl px-3 py-1.5 text-xs ${
            value === o.id ? "bg-[var(--bg-elev)] font-medium shadow-sm" : "text-[var(--fg-muted)]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
