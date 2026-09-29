"use client";

import { FormEvent, useMemo, useState } from "react";
import { ProgressRing } from "@/components/progress-ring";
import { SparkBars } from "@/components/spark-bars";
import { useStore } from "@/lib/store";
import { formatTime, lastNDates, pct } from "@/lib/utils";

const QUICK = [150, 250, 500];

export default function WaterPage() {
  const { ready, state, addWater, setWaterSettings, todayWaterMl } = useStore();
  const [goal, setGoal] = useState("");
  const [interval, setInterval] = useState("");

  const dates = lastNDates(7);
  const series = dates.map((d) =>
    state.waterLogs.filter((l) => l.date === d).reduce((s, l) => s + l.amountMl, 0),
  );
  const todayLogs = useMemo(
    () => state.waterLogs.filter((l) => l.date === dates[dates.length - 1]),
    [state.waterLogs, dates],
  );

  if (!ready) return <div className="h-40 animate-pulse rounded-3xl bg-[var(--bg-soft)]" />;

  function saveSettings(e: FormEvent) {
    e.preventDefault();
    const g = Number(goal);
    const i = Number(interval);
    setWaterSettings({
      ...(g > 0 ? { goalMl: Math.round(g) } : {}),
      ...(i > 0 ? { reminderIntervalMin: Math.round(i) } : {}),
    });
    setGoal("");
    setInterval("");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Вода</h1>
        <p className="mt-1 text-sm text-[var(--fg-muted)]">
          Своя дневная цель и быстрые порции. Это трекер привычки, не медицинское назначение объёма жидкости.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-[auto_1fr]">
        <div className="card grid place-items-center p-6">
          <ProgressRing
            value={pct(todayWaterMl, state.waterSettings.goalMl)}
            color="var(--water)"
            size={168}
            label={`${todayWaterMl}`}
            sub={`из ${state.waterSettings.goalMl} мл`}
          />
        </div>
        <div className="card space-y-4 p-5">
          <div className="flex flex-wrap gap-2">
            {QUICK.map((ml) => (
              <button
                key={ml}
                type="button"
                onClick={() => addWater(ml)}
                className="rounded-2xl bg-[var(--water)] px-4 py-3 text-sm font-medium text-white"
              >
                +{ml} мл
              </button>
            ))}
          </div>
          <form onSubmit={saveSettings} className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              Цель, мл
              <input
                type="number"
                min={250}
                className="rounded-2xl border border-[var(--line)] bg-transparent px-3 py-2"
                placeholder={String(state.waterSettings.goalMl)}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
            </label>
            <label className="grid gap-1 text-sm">
              Интервал reminder, мин
              <input
                type="number"
                min={15}
                className="rounded-2xl border border-[var(--line)] bg-transparent px-3 py-2"
                placeholder={String(state.waterSettings.reminderIntervalMin)}
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
              />
            </label>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input
                type="checkbox"
                checked={state.waterSettings.reminderEnabled}
                onChange={(e) => setWaterSettings({ reminderEnabled: e.target.checked })}
              />
              Напоминать пить воду
            </label>
            <button className="rounded-2xl border border-[var(--line)] px-4 py-2 text-sm sm:col-span-2">
              Сохранить цель
            </button>
          </form>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="mb-3 font-semibold">7 дней</h2>
        <SparkBars values={series} color="var(--water)" />
      </div>

      <section className="card p-5">
        <h2 className="mb-3 font-semibold">Сегодня</h2>
        {todayLogs.length === 0 ? (
          <p className="text-sm text-[var(--fg-muted)]">Ещё нет записей.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {todayLogs.map((l) => (
              <li key={l.id} className="flex justify-between rounded-2xl bg-[var(--bg-soft)] px-4 py-2">
                <span>+{l.amountMl} мл</span>
                <span className="text-[var(--fg-muted)]">{formatTime(l.at)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
