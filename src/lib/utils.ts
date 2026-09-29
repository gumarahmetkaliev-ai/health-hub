export function uid(): string {
  return crypto.randomUUID();
}

export function todayISO(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(iso: string): string {
  const date = iso.includes("T") ? new Date(iso) : new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });
}

export function formatDateLong(iso: string): string {
  const date = iso.includes("T") ? new Date(iso) : new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function pct(value: number, goal: number): number {
  if (goal <= 0) return 0;
  return clamp(Math.round((value / goal) * 100), 0, 100);
}

export function lastNDates(n: number): string[] {
  const dates: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    dates.push(todayISO(d));
  }
  return dates;
}

export function weekdayOf(dateISO: string): number {
  return new Date(`${dateISO}T12:00:00`).getDay();
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Доброй ночи";
  if (h < 12) return "Доброе утро";
  if (h < 18) return "Добрый день";
  return "Добрый вечер";
}
