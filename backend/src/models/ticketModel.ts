import type { Prisma, Ticket } from "@prisma/client";
import type { TicketListQuery } from "@pulsedesk/shared";
import { prisma } from "../config/prisma";

/** Data-access layer for tickets — the only module that queries the Ticket table. */
export const TicketModel = {
  create(data: Prisma.TicketCreateInput): Promise<Ticket> {
    return prisma.ticket.create({ data });
  },

  findMany(filters: TicketListQuery): Promise<Ticket[]> {
    return prisma.ticket.findMany({
      where: {
        status: filters.status,
        priority: filters.priority,
        category: filters.category,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: string): Promise<Ticket | null> {
    return prisma.ticket.findUnique({ where: { id } });
  },

  update(id: string, data: Prisma.TicketUpdateInput): Promise<Ticket> {
    return prisma.ticket.update({ where: { id }, data });
  },
};
