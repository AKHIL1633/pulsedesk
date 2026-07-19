"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { TICKET_CATEGORIES, TICKET_PRIORITIES, TICKET_STATUSES } from "@pulsedesk/shared";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/badgeStyles";

const FILTER_KEYS = ["status", "category", "priority"] as const;

export function TicketFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setFilter(key: (typeof FILTER_KEYS)[number], value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/?${params.toString()}`);
  }

  const hasActiveFilters = FILTER_KEYS.some((key) => searchParams.get(key));

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-pulse-500 focus:outline-none focus:ring-1 focus:ring-pulse-500"
        value={searchParams.get("status") ?? ""}
        onChange={(e) => setFilter("status", e.target.value)}
      >
        <option value="">All statuses</option>
        {TICKET_STATUSES.map((status) => (
          <option key={status} value={status}>
            {STATUS_LABELS[status]}
          </option>
        ))}
      </select>

      <select
        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-pulse-500 focus:outline-none focus:ring-1 focus:ring-pulse-500"
        value={searchParams.get("category") ?? ""}
        onChange={(e) => setFilter("category", e.target.value)}
      >
        <option value="">All categories</option>
        {TICKET_CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {CATEGORY_LABELS[category]}
          </option>
        ))}
      </select>

      <select
        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-pulse-500 focus:outline-none focus:ring-1 focus:ring-pulse-500"
        value={searchParams.get("priority") ?? ""}
        onChange={(e) => setFilter("priority", e.target.value)}
      >
        <option value="">All priorities</option>
        {TICKET_PRIORITIES.map((priority) => (
          <option key={priority} value={priority}>
            {priority}
          </option>
        ))}
      </select>

      {hasActiveFilters && (
        <button
          onClick={() => router.push("/")}
          className="text-sm font-medium text-pulse-600 hover:text-pulse-700"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
