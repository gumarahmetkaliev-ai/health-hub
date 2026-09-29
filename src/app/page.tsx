"use client";

import Link from "next/link";
import { useMemo } from "react";
import { EmergencyBar } from "@/components/emergency-bar";
import { ProgressRing } from "@/components/progress-ring";
import { SparkBars } from "@/components/spark-bars";
import { dueToday, useStore } from "@/lib/store";
import { WEEKDAYS } from "@/lib/types";
import { formatDateLong, greeting, lastNDates, pct, todayISO } from "@/lib/utils";

export default function DashboardPage() {
  const { ready, state, todayWaterMl, todaySteps, isTakenToday } = useStore();

  const due = useMemo(
    () => state.medications.filter((m) => dueToday(m.days)),
    [state.medications],
  );
  const taken = due.filter((m) => isTakenToday(m.id)).length;
  const dates = lastNDates(7);
  const waterSeries = dates.map((d) =>
    state.waterLogs.filter((l) => l.date === d).reduce((s, l) => s + l.amountMl, 0),
  );
  const stepSeries = dates.map((d) =>
    state.activityLogs.filter((l) => l.date === d).reduce((s, l) => s + l.steps, 0),
  );

  if (!ready) {
    return <div className="h-40 animate-pulse rounded-3xl bg-[var(--bg-soft)]" />;
  }

  return (
    <div className="space-y-6">
      <div className="rise flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-[var(--fg-muted)]">{greeting()}</p>
          <h1 className="text-3xl font-semibold tracking-tight">Сегодня в фокусе</h1>
          <p className="mt-1 capitalize text-sm text-[var(--fg-muted)]">
            {formatDateLong(todayISO())}
          </p>
        </div>
        <p className="max-w-sm text-sm text-[var(--fg-muted)]">
          Напоминания и трекеры работают локально. Health Hub не ставит диагнозы и не назначает лечение.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/medications" className="card rise p-5">
          <div className="mb-3 text-sm text-[var(--fg-muted)]">Лекарства</div>
          <ProgressRing
            value={due.length ? pct(taken, due.length) : 0}
            label={due.length ? `${taken}/${due.length}` : "0"}
            sub="на сегодня"
          />
        </Link>
        <Link href="/water" className="card rise p-5" style={{ animationDelay: "60ms" }}>
          <div className="mb-3 text-sm text-[var(--fg-muted)]">Вода</div>
          <ProgressRing
            value={pct(todayWaterMl, state.waterSettings.goalMl)}
            color="var(--water)"
            label={`${todayWaterMl}`}
            sub={`из ${state.waterSettings.goalMl} мл`}
          />
        </Link>
        <Link href="/activity" className="card rise p-5" style={{ animationDelay: "120ms" }}>
          <div className="mb-3 text-sm text-[var(--fg-muted)]">Активность</div>
          <ProgressRing
            value={pct(todaySteps, state.activitySettings.goalSteps)}
            color="var(--activity)"
            label={todaySteps.toLocaleString("ru-RU")}
            sub={`цель ${state.activitySettings.goalSteps.toLocaleString("ru-RU")}`}
          />
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Напоминания на сегодня</h2>
            <Link href="/medications" className="text-sm text-[var(--accent)]">
              Все
            </Link>
          </div>
          {due.length === 0 ? (
            <p className="text-sm text-[var(--fg-muted)]">
              Пока нет напоминаний. Добавьте лекарство — только как личный reminder, без дозировок от приложения.
            </p>
          ) : (
            <ul className="space-y-2">
              {due
                .slice()
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between rounded-2xl bg-[var(--bg-soft)] px-4 py-3"
                  >
                    <div>
                      <div className="font-medium">{m.name}</div>
                      <div className="text-xs text-[var(--fg-muted)]">
                        {m.time} ·{" "}
                        {m.days.map((d) => WEEKDAYS.find((w) => w.id === d)?.short).join(" ")}
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        isTakenToday(m.id)
                          ? "bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] text-[var(--accent)]"
                          : "text-[var(--fg-muted)]"
                      }`}
                    >
                      {isTakenToday(m.id) ? "готово" : "ожидает"}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </section>

        <section className="space-y-4">
          <EmergencyBar />
          <Link href="/first-aid" className="card block p-5">
            <div className="text-sm text-[var(--fg-muted)]">Справочник</div>
            <h2 className="mt-1 font-semibold">Первая помощь</h2>
            <p className="mt-2 text-sm text-[var(--fg-muted)]">
              Пошаговые инструкции из проверенных источников. При угрозе жизни — 103 или 112.
            </p>
          </Link>
          <Link href="/ai" className="card block p-5">
            <div className="text-sm text-[var(--fg-muted)]">Ассистент</div>
            <h2 className="mt-1 font-semibold">Объяснит термин или раздел</h2>
            <p className="mt-2 text-sm text-[var(--fg-muted)]">
              Без диагноза и назначений. Ключ API только на сервере.
            </p>
          </Link>
        </section>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-medium">Вода за 7 дней</span>
            <span className="text-[var(--fg-muted)]">мл</span>
          </div>
          <SparkBars values={waterSeries} color="var(--water)" />
        </div>
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-medium">Шаги за 7 дней</span>
            <span className="text-[var(--fg-muted)]">шаги</span>
          </div>
          <SparkBars values={stepSeries} color="var(--activity)" />
        </div>
      </div>
    </div>
  );
}
