import { z } from "zod";
import { TICKET_CATEGORIES, TICKET_PRIORITIES, TICKET_STATUSES } from "./constants";

export const TicketCategorySchema = z.enum(TICKET_CATEGORIES);
export const TicketPrioritySchema = z.enum(TICKET_PRIORITIES);
export const TicketStatusSchema = z.enum(TICKET_STATUSES);

export type TicketCategory = z.infer<typeof TicketCategorySchema>;
export type TicketPriority = z.infer<typeof TicketPrioritySchema>;
export type TicketStatus = z.infer<typeof TicketStatusSchema>;

/** Full ticket shape as persisted and returned by the API. */
export const TicketSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  imageUrl: z.string().url().nullable(),
  category: TicketCategorySchema.nullable(),
  priority: TicketPrioritySchema.nullable(),
  aiDraftResponse: z.string().nullable(),
  aiConfidence: z.number().min(0).max(1).nullable(),
  status: TicketStatusSchema,
  submittedBy: z.string().min(1).max(200),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Ticket = z.infer<typeof TicketSchema>;

/** Body for POST /api/tickets. AI-assigned fields are never client-supplied. */
export const CreateTicketSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required").max(5000),
  imageUrl: z.string().url().optional().nullable(),
  submittedBy: z.string().min(1, "submittedBy is required").max(200),
});

export type CreateTicketInput = z.infer<typeof CreateTicketSchema>;

/**
 * Body for PATCH /api/tickets/:id — the human review endpoint.
 * Status may only move to REVIEWED or RESOLVED here; NEW/AI_PROCESSED are
 * system-assigned transitions, not human ones.
 */
export const UpdateTicketSchema = z
  .object({
    category: TicketCategorySchema.optional(),
    priority: TicketPrioritySchema.optional(),
    aiDraftResponse: z.string().nullable().optional(),
    status: z.enum(["REVIEWED", "RESOLVED"]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type UpdateTicketInput = z.infer<typeof UpdateTicketSchema>;

/** Query params accepted by GET /api/tickets for filtering. */
export const TicketListQuerySchema = z.object({
  status: TicketStatusSchema.optional(),
  priority: TicketPrioritySchema.optional(),
  category: TicketCategorySchema.optional(),
});

export type TicketListQuery = z.infer<typeof TicketListQuerySchema>;

/**
 * Shape the AI agent must return for a classification call.
 * Validated independently of prompt instructions (defense-in-depth) —
 * the model is never trusted to self-enforce structure.
 */
export const AIClassificationSchema = z.object({
  category: TicketCategorySchema,
  priority: TicketPrioritySchema,
  confidence: z.number().min(0).max(1),
  draftResponse: z.string().min(1),
});

export type AIClassification = z.infer<typeof AIClassificationSchema>;
