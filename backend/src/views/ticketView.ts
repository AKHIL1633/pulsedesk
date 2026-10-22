import type { Ticket as TicketRecord } from "@prisma/client";
import type { Ticket } from "@pulsedesk/shared";

/** Serializes a ticket record into the public API shape (see TicketSchema). */
export function renderTicket(ticket: TicketRecord): Ticket {
  return {
    id: ticket.id,
    title: ticket.title,
    description: ticket.description,
    imageUrl: ticket.imageUrl,
    category: ticket.category,
    priority: ticket.priority,
    aiDraftResponse: ticket.aiDraftResponse,
    aiConfidence: ticket.aiConfidence,
    status: ticket.status,
    submittedBy: ticket.submittedBy,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
  };
}

export function renderTickets(tickets: TicketRecord[]): Ticket[] {
  return tickets.map(renderTicket);
}
