"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LOW_CONFIDENCE_THRESHOLD,
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  type Ticket,
  type TicketCategory,
  type TicketPriority,
  type TicketStatus,
} from "@pulsedesk/shared";
import { useUpdateTicket } from "@/controllers/useUpdateTicket";
import { Badge } from "./Badge";
import { toast } from "./Toaster";
import { initials, timeAgo } from "./format";
import {
  CATEGORY_LABELS,
  PRIORITY_STYLES,
  STATUS_LABELS,
  STATUS_STYLES,
} from "@/views/badgeStyles";

const fieldClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition focus:border-pulse-500 focus:outline-none focus:ring-4 focus:ring-pulse-100 disabled:bg-slate-50 disabled:text-slate-400";

function StatusStepper({ status }: { status: TicketStatus }) {
  const current = TICKET_STATUSES.indexOf(status);
  return (
    <ol className="flex items-center">
      {TICKET_STATUSES.map((s, i) => {
        const done = i <= current;
        return (
          <li key={s} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition ${
                  done
                    ? "bg-pulse-gradient text-white shadow-sm shadow-pulse-500/30"
                    : "bg-slate-100 text-slate-400 ring-1 ring-slate-200"
                } ${i === current ? "ring-4 ring-pulse-100" : ""}`}
              >
                {i < current ? "✓" : i + 1}
              </span>
              <span
                className={`whitespace-nowrap text-[11px] font-medium ${
                  done ? "text-slate-700" : "text-slate-400"
                }`}
              >
                {STATUS_LABELS[s]}
              </span>
            </div>
            {i < TICKET_STATUSES.length - 1 && (
              <span
                className={`mx-2 mb-5 h-0.5 flex-1 rounded-full ${
                  i < current ? "bg-pulse-500" : "bg-slate-200"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function ConfidenceRing({ confidence }: { confidence: number | null }) {
  if (confidence === null) {
    return (
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-[10px] text-slate-400">
        No score
      </div>
    );
  }
  const percent = Math.round(confidence * 100);
  const isLow = confidence < LOW_CONFIDENCE_THRESHOLD;
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative h-16 w-16" title={`${percent}% AI confidence`}>
      <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
        <circle cx="32" cy="32" r={radius} fill="none" strokeWidth="6" className="stroke-slate-100" />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - confidence)}
          className={`transition-[stroke-dashoffset] duration-1000 ${
            isLow ? "stroke-amber-400" : "stroke-pulse-500"
          }`}
        />
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${
          isLow ? "text-amber-700" : "text-slate-800"
        }`}
      >
        {percent}%
      </span>
    </div>
  );
}

export function TicketDetail({ ticket }: { ticket: Ticket }) {
  const { save, isSaving, error } = useUpdateTicket(ticket.id);
  const [category, setCategory] = useState<TicketCategory>(ticket.category ?? "OTHER");
  const [priority, setPriority] = useState<TicketPriority>(ticket.priority ?? "MEDIUM");
  const [draftResponse, setDraftResponse] = useState(ticket.aiDraftResponse ?? "");
  const [savingAs, setSavingAs] = useState<"REVIEWED" | "RESOLVED" | null>(null);

  const isLowConfidence =
    ticket.aiConfidence !== null && ticket.aiConfidence < LOW_CONFIDENCE_THRESHOLD;
  const isTerminal = ticket.status === "RESOLVED";
  const isDirty =
    category !== (ticket.category ?? "OTHER") ||
    priority !== (ticket.priority ?? "MEDIUM") ||
    draftResponse !== (ticket.aiDraftResponse ?? "");

  async function handleMark(status: "REVIEWED" | "RESOLVED") {
    setSavingAs(status);
    const updated = await save({ category, priority, aiDraftResponse: draftResponse || null, status });
    setSavingAs(null);
    if (updated) toast(`Ticket marked ${STATUS_LABELS[status].toLowerCase()}`);
    else toast("Couldn't save changes", "error");
  }

  async function copyDraft() {
    try {
      await navigator.clipboard.writeText(draftResponse);
      toast("Draft response copied");
    } catch {
      toast("Clipboard not available", "error");
    }
  }

  function resetToAI() {
    setCategory(ticket.category ?? "OTHER");
    setPriority(ticket.priority ?? "MEDIUM");
    setDraftResponse(ticket.aiDraftResponse ?? "");
  }

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="group inline-flex items-center gap-1 text-sm font-medium text-pulse-600 hover:text-pulse-700"
      >
        <span className="transition group-hover:-translate-x-1">&larr;</span> Back to tickets
      </Link>

      <div className="animate-fade-in-up space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pulse-gradient text-sm font-semibold text-white shadow-sm">
              {initials(ticket.submittedBy)}
            </span>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold text-slate-900">{ticket.title}</h1>
              <p className="mt-1 text-sm text-slate-500">
                {ticket.submittedBy} ·{" "}
                <span title={new Date(ticket.createdAt).toLocaleString()} suppressHydrationWarning>
                  {timeAgo(ticket.createdAt)}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {ticket.priority && (
              <Badge label={ticket.priority} className={PRIORITY_STYLES[ticket.priority]} />
            )}
            <Badge label={STATUS_LABELS[ticket.status]} className={STATUS_STYLES[ticket.status]} />
          </div>
        </div>
        <StatusStepper status={ticket.status} />
      </div>

      {isLowConfidence && (
        <div className="flex animate-fade-in-up items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span className="text-lg leading-none">⚠️</span>
          Low AI confidence — please double-check the category, priority, and draft response
          before approving.
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <section
          className="animate-fade-in-up space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          style={{ animationDelay: "80ms" }}
        >
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Customer message
          </h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {ticket.description}
          </p>
          {ticket.imageUrl && (
            <a href={ticket.imageUrl} target="_blank" rel="noreferrer" className="block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ticket.imageUrl}
                alt="Attachment submitted with ticket"
                className="max-h-80 rounded-lg border border-slate-200 object-contain transition hover:opacity-90"
              />
            </a>
          )}
        </section>

        <section
          className="animate-fade-in-up space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          style={{ animationDelay: "160ms" }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                AI suggestion &amp; review
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Accept the AI&apos;s call or override any field.
              </p>
            </div>
            <ConfidenceRing confidence={ticket.aiConfidence} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="mb-1 block text-slate-500">Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TicketCategory)}
                disabled={isTerminal}
                className={fieldClass}
              >
                {TICKET_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </label>

            <div className="text-sm">
              <span className="mb-1 block text-slate-500">Priority</span>
              <div className="grid grid-cols-4 gap-1 rounded-lg bg-slate-100 p-1">
                {TICKET_PRIORITIES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    disabled={isTerminal}
                    onClick={() => setPriority(p)}
                    className={`rounded-md py-1.5 text-[10px] font-semibold tracking-tight transition disabled:cursor-not-allowed ${
                      priority === p
                        ? `${PRIORITY_STYLES[p]} shadow-sm ring-1`
                        : "text-slate-500 hover:bg-white/70"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <label className="block text-sm">
            <span className="mb-1 flex items-center justify-between text-slate-500">
              Draft response
              <span className="flex items-center gap-2 text-xs">
                <span className="tabular-nums text-slate-400">{draftResponse.length} chars</span>
                <button
                  type="button"
                  onClick={copyDraft}
                  disabled={!draftResponse}
                  className="rounded-md px-2 py-0.5 font-medium text-pulse-600 transition hover:bg-pulse-50 disabled:opacity-40"
                >
                  Copy
                </button>
              </span>
            </span>
            <textarea
              value={draftResponse}
              onChange={(e) => setDraftResponse(e.target.value)}
              disabled={isTerminal}
              rows={7}
              placeholder="No AI draft available — write a response manually."
              className={fieldClass}
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {isTerminal ? (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 ring-1 ring-emerald-200">
              ✓ This ticket is resolved — no further changes needed.
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => handleMark("REVIEWED")}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-lg bg-pulse-gradient px-4 py-2 text-sm font-semibold text-white shadow-md shadow-pulse-500/20 transition hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingAs === "REVIEWED" && (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                Mark Reviewed
              </button>
              <button
                onClick={() => handleMark("RESOLVED")}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingAs === "RESOLVED" && (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                )}
                Mark Resolved
              </button>
              {isDirty && (
                <button
                  onClick={resetToAI}
                  className="ml-auto animate-fade-in-up text-sm font-medium text-slate-500 hover:text-slate-700"
                >
                  ↺ Reset to AI suggestion
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
