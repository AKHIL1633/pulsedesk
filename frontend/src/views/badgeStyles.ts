import type { TicketCategory, TicketPriority, TicketStatus } from "@pulsedesk/shared";

export const PRIORITY_STYLES: Record<TicketPriority, string> = {
  LOW: "bg-slate-100 text-slate-700 ring-slate-300",
  MEDIUM: "bg-blue-50 text-blue-700 ring-blue-300",
  HIGH: "bg-amber-50 text-amber-800 ring-amber-300",
  URGENT: "bg-red-50 text-red-700 ring-red-300",
};

/** Solid colour for the priority stripe on each ticket row. */
export const PRIORITY_ACCENT: Record<TicketPriority, string> = {
  LOW: "bg-slate-300",
  MEDIUM: "bg-blue-400",
  HIGH: "bg-amber-400",
  URGENT: "bg-red-500",
};

export const CATEGORY_STYLES: Record<TicketCategory, string> = {
  BUG: "bg-rose-50 text-rose-700 ring-rose-300",
  FEATURE_REQUEST: "bg-teal-50 text-teal-700 ring-teal-300",
  SUPPORT: "bg-violet-50 text-violet-700 ring-violet-300",
  OTHER: "bg-slate-100 text-slate-700 ring-slate-300",
};

export const STATUS_STYLES: Record<TicketStatus, string> = {
  NEW: "bg-slate-100 text-slate-700 ring-slate-300",
  AI_PROCESSED: "bg-pulse-100 text-pulse-700 ring-pulse-400",
  REVIEWED: "bg-teal-50 text-teal-700 ring-teal-300",
  RESOLVED: "bg-emerald-50 text-emerald-700 ring-emerald-300",
};

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  BUG: "Bug",
  FEATURE_REQUEST: "Feature Request",
  SUPPORT: "Support",
  OTHER: "Other",
};

export const STATUS_LABELS: Record<TicketStatus, string> = {
  NEW: "New",
  AI_PROCESSED: "AI Processed",
  REVIEWED: "Reviewed",
  RESOLVED: "Resolved",
};
