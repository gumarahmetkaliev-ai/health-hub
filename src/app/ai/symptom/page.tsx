"use client";

import { useState } from "react";
import { ChatPanel } from "@/components/ai/chat-panel";
import { LangSwitch } from "@/components/ai/lang-switch";
import type { Lang } from "@/lib/ai-types";

export default function SymptomPage() {
  const [lang, setLang] = useState<Lang>("ru");
  const [sent, setSent] = useState(false);
  const [extra, setExtra] = useState<Record<string, string>>({});

  const fields = [
    { key: "symptoms", label: lang === "en" ? "Symptoms" : "Симптомы", placeholder: lang === "en" ? "Describe main symptoms" : "Введите симптомы", multiline: true },
    { key: "age", label: lang === "en" ? "Age group" : "Возрастная группа", placeholder: lang === "en" ? "e.g. 30–40, <16, 70+" : "напр. 30–40, <16, 70+" },
    { key: "duration", label: lang === "en" ? "Duration" : "Длительность", placeholder: lang === "en" ? "e.g. 2 days, since morning" : "напр. 2 дня, с утра" },
    { key: "onset", label: lang === "en" ? "Onset" : "Начало", placeholder: lang === "en" ? "gradual or sudden" : "постепенно или внезапно" },
    { key: "intensity", label: lang === "en" ? "Intensity" : "Интенсивность", placeholder: "1–10" },
    { key: "temp", label: lang === "en" ? "Temperature" : "Температура", placeholder: "напр. 37.2" },
    { key: "additional", label: lang === "en" ? "Additional observations" : "Доп. наблюдения", placeholder: lang === "en" ? "Any other observations" : "Иное", multiline: true },
  ];

  function update(key: string, value: string) {
    setExtra((e) => ({ ...e, [key]: value }));
  }

  function submitForm(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {lang === "en" ? "Symptom Checker" : lang === "kk" ? "Симптомдар тексеруі" : "Проверка симптомов"}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[var(--fg-muted)]">
            {lang === "en"
              ? "Describe symptoms to see possible causes and urgency. This is information only — not a diagnosis."
              : lang === "kk"
                ? "Мүмкін себептер мен шұғылдықты көрсету үшін белгілерді сипаттаңыз. Бұл диагноз емес."
                : "Опишите симптомы, чтобы увидеть возможные причины и срочность. Это информация, а не диагноз."}
          </p>
        </div>
        <LangSwitch value={lang} onChange={setLang} />
      </div>

      {!sent ? (
        <form onSubmit={submitForm} className="card grid gap-4 p-5 sm:grid-cols-2">
          {fields.map((f) => (
            <label key={f.key} className="flex flex-col gap-1 text-sm">
              {f.label}
              {f.multiline ? (
                <textarea
                  className="min-h-20 rounded-2xl border border-[var(--line)] bg-transparent px-3 py-2"
                  placeholder={f.placeholder}
                  value={extra[f.key] ?? ""}
                  onChange={(e) => update(f.key, e.target.value)}
                  required={f.key === "symptoms"}
                />
              ) : (
                <input
                  className="rounded-2xl border border-[var(--line)] bg-transparent px-3 py-2"
                  placeholder={f.placeholder}
                  value={extra[f.key] ?? ""}
                  onChange={(e) => update(f.key, e.target.value)}
                />
              )}
            </label>
          ))}
          <button
            type="submit"
            className="rounded-2xl bg-[var(--ai)] px-4 py-2.5 text-sm font-medium text-white sm:col-span-2"
          >
            {lang === "en" ? "Check symptoms" : lang === "kk" ? "Симптомдарды тексеру" : "Проверить симптомы"}
          </button>
        </form>
      ) : (
        <ChatPanel mode="symptom" lang={lang} extra={extra} />
      )}
    </div>
  );
}
