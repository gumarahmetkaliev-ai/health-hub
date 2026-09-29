export const WEEKDAYS = [
  { id: 1, short: "Пн", label: "Понедельник" },
  { id: 2, short: "Вт", label: "Вторник" },
  { id: 3, short: "Ср", label: "Среда" },
  { id: 4, short: "Чт", label: "Четверг" },
  { id: 5, short: "Пт", label: "Пятница" },
  { id: 6, short: "Сб", label: "Суббота" },
  { id: 0, short: "Вс", label: "Воскресенье" },
] as const;

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Medication {
  id: string;
  name: string;
  time: string;
  days: Weekday[];
  note: string;
  reminderEnabled: boolean;
  createdAt: string;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  date: string;
  takenAt: string;
}

export interface WaterSettings {
  goalMl: number;
  reminderEnabled: boolean;
  reminderIntervalMin: number;
}

export interface WaterLog {
  id: string;
  date: string;
  amountMl: number;
  at: string;
}

export interface ActivitySettings {
  goalSteps: number;
  reminderEnabled: boolean;
  reminderIntervalMin: number;
}

export interface ActivityLog {
  id: string;
  date: string;
  steps: number;
  at: string;
}

export type HistoryKind =
  | "medication"
  | "water"
  | "activity"
  | "settings"
  | "system";

export interface HistoryEvent {
  id: string;
  kind: HistoryKind;
  title: string;
  detail?: string;
  at: string;
}

export interface AppState {
  medications: Medication[];
  medicationLogs: MedicationLog[];
  waterSettings: WaterSettings;
  waterLogs: WaterLog[];
  activitySettings: ActivitySettings;
  activityLogs: ActivityLog[];
  history: HistoryEvent[];
}

export const DEFAULT_STATE: AppState = {
  medications: [],
  medicationLogs: [],
  waterSettings: {
    goalMl: 2000,
    reminderEnabled: false,
    reminderIntervalMin: 90,
  },
  waterLogs: [],
  activitySettings: {
    goalSteps: 8000,
    reminderEnabled: false,
    reminderIntervalMin: 120,
  },
  activityLogs: [],
  history: [],
};
