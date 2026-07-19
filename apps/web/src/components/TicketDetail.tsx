"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LOW_CONFIDENCE_THRESHOLD,
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  type Ticket,
  type TicketCategory,
  type TicketPriority,
} from "@pulsedesk/shared";
import { useUpdateTicket } from "@/hooks/useUpdateTicket";
import { Badge } from "./Badge";
import { ConfidenceFlag } from "./ConfidenceFlag";
import { CATEGORY_LABELS, STATUS_LABELS, STATUS_STYLES } from "@/lib/badgeStyles";

export function TicketDetail({ ticket }: { ticket: Ticket }) {
  const { save, isSaving, error } = useUpdateTicket(ticket.id);
  const [category, setCategory] = useState<TicketCategory>(ticket.category ?? "OTHER");
  const [priority, setPriority] = useState<TicketPriority>(ticket.priority ?? "MEDIUM");
  const [draftResponse, setDraftResponse] = useState(ticket.aiDraftResponse ?? "");

  const isLowConfidence =
    ticket.aiConfidence !== null && ticket.aiConfidence < LOW_CONFIDENCE_THRESHOLD;
  const isTerminal = ticket.status === "RESOLVED";

  async function handleMark(status: "REVIEWED" | "RESOLVED") {
    await save({ category, priority, aiDraftResponse: draftResponse || null, status });
  }

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-pulse-600 hover:text-pulse-700">
        &larr; Back to tickets
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{ticket.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Submitted by {ticket.submittedBy} &middot;{" "}
            {new Date(ticket.createdAt).toLocaleString()}
          </p>
        </div>
        <Badge label={STATUS_LABELS[ticket.status]} className={STATUS_STYLES[ticket.status]} />
      </div>

      {isLowConfidence && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Low AI confidence — please double-check the category, priority, and draft response
          before approving.
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Ticket
          </h2>
          <p className="whitespace-pre-wrap text-sm text-slate-700">{ticket.description}</p>
          {ticket.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ticket.imageUrl}
              alt="Attachment submitted with ticket"
              className="max-h-80 rounded-md border border-slate-200 object-contain"
            />
          )}
        </section>

        <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              AI Suggestion &amp; Review
            </h2>
            <ConfidenceFlag confidence={ticket.aiConfidence} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="mb-1 block text-slate-500">Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TicketCategory)}
                disabled={isTerminal}
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-slate-800 focus:border-pulse-500 focus:outline-none focus:ring-1 focus:ring-pulse-500 disabled:bg-slate-50 disabled:text-slate-400"
              >
                {TICKET_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="mb-1 block text-slate-500">Priority</span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                disabled={isTerminal}
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-slate-800 focus:border-pulse-500 focus:outline-none focus:ring-1 focus:ring-pulse-500 disabled:bg-slate-50 disabled:text-slate-400"
              >
                {TICKET_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block text-sm">
            <span className="mb-1 block text-slate-500">Draft response</span>
            <textarea
              value={draftResponse}
              onChange={(e) => setDraftResponse(e.target.value)}
              disabled={isTerminal}
              rows={6}
              placeholder="No AI draft available — write a response manually."
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-pulse-500 focus:outline-none focus:ring-1 focus:ring-pulse-500 disabled:bg-slate-50 disabled:text-slate-400"
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => handleMark("REVIEWED")}
              disabled={isSaving || isTerminal}
              className="rounded-md bg-pulse-gradient px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Mark Reviewed"}
            </button>
            <button
              onClick={() => handleMark("RESOLVED")}
              disabled={isSaving || isTerminal}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Mark Resolved"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
