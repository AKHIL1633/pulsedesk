import { fetchTickets } from "@/models/api";
import { parseTicketFilters } from "@/controllers/searchParams";
import { DashboardBanner } from "@/views/DashboardBanner";
import { StatCards } from "@/views/StatCards";
import { TicketFilters } from "@/views/TicketFilters";
import { TicketList } from "@/views/TicketList";

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseTicketFilters(await searchParams);
  const hasFilters = Boolean(filters.status || filters.priority || filters.category);

  let tickets;
  let allTickets;
  let loadError: string | null = null;
  try {
    // The stat cards always summarise the whole queue, independent of filters.
    [tickets, allTickets] = await Promise.all([
      fetchTickets(filters),
      hasFilters ? fetchTickets() : null,
    ]);
    allTickets ??= tickets;
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Failed to load tickets";
  }

  return (
    <div className="space-y-6">
      <DashboardBanner tickets={allTickets ?? []} />

      {loadError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Couldn&apos;t reach the PulseDesk API: {loadError}
        </div>
      ) : (
        <>
          <StatCards tickets={allTickets ?? []} />
          <TicketFilters />
          <TicketList tickets={tickets ?? []} />
        </>
      )}
    </div>
  );
}
