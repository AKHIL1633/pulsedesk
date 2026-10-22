import type { Request, Response } from "express";
import { CreateTicketSchema, TicketListQuerySchema, UpdateTicketSchema } from "@pulsedesk/shared";
import * as ticketService from "../services/ticketService";
import { renderTicket, renderTickets } from "../views/ticketView";
import { renderError } from "../views/errorView";

export async function create(req: Request, res: Response): Promise<void> {
  const input = CreateTicketSchema.parse(req.body);
  const ticket = await ticketService.createTicket(input);
  res.status(201).json(renderTicket(ticket));
}

export async function list(req: Request, res: Response): Promise<void> {
  const filters = TicketListQuerySchema.parse(req.query);
  const tickets = await ticketService.listTickets(filters);
  res.json(renderTickets(tickets));
}

export async function show(req: Request, res: Response): Promise<void> {
  const ticket = await ticketService.getTicketById(req.params.id);
  if (!ticket) {
    res.status(404).json(renderError("Ticket not found"));
    return;
  }
  res.json(renderTicket(ticket));
}

export async function update(req: Request, res: Response): Promise<void> {
  const input = UpdateTicketSchema.parse(req.body);
  const ticket = await ticketService.updateTicket(req.params.id, input);
  if (!ticket) {
    res.status(404).json(renderError("Ticket not found"));
    return;
  }
  res.json(renderTicket(ticket));
}
