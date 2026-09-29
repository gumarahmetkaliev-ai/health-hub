"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/nav";
import { NavIcon, IconMoon, IconSun } from "./icons";
import { useTheme } from "./theme-provider";
import { EmergencyBar } from "./emergency-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  return (
    <div className="mx-auto flex min-h-[100svh] max-w-6xl">
      <aside className="sticky top-0 hidden h-[100svh] w-64 shrink-0 flex-col border-r border-[var(--line)] p-5 md:flex">
        <Link href="/" className="mb-8 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-[var(--accent)] text-white">
            +
          </span>
          <span>
            <div className="text-sm font-semibold tracking-tight">Health Hub</div>
            <div className="text-xs text-[var(--fg-muted)]">без регистрации</div>
          </span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]"
                    : "text-[var(--fg-muted)] hover:bg-[var(--bg-soft)] hover:text-[var(--fg)]"
                }`}
              >
                <NavIcon name={item.icon} className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-3">
          <EmergencyBar />
          <button
            type="button"
            onClick={toggle}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--line)] px-3 py-2.5 text-sm"
          >
            {theme === "dark" ? (
              <IconSun className="h-4 w-4" />
            ) : (
              <IconMoon className="h-4 w-4" />
            )}
            {theme === "dark" ? "Светлая" : "Тёмная"}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pb-24 md:pb-0">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] px-4 py-3 backdrop-blur md:hidden">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[var(--accent)] text-white">
              +
            </span>
            Health Hub
          </Link>
          <button
            type="button"
            onClick={toggle}
            className="rounded-xl border border-[var(--line)] p-2"
            aria-label="Тема"
          >
            {theme === "dark" ? (
              <IconSun className="h-4 w-4" />
            ) : (
              <IconMoon className="h-4 w-4" />
            )}
          </button>
        </header>
        <div className="flex-1 px-4 py-5 md:px-8 md:py-8">{children}</div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--line)] bg-[color-mix(in_srgb,var(--bg-elev)_90%,transparent)] px-2 py-2 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-7">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 rounded-xl py-1 text-[10px] ${
                  active ? "text-[var(--accent)]" : "text-[var(--fg-muted)]"
                }`}
              >
                <NavIcon name={item.icon} className="h-5 w-5" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
