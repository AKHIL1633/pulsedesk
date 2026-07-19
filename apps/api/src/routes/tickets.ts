import { Router } from "express";
import { CreateTicketSchema, TicketListQuerySchema, UpdateTicketSchema } from "@pulsedesk/shared";
import { asyncHandler } from "../utils/asyncHandler";
import { createTicket, getTicketById, listTickets, updateTicket } from "../services/ticketService";

export const ticketsRouter = Router();

ticketsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = CreateTicketSchema.parse(req.body);
    const ticket = await createTicket(input);
    res.status(201).json(ticket);
  }),
);

ticketsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const filters = TicketListQuerySchema.parse(req.query);
    const tickets = await listTickets(filters);
    res.json(tickets);
  }),
);

ticketsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const ticket = await getTicketById(req.params.id);
    if (!ticket) {
      res.status(404).json({ error: "Ticket not found" });
      return;
    }
    res.json(ticket);
  }),
);

ticketsRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const input = UpdateTicketSchema.parse(req.body);
    const ticket = await updateTicket(req.params.id, input);
    if (!ticket) {
      res.status(404).json({ error: "Ticket not found" });
      return;
    }
    res.json(ticket);
  }),
);
