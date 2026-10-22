import type { Ticket } from "@prisma/client";

/**
 * Notification hook fired whenever a ticket's status changes. Today this
 * just logs — wiring it to Expo push notifications only needs a device
 * push-token store keyed by submittedBy, which isn't part of the current
 * data model. Kept as a separate service so that addition doesn't touch
 * ticketService's request/response flow.
 */
export function notifyStatusChange(ticket: Ticket, previousStatus: Ticket["status"]): void {
  if (ticket.status === previousStatus) return;

  console.log(
    JSON.stringify({
      event: "ticket_status_changed",
      ticketId: ticket.id,
      submittedBy: ticket.submittedBy,
      from: previousStatus,
      to: ticket.status,
      timestamp: new Date().toISOString(),
    }),
  );
}
