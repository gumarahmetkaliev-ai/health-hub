"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

type Msg = { role: "user" | "assistant"; content: string };

const STARTERS = [
  "Что такое артериальное давление?",
  "Где трекер воды?",
  "Когда при ожоге звонить 103?",
  "Чем растяжение отличается от перелома — общими словами?",
];

export default function AIPage() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Я справочный ассистент Health Hub. Могу объяснить термины, общие сведения о здоровье и подсказать раздел приложения. Не ставлю диагнозы, не назначаю лекарства и не советую менять лечение.",
    },
  ]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || pending) return;
    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setInput("");
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Не удалось получить ответ");
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка сети");
    } finally {
      setPending(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Ассистент</h1>
        <p className="mt-1 text-sm text-[var(--fg-muted)]">
          Без регистрации. Ключ API не вводится в браузере. При боли в груди, сильном кровотечении, потере сознания —{" "}
          <Link href="/first-aid" className="text-[var(--accent)]">
            103 / 112
          </Link>
          .
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STARTERS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => void send(s)}
            className="rounded-full bg-[var(--bg-soft)] px-3 py-1.5 text-xs"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="card flex min-h-[420px] flex-col p-4">
        <div className="flex-1 space-y-3 overflow-y-auto">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm ${
                m.role === "user"
                  ? "ml-auto bg-[var(--accent)] text-white"
                  : "bg-[var(--bg-soft)]"
              }`}
            >
              {m.content}
            </div>
          ))}
          {pending ? (
            <div className="rounded-2xl bg-[var(--bg-soft)] px-4 py-3 text-sm text-[var(--fg-muted)]">
              Думаю…
            </div>
          ) : null}
        </div>
        {error ? <p className="mt-2 text-xs text-[var(--aid)]">{error}</p> : null}
        <form onSubmit={onSubmit} className="mt-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Спросите термин или как найти раздел"
            className="flex-1 rounded-2xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm"
          />
          <button
            disabled={pending}
            className="rounded-2xl bg-[var(--ai)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            Отправить
          </button>
        </form>
      </div>
    </div>
  );
}
