"use client";

import { DEFAULT_STATE } from "./types";
import type { AIChatSession, AIMessage, AIMode, Lang } from "./ai-types";
import { uid } from "./utils";

const CHAT_KEY = "health-hub:ai-chats:v1";

function loadChats(): AIChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHAT_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveChats(chats: AIChatSession[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CHAT_KEY, JSON.stringify(chats.slice(0, 50)));
}

export function loadChatSession(id: string): AIChatSession | null {
  const chats = loadChats();
  return chats.find((c) => c.id === id) ?? null;
}

export function saveChatSession(session: AIChatSession): void {
  const chats = loadChats();
  const idx = chats.findIndex((c) => c.id === session.id);
  if (idx >= 0) {
    chats[idx] = session;
  } else {
    chats.unshift(session);
  }
  saveChats(chats);
}

export function createChatSession(mode: AIMode, lang: Lang): AIChatSession {
  return {
    id: uid(),
    mode,
    lang,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function clearAllChats(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(CHAT_KEY);
  }
}

export function listChats(): AIChatSession[] {
  return loadChats();
}
