"use client";

import { DEFAULT_STATE, type AppState, type HistoryEvent } from "./types";
import { uid } from "./utils";

const KEY = "health-hub:v1";

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function migrate(raw: unknown): AppState {
  if (!isObject(raw)) return structuredClone(DEFAULT_STATE);
  return {
    medications: Array.isArray(raw.medications) ? raw.medications : [],
    medicationLogs: Array.isArray(raw.medicationLogs) ? raw.medicationLogs : [],
    waterSettings: {
      ...DEFAULT_STATE.waterSettings,
      ...(isObject(raw.waterSettings) ? raw.waterSettings : {}),
    },
    waterLogs: Array.isArray(raw.waterLogs) ? raw.waterLogs : [],
    activitySettings: {
      ...DEFAULT_STATE.activitySettings,
      ...(isObject(raw.activitySettings) ? raw.activitySettings : {}),
    },
    activityLogs: Array.isArray(raw.activityLogs) ? raw.activityLogs : [],
    history: Array.isArray(raw.history) ? raw.history : [],
  } as AppState;
}

export function loadState(): AppState {
  if (typeof window === "undefined") return structuredClone(DEFAULT_STATE);
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    return migrate(JSON.parse(raw));
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function clearState(): AppState {
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
  return structuredClone(DEFAULT_STATE);
}

export function pushHistory(
  state: AppState,
  event: Omit<HistoryEvent, "id" | "at"> & { at?: string },
): AppState {
  const item: HistoryEvent = {
    id: uid(),
    at: event.at ?? new Date().toISOString(),
    kind: event.kind,
    title: event.title,
    detail: event.detail,
  };
  return { ...state, history: [item, ...state.history].slice(0, 400) };
}
