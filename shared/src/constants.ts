export const TICKET_CATEGORIES = ["BUG", "FEATURE_REQUEST", "SUPPORT", "OTHER"] as const;

export const TICKET_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export const TICKET_STATUSES = ["NEW", "AI_PROCESSED", "REVIEWED", "RESOLVED"] as const;

/** Below this AI confidence, the dashboard flags a ticket as "needs human review". */
export const LOW_CONFIDENCE_THRESHOLD = 0.6;
