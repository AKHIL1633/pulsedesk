"use client";

import { useMemo, useState } from "react";
import type { Ticket, TicketPriority } from "@pulsedesk/shared";

export type SortKey = "createdAt" | "priority";

const PRIORITY_RANK: Record<TicketPriority, number> = {
  URGENT: 3,
  HIGH: 2,
  MEDIUM: 1,
  LOW: 0,
};

export function useSortedTickets(tickets: Ticket[]) {
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");

  const sorted = useMemo(() => {
    const copy = [...tickets];
    if (sortKey === "priority") {
      copy.sort((a, b) => {
        const rankA = a.priority ? PRIORITY_RANK[a.priority] : -1;
        const rankB = b.priority ? PRIORITY_RANK[b.priority] : -1;
        return rankB - rankA;
      });
    } else {
      copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return copy;
  }, [tickets, sortKey]);

  return { sorted, sortKey, setSortKey };
}
