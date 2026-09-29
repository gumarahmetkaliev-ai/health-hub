"use client";

import { FormEvent, useMemo, useState } from "react";
import { ProgressRing } from "@/components/progress-ring";
import { SparkBars } from "@/components/spark-bars";
import { useStore } from "@/lib/store";
import { formatTime, lastNDates, pct } from "@/lib/utils";

const QUICK = [500, 1000, 2500];

export default function ActivityPage() {
  const { ready, state, addSteps, setActivitySettings, todaySteps } = useStore();
  const [custom, setCustom] = useState("");
  const [goal, setGoal] = useState("");
  const [interval, setInterval] = useState("");

  const dates = lastNDates(7);
  const series = dates.map((d) =>
    state.activityLogs.filter((l) => l.date === d).reduce((s, l) => s + l.steps, 0),
  );
  const todayLogs = useMemo(
    () => state.activityLogs.filter((l) => l.date === dates[dates.length - 1]),
    [state.activityLogs, dates],
  );

  if (!ready) return <div className="h-40 animate-pulse rounded-3xl bg-[var(--bg-soft)]" />;

  function save(e: FormEvent) {
    e.preventDefault();
    const g = Number(goal);
    const i = Number(interval);
    setActivitySettings({
      ...(g > 0 ? { goalSteps: Math.round(g) } : {}),
      ...(i > 0 ? { reminderIntervalMin: Math.round(i) } : {}),
    });
    setGoal("");
    setInterval("");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Активность</h1>
        <p className="mt-1 text-sm text-[var(--fg-muted)]">
          Счётчик шагов с вашей целью. 10 000 — готовая опция, не обязательная норма.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-[auto_1fr]">
        <div className="card grid place-items-center p-6">
          <ProgressRing
            value={pct(todaySteps, state.activitySettings.goalSteps)}
            color="var(--activity)"
            size={168}
            label={todaySteps.toLocaleString("ru-RU")}
            sub={`цель ${state.activitySettings.goalSteps.toLocaleString("ru-RU")}`}
          />
        </div>
        <div className="card space-y-4 p-5">
          <div className="flex flex-wrap gap-2">
            {QUICK.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => addSteps(n)}
                className="rounded-2xl bg-[var(--activity)] px-4 py-3 text-sm font-medium text-white"
              >
                +{n.toLocaleString("ru-RU")}
              </button>
            ))}
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const n = Number(custom);
                if (n > 0) {
                  addSteps(Math.round(n));
                  setCustom("");
                }
              }}
            >
              <input
                type="number"
                min={1}
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder="свои шаги"
                className="w-28 rounded-2xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm"
              />
              <button className="rounded-2xl border border-[var(--line)] px-3 py-2 text-sm">Добавить</button>
            </form>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActivitySettings({ goalSteps: 10000 })}
              className={`rounded-2xl px-3 py-2 text-sm ${
                state.activitySettings.goalSteps === 10000
                  ? "bg-[var(--activity)] text-white"
                  : "border border-[var(--line)]"
              }`}
            >
              Цель 10 000
            </button>
            <span className="self-center text-xs text-[var(--fg-muted)]">опционально</span>
          </div>

          <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              Своя цель, шаги
              <input
                type="number"
                min={500}
                className="rounded-2xl border border-[var(--line)] bg-transparent px-3 py-2"
                placeholder={String(state.activitySettings.goalSteps)}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
            </label>
            <label className="grid gap-1 text-sm">
              Напоминать двигаться, мин
              <input
                type="number"
                min={15}
                className="rounded-2xl border border-[var(--line)] bg-transparent px-3 py-2"
                placeholder={String(state.activitySettings.reminderIntervalMin)}
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
              />
            </label>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input
                type="checkbox"
                checked={state.activitySettings.reminderEnabled}
                onChange={(e) =>
                  setActivitySettings({ reminderEnabled: e.target.checked })
                }
              />
              Локальные напоминания двигаться
            </label>
            <button className="rounded-2xl border border-[var(--line)] px-4 py-2 text-sm sm:col-span-2">
              Сохранить
            </button>
          </form>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="mb-3 font-semibold">7 дней</h2>
        <SparkBars values={series} color="var(--activity)" />
      </div>

      <section className="card p-5">
        <h2 className="mb-3 font-semibold">Сегодня</h2>
        {todayLogs.length === 0 ? (
          <p className="text-sm text-[var(--fg-muted)]">Ещё нет записей.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {todayLogs.map((l) => (
              <li key={l.id} className="flex justify-between rounded-2xl bg-[var(--bg-soft)] px-4 py-2">
                <span>+{l.steps.toLocaleString("ru-RU")} шагов</span>
                <span className="text-[var(--fg-muted)]">{formatTime(l.at)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
