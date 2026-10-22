"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Ticket } from "@pulsedesk/shared";
import { useSortedTickets } from "@/controllers/useSortedTickets";
import { Badge } from "./Badge";
import { ConfidenceFlag } from "./ConfidenceFlag";
import { IMAGES } from "./images";
import { initials, timeAgo } from "./format";
import {
  CATEGORY_LABELS,
  CATEGORY_STYLES,
  PRIORITY_ACCENT,
  PRIORITY_STYLES,
  STATUS_LABELS,
  STATUS_STYLES,
} from "@/views/badgeStyles";

function EmptyState({ searching }: { searching: boolean }) {
  return (
    <div className="flex animate-fade-in-up flex-col items-center overflow-hidden rounded-xl border border-slate-200 bg-white text-center shadow-sm sm:flex-row sm:text-left">
      <div className="relative h-48 w-full sm:h-56 sm:w-80 sm:shrink-0">
        <Image
          src={IMAGES.allCaughtUp}
          alt="Two colleagues celebrating with a high five"
          fill
          sizes="(min-width: 640px) 320px, 100vw"
          className="object-cover"
        />
      </div>
      <div className="p-8">
        <h3 className="text-lg font-semibold text-slate-900">
          {searching ? "No matching tickets" : "All caught up!"}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          {searching
            ? "Try a different search term or clear the filters."
            : "No tickets match these filters. Enjoy the quiet."}
        </p>
      </div>
    </div>
  );
}

export function TicketList({ tickets }: { tickets: Ticket[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tickets;
    return tickets.filter((t) =>
      [t.title, t.description, t.submittedBy].some((field) => field.toLowerCase().includes(q)),
    );
  }, [tickets, query]);

  const { sorted, sortKey, setSortKey } = useSortedTickets(searched);

  function open(id: string) {
    router.push(`/tickets/${id}`);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, description, submitter…"
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm shadow-sm transition focus:border-pulse-500 focus:outline-none focus:ring-4 focus:ring-pulse-100"
          />
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500">
            {sorted.length} ticket{sorted.length === 1 ? "" : "s"} · Sort by
          </span>
          <div className="flex rounded-lg bg-slate-100 p-0.5">
            {(
              [
                ["createdAt", "Newest"],
                ["priority", "Priority"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSortKey(key)}
                className={`rounded-md px-3 py-1 font-medium transition ${
                  sortKey === key
                    ? "bg-white text-pulse-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {sorted.length === 0 ? (
        <EmptyState searching={query.trim() !== ""} />
      ) : (
        <ul className="space-y-2">
          {sorted.map((ticket, i) => (
            <li
              key={ticket.id}
              role="link"
              tabIndex={0}
              onClick={() => open(ticket.id)}
              onKeyDown={(e) => e.key === "Enter" && open(ticket.id)}
              style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
              className="group relative grid animate-fade-in-up cursor-pointer grid-cols-1 items-center gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white py-3.5 pl-5 pr-4 shadow-sm transition hover:-translate-y-0.5 hover:border-pulse-200 hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-pulse-100 md:grid-cols-[minmax(0,2.4fr)_1fr_1fr_1fr_auto]"
            >
              <span
                className={`absolute inset-y-0 left-0 w-1 ${
                  ticket.priority ? PRIORITY_ACCENT[ticket.priority] : "bg-slate-200"
                }`}
              />

              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 transition group-hover:bg-pulse-gradient group-hover:text-white">
                  {initials(ticket.submittedBy)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900 group-hover:text-pulse-700">
                    {ticket.title}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {ticket.submittedBy} ·{" "}
                    <span suppressHydrationWarning>{timeAgo(ticket.createdAt)}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 md:contents">
                <div>
                  {ticket.category ? (
                    <Badge
                      label={CATEGORY_LABELS[ticket.category]}
                      className={CATEGORY_STYLES[ticket.category]}
                    />
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </div>
                <div>
                  {ticket.priority ? (
                    <Badge label={ticket.priority} className={PRIORITY_STYLES[ticket.priority]} />
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </div>
                <div>
                  <Badge
                    label={STATUS_LABELS[ticket.status]}
                    className={STATUS_STYLES[ticket.status]}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <ConfidenceFlag confidence={ticket.aiConfidence} showMeter />
                <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-pulse-500">
                  →
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
