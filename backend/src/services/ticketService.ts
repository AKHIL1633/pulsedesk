import type { Ticket } from "@prisma/client";
import type { CreateTicketInput, TicketListQuery, UpdateTicketInput } from "@pulsedesk/shared";
import { TicketModel } from "../models/ticketModel";
import { classifyTicket } from "./ai/classifyTicket";
import { notifyStatusChange } from "./notificationService";

/**
 * Creates a ticket and immediately attempts AI classification. AI failure is
 * never fatal to ticket creation — the ticket is still saved as NEW with
 * null category/priority so submission is never blocked on AI availability.
 */
export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  const classification = await classifyTicket(input.title, input.description);

  return TicketModel.create({
    title: input.title,
    description: input.description,
    imageUrl: input.imageUrl ?? null,
    submittedBy: input.submittedBy,
    category: classification?.category ?? null,
    priority: classification?.priority ?? null,
    aiDraftResponse: classification?.draftResponse ?? null,
    aiConfidence: classification?.confidence ?? null,
    status: classification ? "AI_PROCESSED" : "NEW",
  });
}

export function listTickets(filters: TicketListQuery): Promise<Ticket[]> {
  return TicketModel.findMany(filters);
}

export function getTicketById(id: string): Promise<Ticket | null> {
  return TicketModel.findById(id);
}

export async function updateTicket(
  id: string,
  input: UpdateTicketInput,
): Promise<Ticket | null> {
  const existing = await TicketModel.findById(id);
  if (!existing) return null;

  const updated = await TicketModel.update(id, {
    category: input.category ?? undefined,
    priority: input.priority ?? undefined,
    aiDraftResponse: input.aiDraftResponse === undefined ? undefined : input.aiDraftResponse,
    status: input.status ?? undefined,
  });

  notifyStatusChange(updated, existing.status);
  return updated;
}
