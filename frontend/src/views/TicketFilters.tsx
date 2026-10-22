"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { TICKET_CATEGORIES, TICKET_PRIORITIES, TICKET_STATUSES } from "@pulsedesk/shared";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/views/badgeStyles";

const FILTER_KEYS = ["status", "category", "priority"] as const;
type FilterKey = (typeof FILTER_KEYS)[number];

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
        active
          ? "bg-pulse-gradient text-white shadow-sm shadow-pulse-500/30"
          : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-pulse-50 hover:text-pulse-700 hover:ring-pulse-200"
      }`}
    >
      {label}
    </button>
  );
}

export function TicketFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setFilter(key: FilterKey, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && params.get(key) !== value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/?${params.toString()}`, { scroll: false });
  }

  const hasActiveFilters = FILTER_KEYS.some((key) => searchParams.get(key));
  const status = searchParams.get("status") ?? "";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <Chip label="All" active={!status} onClick={() => setFilter("status", "")} />
        {TICKET_STATUSES.map((s) => (
          <Chip
            key={s}
            label={STATUS_LABELS[s]}
            active={status === s}
            onClick={() => setFilter("status", s)}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            ["category", "All categories", TICKET_CATEGORIES, (c: string) => CATEGORY_LABELS[c as keyof typeof CATEGORY_LABELS]],
            ["priority", "All priorities", TICKET_PRIORITIES, (p: string) => p],
          ] as const
        ).map(([key, placeholder, options, label]) => (
          <select
            key={key}
            className={`rounded-lg border px-3 py-1.5 text-sm transition focus:border-pulse-500 focus:outline-none focus:ring-4 focus:ring-pulse-100 ${
              searchParams.get(key)
                ? "border-pulse-400 bg-pulse-50 text-pulse-700"
                : "border-slate-300 bg-white text-slate-700"
            }`}
            value={searchParams.get(key) ?? ""}
            onChange={(e) => setFilter(key, e.target.value)}
          >
            <option value="">{placeholder}</option>
            {options.map((o) => (
              <option key={o} value={o}>
                {label(o)}
              </option>
            ))}
          </select>
        ))}

        {hasActiveFilters && (
          <button
            onClick={() => router.push("/", { scroll: false })}
            className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-pulse-600 transition hover:bg-pulse-50"
          >
            ✕ Clear
          </button>
        )}
      </div>
    </div>
  );
}
