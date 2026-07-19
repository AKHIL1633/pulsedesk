import { TicketListQuerySchema, type TicketListQuery } from "@pulsedesk/shared";

/** Parses raw Next.js searchParams into a validated filter object, silently
 * dropping any keys/values that don't match the schema (e.g. a stale or
 * hand-edited URL) rather than failing the page render. */
export function parseTicketFilters(
  searchParams: Record<string, string | string[] | undefined>,
): TicketListQuery {
  const raw = {
    status: firstValue(searchParams.status),
    priority: firstValue(searchParams.priority),
    category: firstValue(searchParams.category),
  };

  const result = TicketListQuerySchema.safeParse(raw);
  return result.success ? result.data : {};
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
