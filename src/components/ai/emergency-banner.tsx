"use client";

import { getEmergencyText, type Lang } from "@/lib/ai-types";
import { IconPhone } from "../icons";

export function EmergencyBanner({ lang = "ru", showAlways }:{ lang?: Lang; showAlways?: boolean }) {
  const t = getEmergencyText(lang);
  return (
    <div className="rounded-2xl border border-[var(--aid)] bg-[color-mix(in_srgb,var(--aid)_14%,transparent)] p-4">
      <div className="font-semibold text-[var(--aid)]">{t.title}</div>
      <p className="mt-1 text-sm">{t.body}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <a href="tel:103" className="flex items-center justify-center gap-2 rounded-xl bg-[var(--aid)] px-3 py-2 text-sm font-medium text-white">
          <IconPhone className="h-4 w-4" />
          {t.ambulance}
        </a>
        <a href="tel:112" className="flex items-center justify-center gap-2 rounded-xl bg-[var(--aid)] px-3 py-2 text-sm font-medium text-white">
          <IconPhone className="h-4 w-4" />
          {t.unified}
        </a>
      </div>
    </div>
  );
}
