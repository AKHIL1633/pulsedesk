import { TICKET_CATEGORIES, TICKET_PRIORITIES } from "@pulsedesk/shared";

const RESPONSE_SHAPE = `{
  "category": "BUG" | "FEATURE_REQUEST" | "SUPPORT" | "OTHER",
  "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT",
  "confidence": number between 0 and 1,
  "draftResponse": string
}`;

/**
 * Builds the classification prompt sent to the AI provider.
 *
 * Design notes (see README "Prompt Design" section for the full writeup):
 * - Category/priority options are spelled out verbatim so the model can't
 *   invent a fifth category — the zod schema still re-validates regardless.
 * - "confidence" is requested explicitly and defined (not left to the model's
 *   own notion of confidence) so scores are comparable across tickets.
 * - draftResponse is asked to speak directly to the customer, since it may be
 *   sent with little to no editing by the human reviewer.
 * - `strict` produces a second-pass prompt used only on retry after the first
 *   response failed schema validation — it drops all framing and asks for
 *   raw JSON only, which in practice fixes markdown-fenced or prose-wrapped
 *   responses.
 */
export function buildClassificationPrompt(
  title: string,
  description: string,
  options: { strict?: boolean } = {},
): string {
  const ticketBlock = `Ticket title: ${title}\nTicket description: ${description}`;

  if (options.strict) {
    return [
      "Return ONLY valid JSON matching exactly this shape, no markdown fences, no commentary:",
      RESPONSE_SHAPE,
      `category must be one of: ${TICKET_CATEGORIES.join(", ")}`,
      `priority must be one of: ${TICKET_PRIORITIES.join(", ")}`,
      "",
      ticketBlock,
    ].join("\n");
  }

  return [
    "You are a support ticket triage assistant for a software product.",
    "Read the ticket below and classify it.",
    "",
    `category: one of ${TICKET_CATEGORIES.join(", ")}.`,
    "  BUG = something is broken or behaving incorrectly.",
    "  FEATURE_REQUEST = the user wants new or changed functionality.",
    "  SUPPORT = the user needs help using existing functionality.",
    "  OTHER = anything that doesn't fit the above (spam, unclear, general feedback).",
    "",
    `priority: one of ${TICKET_PRIORITIES.join(", ")}, based on user impact and urgency.`,
    "  URGENT = production down, data loss, security issue, blocks many users.",
    "  HIGH = major feature broken or blocks the reporting user's core workflow.",
    "  MEDIUM = a real problem but a workaround exists or impact is limited.",
    "  LOW = cosmetic, minor annoyance, or a nice-to-have request.",
    "",
    "confidence: your confidence (0 to 1) that the category AND priority are both correct.",
    "  Lower it when the ticket is ambiguous, very short, or could fit multiple categories.",
    "",
    "draftResponse: a short, polite, ready-to-send reply directly to the customer",
    "  acknowledging their ticket and next steps. Do not invent facts about timelines",
    "  or fixes you cannot know.",
    "",
    "Respond with ONLY valid JSON, no markdown code fences, matching this shape:",
    RESPONSE_SHAPE,
    "",
    ticketBlock,
  ].join("\n");
}
