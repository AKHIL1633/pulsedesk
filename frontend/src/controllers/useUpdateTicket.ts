"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Ticket, UpdateTicketInput } from "@pulsedesk/shared";
import { updateTicket, ApiError } from "@/models/api";

export function useUpdateTicket(ticketId: string) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(input: UpdateTicketInput): Promise<Ticket | null> {
    setIsSaving(true);
    setError(null);
    try {
      const ticket = await updateTicket(ticketId, input);
      router.refresh();
      return ticket;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save changes");
      return null;
    } finally {
      setIsSaving(false);
    }
  }

  return { save, isSaving, error };
}
