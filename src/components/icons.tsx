export function IconHome(p: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={p.className} aria-hidden>
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconPill(p: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={p.className} aria-hidden>
      <rect
        x="3.8"
        y="8.2"
        width="16.4"
        height="7.6"
        rx="3.8"
        transform="rotate(-35 12 12)"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path d="M8 14.5 16 9.5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function IconDrop(p: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={p.className} aria-hidden>
      <path
        d="M12 3s7 8 7 12.2A7 7 0 1 1 5 15.2C5 11 12 3 12 3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconSteps(p: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={p.className} aria-hidden>
      <path
        d="M7 20c2-4 1.2-7 3.5-9M14 20c2.2-3.5 2-7.2 4.2-9.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="11.2" cy="8.2" r="1.3" fill="currentColor" />
      <circle cx="18.2" cy="7.4" r="1.3" fill="currentColor" />
    </svg>
  );
}

export function IconAid(p: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={p.className} aria-hidden>
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M12 8v8M8 12h8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconSpark(p: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={p.className} aria-hidden>
      <path
        d="M12 3.5 13.7 9h5.8L15.6 12.4 17.4 18 12 14.8 6.6 18l1.8-5.6L4.5 9h5.8L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconClock(p: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={p.className} aria-hidden>
      <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 7.8V12l3 2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconSun(p: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={p.className} aria-hidden>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8 5.6 18.4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconMoon(p: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={p.className} aria-hidden>
      <path
        d="M16.5 13.2A6.5 6.5 0 0 1 10.8 4.6 7.2 7.2 0 1 0 19.4 14a6.4 6.4 0 0 1-2.9-.8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconPhone(p: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={p.className} aria-hidden>
      <path
        d="M7.2 3.8h3l1.2 3-1.8 1.8a12.5 12.5 0 0 0 6.8 6.8l1.8-1.8 3 1.2v3A1.8 1.8 0 0 1 19.4 20 15.6 15.6 0 0 1 4 4.6a1.8 1.8 0 0 1 3.2-.8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const MAP = {
  home: IconHome,
  pill: IconPill,
  drop: IconDrop,
  steps: IconSteps,
  aid: IconAid,
  spark: IconSpark,
  clock: IconClock,
} as const;

export function NavIcon({
  name,
  className,
}: {
  name: keyof typeof MAP;
  className?: string;
}) {
  const C = MAP[name];
  return <C className={className} />;
}
