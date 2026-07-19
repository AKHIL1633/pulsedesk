import type { TicketCategory, TicketPriority, TicketStatus } from "@pulsedesk/shared";

type ColorPair = { backgroundColor: string; textColor: string };

export const PRIORITY_STYLES: Record<TicketPriority, ColorPair> = {
  LOW: { backgroundColor: "#f1f5f9", textColor: "#334155" },
  MEDIUM: { backgroundColor: "#eff6ff", textColor: "#1d4ed8" },
  HIGH: { backgroundColor: "#fffbeb", textColor: "#92400e" },
  URGENT: { backgroundColor: "#fef2f2", textColor: "#b91c1c" },
};

export const CATEGORY_STYLES: Record<TicketCategory, ColorPair> = {
  BUG: { backgroundColor: "#fff1f2", textColor: "#be123c" },
  FEATURE_REQUEST: { backgroundColor: "#f0fdfa", textColor: "#0f766e" },
  SUPPORT: { backgroundColor: "#f5f3ff", textColor: "#6d28d9" },
  OTHER: { backgroundColor: "#f1f5f9", textColor: "#334155" },
};

export const STATUS_STYLES: Record<TicketStatus, ColorPair> = {
  NEW: { backgroundColor: "#f1f5f9", textColor: "#334155" },
  AI_PROCESSED: { backgroundColor: "#eefcff", textColor: "#0584ab" },
  REVIEWED: { backgroundColor: "#f0fdfa", textColor: "#0f766e" },
  RESOLVED: { backgroundColor: "#ecfdf5", textColor: "#047857" },
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
