"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { formatDate, formatTime } from "@/lib/utils";
import type { HistoryKind } from "@/lib/types";

const LABELS: Record<HistoryKind, string> = {
  medication: "Лекарства",
  water: "Вода",
  activity: "Активность",
  settings: "Настройки",
  system: "Система",
};

export default function HistoryPage() {
  const { ready, state, resetAll } = useStore();
  const [kind, setKind] = useState<HistoryKind | "all">("all");

  const items = useMemo(
    () =>
      state.history.filter((e) => (kind === "all" ? true : e.kind === kind)),
    [state.history, kind],
  );

  if (!ready) return <div className="h-40 animate-pulse rounded-3xl bg-[var(--bg-soft)]" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">История</h1>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            События хранятся только в этом браузере (localStorage).
          </p>
        </div>
        <button
          type="button"
          className="rounded-2xl border border-[var(--aid)] px-4 py-2 text-sm text-[var(--aid)]"
          onClick={() => {
            if (confirm("Удалить все локальные данные Health Hub на этом устройстве?")) {
              resetAll();
            }
          }}
        >
          Очистить данные
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "medication", "water", "activity", "settings", "system"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              kind === k ? "bg-[var(--accent)] text-white" : "bg-[var(--bg-soft)]"
            }`}
          >
            {k === "all" ? "Все" : LABELS[k]}
          </button>
        ))}
      </div>

      <ul className="space-y-2">
        {items.length === 0 ? (
          <li className="card p-5 text-sm text-[var(--fg-muted)]">Пока пусто.</li>
        ) : (
          items.map((e) => (
            <li key={e.id} className="card flex items-start justify-between gap-3 p-4">
              <div>
                <div className="text-xs text-[var(--fg-muted)]">{LABELS[e.kind]}</div>
                <div className="font-medium">{e.title}</div>
                {e.detail ? (
                  <div className="text-sm text-[var(--fg-muted)]">{e.detail}</div>
                ) : null}
              </div>
              <div className="shrink-0 text-right text-xs text-[var(--fg-muted)]">
                <div>{formatDate(e.at)}</div>
                <div>{formatTime(e.at)}</div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
