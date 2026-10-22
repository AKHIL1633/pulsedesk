import { notFound } from "next/navigation";
import { fetchTicket, ApiError } from "@/models/api";
import { TicketDetail } from "@/views/TicketDetail";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const ticket = await fetchTicket(id);
    return <TicketDetail key={String(ticket.updatedAt)} ticket={ticket} />;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }
}
