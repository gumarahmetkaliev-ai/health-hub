import { EMERGENCY_KZ } from "@/lib/first-aid";
import { IconPhone } from "./icons";

export function EmergencyBar() {
  return (
    <div className="grid grid-cols-2 gap-2">
      <a
        href={`tel:${EMERGENCY_KZ.ambulance.number}`}
        className="flex items-center justify-center gap-2 rounded-2xl bg-[color-mix(in_srgb,var(--aid)_16%,transparent)] px-3 py-3 text-sm font-medium text-[var(--aid)]"
      >
        <IconPhone className="h-4 w-4" />
        103 скорая
      </a>
      <a
        href={`tel:${EMERGENCY_KZ.unified.number}`}
        className="flex items-center justify-center gap-2 rounded-2xl bg-[color-mix(in_srgb,var(--aid)_16%,transparent)] px-3 py-3 text-sm font-medium text-[var(--aid)]"
      >
        <IconPhone className="h-4 w-4" />
        112 экстренно
      </a>
    </div>
  );
}
