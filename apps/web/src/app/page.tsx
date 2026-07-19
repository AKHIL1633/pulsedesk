import { fetchTickets } from "@/lib/api";
import { parseTicketFilters } from "@/lib/searchParams";
import { TicketFilters } from "@/components/TicketFilters";
import { TicketList } from "@/components/TicketList";

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseTicketFilters(await searchParams);

  let tickets;
  let loadError: string | null = null;
  try {
    tickets = await fetchTickets(filters);
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Failed to load tickets";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Tickets</h1>
      </div>

      <TicketFilters />

      {loadError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Couldn&apos;t reach the PulseDesk API: {loadError}
        </div>
      ) : (
        <TicketList tickets={tickets ?? []} />
      )}
    </div>
  );
}
