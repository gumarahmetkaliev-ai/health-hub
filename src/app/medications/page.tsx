"use client";

import { FormEvent, useMemo, useState } from "react";
import { dueToday, useStore } from "@/lib/store";
import { WEEKDAYS, type Medication, type Weekday } from "@/lib/types";

const emptyForm = {
  name: "",
  time: "09:00",
  days: [1, 2, 3, 4, 5] as Weekday[],
  note: "",
  reminderEnabled: true,
};

export default function MedicationsPage() {
  const {
    ready,
    state,
    addMedication,
    updateMedication,
    removeMedication,
    toggleTaken,
    isTakenToday,
  } = useStore();
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const sorted = useMemo(
    () =>
      [...state.medications].sort((a, b) => {
        const ad = dueToday(a.days) ? 0 : 1;
        const bd = dueToday(b.days) ? 0 : 1;
        if (ad !== bd) return ad - bd;
        return a.time.localeCompare(b.time);
      }),
    [state.medications],
  );

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const payload = {
      name: form.name.trim(),
      time: form.time,
      days: form.days.length ? form.days : ([1, 2, 3, 4, 5, 6, 0] as Weekday[]),
      note: form.note.trim(),
      reminderEnabled: form.reminderEnabled,
    };
    if (editing) {
      updateMedication(editing, payload);
      setEditing(null);
    } else {
      addMedication(payload);
    }
    setForm(emptyForm);
    setNotice("Сохранено как личное напоминание. Приложение не назначает лечение.");
  }

  function startEdit(m: Medication) {
    setEditing(m.id);
    setForm({
      name: m.name,
      time: m.time,
      days: m.days,
      note: m.note,
      reminderEnabled: m.reminderEnabled,
    });
  }

  function toggleDay(id: Weekday) {
    setForm((f) => ({
      ...f,
      days: f.days.includes(id) ? f.days.filter((d) => d !== id) : [...f.days, id],
    }));
  }

  if (!ready) return <div className="h-40 animate-pulse rounded-3xl bg-[var(--bg-soft)]" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Лекарства</h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--fg-muted)]">
          Только ваши напоминания: название, время, дни и заметка. Health Hub не подбирает препараты,
          не советует дозы и не предлагает менять лечение.
        </p>
      </div>

      <form onSubmit={onSubmit} className="card grid gap-4 p-5 md:grid-cols-2">
        <label className="grid gap-1 text-sm">
          Название
          <input
            className="rounded-2xl border border-[var(--line)] bg-transparent px-3 py-2"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Как в вашей схеме от врача"
            required
          />
        </label>
        <label className="grid gap-1 text-sm">
          Время
          <input
            type="time"
            className="rounded-2xl border border-[var(--line)] bg-transparent px-3 py-2"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            required
          />
        </label>
        <div className="md:col-span-2">
          <div className="mb-2 text-sm">Дни</div>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((d) => (
              <button
                type="button"
                key={d.id}
                onClick={() => toggleDay(d.id as Weekday)}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  form.days.includes(d.id as Weekday)
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--bg-soft)]"
                }`}
              >
                {d.short}
              </button>
            ))}
          </div>
        </div>
        <label className="grid gap-1 text-sm md:col-span-2">
          Заметка
          <textarea
            className="min-h-20 rounded-2xl border border-[var(--line)] bg-transparent px-3 py-2"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            placeholder="Например: после еды — только ваша пометка"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.reminderEnabled}
            onChange={(e) => setForm({ ...form, reminderEnabled: e.target.checked })}
          />
          Локальное напоминание
        </label>
        <div className="flex gap-2 md:justify-end">
          {editing ? (
            <button
              type="button"
              className="rounded-2xl border border-[var(--line)] px-4 py-2 text-sm"
              onClick={() => {
                setEditing(null);
                setForm(emptyForm);
              }}
            >
              Отмена
            </button>
          ) : null}
          <button className="rounded-2xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white">
            {editing ? "Сохранить" : "Добавить"}
          </button>
        </div>
        {notice ? (
          <p className="md:col-span-2 text-xs text-[var(--fg-muted)]">{notice}</p>
        ) : null}
      </form>

      <ul className="grid gap-3">
        {sorted.length === 0 ? (
          <li className="card p-5 text-sm text-[var(--fg-muted)]">Список пуст.</li>
        ) : (
          sorted.map((m) => {
            const today = dueToday(m.days);
            const taken = isTakenToday(m.id);
            return (
              <li key={m.id} className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-medium">{m.name}</div>
                  <div className="text-sm text-[var(--fg-muted)]">
                    {m.time} · {m.days.map((d) => WEEKDAYS.find((w) => w.id === d)?.short).join(" ")}
                    {m.reminderEnabled ? " · reminder" : ""}
                  </div>
                  {m.note ? <div className="mt-1 text-sm">{m.note}</div> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {today ? (
                    <button
                      type="button"
                      onClick={() => toggleTaken(m.id)}
                      className={`rounded-2xl px-3 py-2 text-sm ${
                        taken
                          ? "bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] text-[var(--accent)]"
                          : "bg-[var(--accent)] text-white"
                      }`}
                    >
                      {taken ? "Снять отметку" : "Отметить"}
                    </button>
                  ) : (
                    <span className="rounded-2xl bg-[var(--bg-soft)] px-3 py-2 text-sm text-[var(--fg-muted)]">
                      не сегодня
                    </span>
                  )}
                  <button
                    type="button"
                    className="rounded-2xl border border-[var(--line)] px-3 py-2 text-sm"
                    onClick={() => startEdit(m)}
                  >
                    Изменить
                  </button>
                  <button
                    type="button"
                    className="rounded-2xl border border-[var(--line)] px-3 py-2 text-sm text-[var(--aid)]"
                    onClick={() => {
                      if (confirm("Удалить напоминание?")) removeMedication(m.id);
                    }}
                  >
                    Удалить
                  </button>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
