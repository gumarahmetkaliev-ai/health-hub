"use client";

import { useState } from "react";
import Link from "next/link";
import { ChatPanel } from "@/components/ai/chat-panel";
import { LangSwitch } from "@/components/ai/lang-switch";
import type { AIMode, Lang } from "@/lib/ai-types";
import { EmergencyBar } from "@/components/emergency-bar";

const ACTIONS: { label: string; mode: AIMode; starters: string[] }[] = [
  {
    label: "Проверить симптомы",
    mode: "symptom",
    starters: [
      "Головная боль 2 дня, слабость, нет температуры",
      "Кашель и боль в груди при вдохе 3 недели",
      "Сильная усталость и сердцебиение",
    ],
  },
  { label: "Задать вопрос", mode: "chat", starters: ["Что такое ПЦР?", "Нормальное давление?"] },
  { label: "Первая помощь", mode: "first-aid", starters: ["Что делать при ожоге?", "Что делать при кровотечении?"] },
  { label: "Лекарства", mode: "medication", starters: ["Ибупрофен", "Парацетамол"] },
  { label: "Понять анализ", mode: "lab", starters: ["Глюкоза 6.2 ммоль/л, 3.9–6.1"] },
  { label: "Объяснить термин", mode: "term", starters: ["Что такое тахикардия?", "Гипертония простыми словами"] },
  { label: "Подготовиться к врачу", mode: "doctor-prep", starters: ["Подготовиться к терапетку"] },
  { label: "Здоровые привычки", mode: "coach", starters: ["Как пить достаточную воду?", "Сон 7 часов"] },
];

export default function AIHomePage() {
  const [selected, setSelected] = useState<AIMode>("symptom");
  const [lang, setLang] = useState<Lang>("ru");
  const active = ACTIONS.find((a) => a.mode === selected)!;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">AI Health Assistant</h1>
          <p className="mt-1 max-w-2xl text-sm text-[var(--fg-muted)]">
            Ассистент без регистрации: анализ симптомов, возможные причины, оценка срочности, red flags, справка о лекарствах и анализах, подготовка к врачу. Не ставит диагноз и не заменяет врача.
          </p>
        </div>
        <LangSwitch value={lang} onChange={setLang} />
      </div>

      <EmergencyBar />

      <div className="flex flex-wrap gap-2">
        {ACTIONS.map((a) => (
          <button
            key={a.mode}
            type="button"
            onClick={() => setSelected(a.mode)}
            className={`rounded-2xl border px-4 py-2.5 text-sm transition ${
              selected === a.mode
                ? "border-[var(--ai)] bg-[color-mix(in_srgb,var(--ai)_16%,transparent)] text-[var(--ai)]"
                : "border-[var(--line)] text-[var(--fg-muted)] hover:bg-[var(--bg-soft)]"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      <div className="card p-5">
        <h2 className="mb-3 text-sm text-[var(--fg-muted)]">{active.label}</h2>
        <ChatPanel
          mode={active.mode}
          lang={lang}
          starters={active.starters}
        />
      </div>

      <div className="text-xs text-[var(--fg-muted)]">
        Вопросы и ответы сохраняются локально в браузере. API key не хранится в localStorage и не
        попадает в клиентский код. При опасных симптомах сразу звоните <strong>103</strong> или{" "}
        <strong>112</strong>.
      </div>
      <Link href="/" className="text-sm text-[var(--accent)]">
        ← На обзор Health Hub
      </Link>
    </div>
  );
}
