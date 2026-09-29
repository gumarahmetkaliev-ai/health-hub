"use client";

import { FormEvent, useEffect, useState } from "react";
import type { AIMessage, AIMode, Lang, StructuredResponse, UrgencyLevel } from "@/lib/ai-types";
import { createChatSession, saveChatSession, loadChatSession } from "@/lib/ai-storage";
import { uid } from "@/lib/utils";
import { StructuredReply } from "./structured-reply";
import { EmergencyBanner } from "./emergency-banner";

const PLACEHOLDERS: Record<AIMode, Record<Lang, string>> = {
  chat: {
    ru: "Спросите термин или как найти раздел",
    kk: "Термин немесе бөлім туралы сұраңыз",
    en: "Ask a term or how to find a section",
  },
  symptom: {
    ru: "Опишите симптомы…",
    kk: "Белгілерді сипаттаңыз…",
    en: "Describe symptoms…",
  },
  "first-aid": {
    ru: "Например: что делать при ожоге?",
    kk: "Мысалы: күйік кезінде не істеу керек?",
    en: "e.g. What to do for a burn?",
  },
  term: {
    ru: "Что такое тахикардия?",
    kk: "Тахикардия деген не?",
    en: "What is tachycardia?",
  },
  lab: {
    ru: "Название анализа, значение, единицы, reference range",
    kk: "Талдау атауы, мәні, бірліктері, reference range",
    en: "Test name, value, units, reference range",
  },
  medication: {
    ru: "Название лекарства",
    kk: "Дәрі атауы",
    en: "Medication name",
  },
  interaction: {
    ru: "Перечислите лекарства через запятую",
    kk: "Дәрілерді үтір арқылы жазыңыз",
    en: "List medications, comma-separated",
  },
  "doctor-prep": {
    ru: "Опишите проблему, сроки, симптомы, лекарства",
    kk: "Мәселені, мерзімді, белгілерді, дәрілерді сипаттаңыз",
    en: "Describe the problem, timeline, symptoms, meds",
  },
  coach: {
    ru: "Вода, шаги, сон, привычки…",
    kk: "Су, қадам, ұйқы, әдеттер…",
    en: "Water, steps, sleep, habits…",
  },
};

export function ChatPanel({
  mode,
  lang,
  sessionId,
  extra,
  starters,
}: {
  mode: AIMode;
  lang: Lang;
  sessionId?: string;
  extra?: Record<string, string>;
  starters?: string[];
}) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sid, setSid] = useState(sessionId ?? "");

  useEffect(() => {
    if (sessionId) {
      const s = loadChatSession(sessionId);
      if (s) {
        setMessages(s.messages);
        setSid(s.id);
        return;
      }
    }
    const created = createChatSession(mode, lang);
    setSid(created.id);
    saveChatSession(created);
  }, [mode, lang, sessionId]);

  useEffect(() => {
    if (!sid || !messages.length) return;
    const session = loadChatSession(sid) ?? createChatSession(mode, lang);
    session.messages = messages;
    session.updatedAt = new Date().toISOString();
    session.mode = mode;
    session.lang = lang;
    session.id = sid;
    saveChatSession(session);
  }, [messages, sid, mode, lang]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || pending) return;
    const userMsg: AIMessage = {
      id: uid(),
      role: "user",
      content: trimmed,
      mode,
      at: new Date().toISOString(),
    };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setPending(true);
    setError(null);
    try {
      const payload = next.map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload, mode, lang, extra }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError("AI временно недоступен. Попробуйте ещё раз.");
        return;
      }
      const assistant: AIMessage = {
        id: uid(),
        role: "assistant",
        content: data.reply,
        mode,
        urgency: data.urgency as UrgencyLevel | undefined,
        redFlags: data.redFlags,
        structured: data.structured as StructuredResponse | undefined,
        at: new Date().toISOString(),
      };
      setMessages([...next, assistant]);
    } catch {
      setError("AI временно недоступен. Попробуйте ещё раз.");
    } finally {
      setPending(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

  const last = messages.filter((m) => m.role === "assistant").at(-1);
  const showEmergency = last?.urgency === "EMERGENCY" || (last?.redFlags?.length ?? 0) > 0;

  return (
    <div className="flex flex-col gap-3">
      {showEmergency ? <EmergencyBanner lang={lang} /> : null}
      {starters?.length ? (
        <div className="flex flex-wrap gap-2">
          {starters.map((s) => (
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
      ) : null}
      <div className="card flex min-h-[380px] flex-col p-4">
        <div className="flex-1 space-y-3 overflow-y-auto">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm ${
                m.role === "user"
                  ? "ml-auto bg-[var(--accent)] text-white"
                  : "bg-[var(--bg-soft)]"
              }`}
            >
              {m.role === "assistant" ? (
                <StructuredReply
                  text={m.content}
                  structured={m.structured}
                  urgency={m.urgency}
                  redFlags={m.redFlags}
                  lang={lang}
                />
              ) : (
                m.content
              )}
            </div>
          ))}
          {pending ? (
            <div className="rounded-2xl bg-[var(--bg-soft)] px-4 py-3 text-sm text-[var(--fg-muted)]">
              {lang === "en" ? "Thinking…" : lang === "kk" ? "Ойлануда…" : "Думаю…"}
            </div>
          ) : null}
        </div>
        {error ? <p className="mt-2 text-xs text-[var(--aid)]">{error}</p> : null}
        <form onSubmit={onSubmit} className="mt-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={PLACEHOLDERS[mode][lang]}
            className="flex-1 rounded-2xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm"
          />
          <button
            disabled={pending}
            className="rounded-2xl bg-[var(--ai)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {lang === "en" ? "Send" : lang === "kk" ? "Жіберу" : "Отправить"}
          </button>
        </form>
      </div>
    </div>
  );
}
