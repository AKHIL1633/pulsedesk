"use client";

import Link from "next/link";
import type { Ticket } from "@pulsedesk/shared";
import { useSortedTickets } from "@/hooks/useSortedTickets";
import { Badge } from "./Badge";
import { ConfidenceFlag } from "./ConfidenceFlag";
import {
  CATEGORY_LABELS,
  CATEGORY_STYLES,
  PRIORITY_STYLES,
  STATUS_LABELS,
  STATUS_STYLES,
} from "@/lib/badgeStyles";

export function TicketList({ tickets }: { tickets: Ticket[] }) {
  const { sorted, sortKey, setSortKey } = useSortedTickets(tickets);

  if (tickets.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-500">
        No tickets match these filters.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-end gap-2 text-sm">
        <span className="text-slate-500">Sort by</span>
        <button
          onClick={() => setSortKey("createdAt")}
          className={`rounded-md px-2.5 py-1 font-medium ${
            sortKey === "createdAt" ? "bg-pulse-100 text-pulse-700" : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          Newest
        </button>
        <button
          onClick={() => setSortKey("priority")}
          className={`rounded-md px-2.5 py-1 font-medium ${
            sortKey === "priority" ? "bg-pulse-100 text-pulse-700" : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          Priority
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">AI Confidence</th>
              <th className="px-4 py-3 font-medium">Submitted By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/tickets/${ticket.id}`}
                    className="font-medium text-slate-900 hover:text-pulse-600"
                  >
                    {ticket.title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  {ticket.category ? (
                    <Badge label={CATEGORY_LABELS[ticket.category]} className={CATEGORY_STYLES[ticket.category]} />
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {ticket.priority ? (
                    <Badge label={ticket.priority} className={PRIORITY_STYLES[ticket.priority]} />
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge label={STATUS_LABELS[ticket.status]} className={STATUS_STYLES[ticket.status]} />
                </td>
                <td className="px-4 py-3">
                  <ConfidenceFlag confidence={ticket.aiConfidence} />
                </td>
                <td className="px-4 py-3 text-slate-500">{ticket.submittedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
