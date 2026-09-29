"use client";

import { useEffect, useRef } from "react";
import { dueToday, useStore } from "@/lib/store";
import { todayISO } from "@/lib/utils";

function canNotify() {
  return typeof window !== "undefined" && "Notification" in window;
}

async function ensurePermission() {
  if (!canNotify()) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const res = await Notification.requestPermission();
  return res === "granted";
}

function ping(title: string, body: string) {
  if (!canNotify() || Notification.permission !== "granted") return;
  try {
    new Notification(title, { body });
  } catch {
    /* ignore */
  }
}

export function Reminders() {
  const { ready, state, isTakenToday } = useStore();
  const lastMed = useRef<Record<string, string>>({});
  const lastWater = useRef(0);
  const lastMove = useRef(0);

  useEffect(() => {
    if (!ready) return;
    const need =
      state.medications.some((m) => m.reminderEnabled) ||
      state.waterSettings.reminderEnabled ||
      state.activitySettings.reminderEnabled;
    if (need) void ensurePermission();
  }, [ready, state.medications, state.waterSettings.reminderEnabled, state.activitySettings.reminderEnabled]);

  useEffect(() => {
    if (!ready) return;
    const tick = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const hm = `${hh}:${mm}`;
      const today = todayISO();

      for (const m of state.medications) {
        if (!m.reminderEnabled || !dueToday(m.days)) continue;
        if (m.time !== hm) continue;
        if (isTakenToday(m.id)) continue;
        const key = `${m.id}:${today}:${hm}`;
        if (lastMed.current[m.id] === key) continue;
        lastMed.current[m.id] = key;
        ping("Напоминание", `${m.name} — время ${m.time}. Это reminder, не назначение.`);
      }

      if (state.waterSettings.reminderEnabled) {
        const interval = Math.max(15, state.waterSettings.reminderIntervalMin) * 60_000;
        if (now.getTime() - lastWater.current >= interval) {
          lastWater.current = now.getTime();
          ping("Вода", "Напоминание выпить воды, если это уместно для вас.");
        }
      }

      if (state.activitySettings.reminderEnabled) {
        const interval = Math.max(15, state.activitySettings.reminderIntervalMin) * 60_000;
        if (now.getTime() - lastMove.current >= interval) {
          lastMove.current = now.getTime();
          ping("Активность", "Короткое напоминание подвигаться, если нет противопоказаний.");
        }
      }
    };

    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [ready, state, isTakenToday]);

  return null;
}
