"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_STATE,
  type ActivitySettings,
  type AppState,
  type Medication,
  type WaterSettings,
  type Weekday,
} from "./types";
import { clearState, loadState, pushHistory, saveState } from "./storage";
import { todayISO, uid } from "./utils";

interface StoreApi {
  ready: boolean;
  state: AppState;
  addMedication: (input: Omit<Medication, "id" | "createdAt">) => void;
  updateMedication: (id: string, patch: Partial<Medication>) => void;
  removeMedication: (id: string) => void;
  toggleTaken: (medicationId: string) => void;
  isTakenToday: (medicationId: string) => boolean;
  addWater: (amountMl: number) => void;
  setWaterSettings: (patch: Partial<WaterSettings>) => void;
  addSteps: (steps: number) => void;
  setActivitySettings: (patch: Partial<ActivitySettings>) => void;
  todayWaterMl: number;
  todaySteps: number;
  resetAll: () => void;
}

const StoreContext = createContext<StoreApi | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(loadState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveState(state);
  }, [state, ready]);

  const commit = useCallback((updater: (prev: AppState) => AppState) => {
    setState((prev) => updater(prev));
  }, []);

  const addMedication = useCallback(
    (input: Omit<Medication, "id" | "createdAt">) => {
      commit((prev) => {
        const med: Medication = {
          ...input,
          id: uid(),
          createdAt: new Date().toISOString(),
        };
        return pushHistory(
          { ...prev, medications: [med, ...prev.medications] },
          {
            kind: "medication",
            title: `Добавлено напоминание: ${med.name}`,
            detail: `Время ${med.time}`,
          },
        );
      });
    },
    [commit],
  );

  const updateMedication = useCallback(
    (id: string, patch: Partial<Medication>) => {
      commit((prev) => {
        const med = prev.medications.find((m) => m.id === id);
        return pushHistory(
          {
            ...prev,
            medications: prev.medications.map((m) =>
              m.id === id ? { ...m, ...patch } : m,
            ),
          },
          {
            kind: "medication",
            title: `Изменено напоминание: ${med?.name ?? "лекарство"}`,
          },
        );
      });
    },
    [commit],
  );

  const removeMedication = useCallback(
    (id: string) => {
      commit((prev) => {
        const med = prev.medications.find((m) => m.id === id);
        return pushHistory(
          {
            ...prev,
            medications: prev.medications.filter((m) => m.id !== id),
            medicationLogs: prev.medicationLogs.filter(
              (l) => l.medicationId !== id,
            ),
          },
          {
            kind: "medication",
            title: `Удалено напоминание: ${med?.name ?? "лекарство"}`,
          },
        );
      });
    },
    [commit],
  );

  const isTakenToday = useCallback(
    (medicationId: string) => {
      const today = todayISO();
      return state.medicationLogs.some(
        (l) => l.medicationId === medicationId && l.date === today,
      );
    },
    [state.medicationLogs],
  );

  const toggleTaken = useCallback(
    (medicationId: string) => {
      commit((prev) => {
        const today = todayISO();
        const med = prev.medications.find((m) => m.id === medicationId);
        const existing = prev.medicationLogs.find(
          (l) => l.medicationId === medicationId && l.date === today,
        );
        if (existing) {
          return pushHistory(
            {
              ...prev,
              medicationLogs: prev.medicationLogs.filter(
                (l) => l.id !== existing.id,
              ),
            },
            {
              kind: "medication",
              title: `Снята отметка: ${med?.name ?? "лекарство"}`,
            },
          );
        }
        return pushHistory(
          {
            ...prev,
            medicationLogs: [
              {
                id: uid(),
                medicationId,
                date: today,
                takenAt: new Date().toISOString(),
              },
              ...prev.medicationLogs,
            ],
          },
          {
            kind: "medication",
            title: `Отмечено: ${med?.name ?? "лекарство"}`,
          },
        );
      });
    },
    [commit],
  );

  const addWater = useCallback(
    (amountMl: number) => {
      commit((prev) =>
        pushHistory(
          {
            ...prev,
            waterLogs: [
              {
                id: uid(),
                date: todayISO(),
                amountMl,
                at: new Date().toISOString(),
              },
              ...prev.waterLogs,
            ],
          },
          {
            kind: "water",
            title: `+${amountMl} мл воды`,
          },
        ),
      );
    },
    [commit],
  );

  const setWaterSettings = useCallback(
    (patch: Partial<WaterSettings>) => {
      commit((prev) =>
        pushHistory(
          {
            ...prev,
            waterSettings: { ...prev.waterSettings, ...patch },
          },
          {
            kind: "settings",
            title: "Обновлены настройки воды",
          },
        ),
      );
    },
    [commit],
  );

  const addSteps = useCallback(
    (steps: number) => {
      commit((prev) =>
        pushHistory(
          {
            ...prev,
            activityLogs: [
              {
                id: uid(),
                date: todayISO(),
                steps,
                at: new Date().toISOString(),
              },
              ...prev.activityLogs,
            ],
          },
          {
            kind: "activity",
            title: `+${steps.toLocaleString("ru-RU")} шагов`,
          },
        ),
      );
    },
    [commit],
  );

  const setActivitySettings = useCallback(
    (patch: Partial<ActivitySettings>) => {
      commit((prev) =>
        pushHistory(
          {
            ...prev,
            activitySettings: { ...prev.activitySettings, ...patch },
          },
          {
            kind: "settings",
            title: "Обновлены настройки активности",
          },
        ),
      );
    },
    [commit],
  );

  const todayWaterMl = useMemo(() => {
    const today = todayISO();
    return state.waterLogs
      .filter((l) => l.date === today)
      .reduce((s, l) => s + l.amountMl, 0);
  }, [state.waterLogs]);

  const todaySteps = useMemo(() => {
    const today = todayISO();
    return state.activityLogs
      .filter((l) => l.date === today)
      .reduce((s, l) => s + l.steps, 0);
  }, [state.activityLogs]);

  const resetAll = useCallback(() => {
    const empty = clearState();
    setState(
      pushHistory(empty, {
        kind: "system",
        title: "Локальные данные очищены",
      }),
    );
  }, []);

  const api = useMemo<StoreApi>(
    () => ({
      ready,
      state,
      addMedication,
      updateMedication,
      removeMedication,
      toggleTaken,
      isTakenToday,
      addWater,
      setWaterSettings,
      addSteps,
      setActivitySettings,
      todayWaterMl,
      todaySteps,
      resetAll,
    }),
    [
      ready,
      state,
      addMedication,
      updateMedication,
      removeMedication,
      toggleTaken,
      isTakenToday,
      addWater,
      setWaterSettings,
      addSteps,
      setActivitySettings,
      todayWaterMl,
      todaySteps,
      resetAll,
    ],
  );

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function dueToday(days: Weekday[]): boolean {
  const today = new Date().getDay() as Weekday;
  return days.includes(today);
}
