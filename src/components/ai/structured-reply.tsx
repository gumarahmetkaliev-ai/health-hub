"use client";

import { useState } from "react";
import type { Lang, StructuredResponse, UrgencyLevel } from "@/lib/ai-types";
import { UrgencyBadge } from "./urgency-badge";
import { EmergencyBanner } from "./emergency-banner";

const LABELS: Record<string, Record<Lang, string>> = {
  causes: { ru: "Возможные причины", kk: "Ықтимал себептер", en: "Possible causes" },
  urgency: { ru: "Срочность", kk: "Шұғылдылық", en: "Urgency" },
  redFlags: { ru: "Тревожные признаки", kk: "Қауіпті белгілер", en: "Red flags" },
  actions: { ru: "Что можно сделать сейчас", kk: "Қазір не істеуге болады", en: "What to do now" },
  whenDoctor: { ru: "Когда обратиться к врачу", kk: "Дәрігерге қашан жүгіну", en: "When to see a doctor" },
  questions: { ru: "Вопросы врачу", kk: "Дәрігерге сұрақтар", en: "Questions for the doctor" },
  sources: { ru: "Источники", kk: "Дереккөздер", en: "Sources" },
  copy: { ru: "Копировать", kk: "Көшіру", en: "Copy" },
  copied: { ru: "Скопировано", kk: "Көшірілді", en: "Copied" },
};

export function StructuredReply({
  text,
  structured,
  urgency,
  redFlags,
  lang = "ru",
}: {
  text: string;
  structured?: StructuredResponse;
  urgency?: UrgencyLevel;
  redFlags?: string[];
  lang?: Lang;
}) {
  const [copied, setCopied] = useState(false);
  const flags = redFlags ?? structured?.redFlags ?? [];
  const level = urgency ?? structured?.urgency;
  const isEmergency = level === "EMERGENCY" || flags.length > 0;

  async function copy() {
    const parts = [text];
    if (structured?.causes?.length) parts.push(structured.causes.join("\n"));
    try {
      await navigator.clipboard.writeText(parts.join("\n\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-3">
      {isEmergency ? <EmergencyBanner lang={lang} /> : null}
      {level ? <UrgencyBadge level={level} lang={lang} /> : null}
      <p className="whitespace-pre-wrap text-sm leading-relaxed">{text}</p>
      {structured?.causes?.length ? (
        <Card title={LABELS.causes[lang]} items={structured.causes} />
      ) : null}
      {flags.length ? <Card title={LABELS.redFlags[lang]} items={flags} tone="aid" /> : null}
      {structured?.actions?.length ? (
        <Card title={LABELS.actions[lang]} items={structured.actions} />
      ) : null}
      {structured?.whenDoctor?.length ? (
        <Card title={LABELS.whenDoctor[lang]} items={structured.whenDoctor} />
      ) : null}
      {structured?.questions?.length ? (
        <Card title={LABELS.questions[lang]} items={structured.questions} />
      ) : null}
      {structured?.sources?.length ? (
        <div className="rounded-2xl bg-[var(--bg-soft)] px-4 py-3">
          <div className="mb-2 text-xs font-medium text-[var(--fg-muted)]">{LABELS.sources[lang]}</div>
          <ul className="space-y-1 text-sm">
            {structured.sources.map((s) => (
              <li key={s.name}>
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noreferrer" className="text-[var(--accent)]">
                    {s.name}
                  </a>
                ) : (
                  s.name
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => void copy()}
        className="text-xs text-[var(--fg-muted)] underline-offset-2 hover:underline"
      >
        {copied ? LABELS.copied[lang] : LABELS.copy[lang]}
      </button>
    </div>
  );
}

function Card({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone?: "aid";
}) {
  return (
    <div
      className={`rounded-2xl px-4 py-3 ${
        tone === "aid"
          ? "bg-[color-mix(in_srgb,var(--aid)_12%,transparent)]"
          : "bg-[var(--bg-soft)]"
      }`}
    >
      <div className="mb-2 text-xs font-medium text-[var(--fg-muted)]">{title}</div>
      <ul className="space-y-1 text-sm">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}
