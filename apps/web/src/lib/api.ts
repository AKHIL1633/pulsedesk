import type { LoginResponse, Ticket, TicketListQuery, UpdateTicketInput } from "@pulsedesk/shared";
import { AUTH_TOKEN_COOKIE, AUTH_USER_COOKIE } from "./authCookies";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Reads the reviewer's JWT from the cookie. Browser-only — returns null during SSR. */
function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${AUTH_TOKEN_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function clearAuthCookies() {
  document.cookie = `${AUTH_TOKEN_COOKIE}=; path=/; max-age=0`;
  document.cookie = `${AUTH_USER_COOKIE}=; path=/; max-age=0`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    // A stale/expired token on a protected route (e.g. PATCH) — bounce back to login.
    // Login itself also returns 401 for wrong credentials, which is a normal
    // in-page error, not a session expiry — don't redirect away from it.
    const isLoginRequest = path === "/api/auth/login";
    if (res.status === 401 && !isLoginRequest && typeof window !== "undefined") {
      clearAuthCookies();
      window.location.href = "/login";
    }
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, body.error ?? "Request failed");
  }

  return res.json() as Promise<T>;
}

export function login(email: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function fetchTickets(filters: Partial<TicketListQuery> = {}): Promise<Ticket[]> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.category) params.set("category", filters.category);
  const query = params.toString();
  return request<Ticket[]>(`/api/tickets${query ? `?${query}` : ""}`);
}

export function fetchTicket(id: string): Promise<Ticket> {
  return request<Ticket>(`/api/tickets/${id}`);
}

export function updateTicket(id: string, input: UpdateTicketInput): Promise<Ticket> {
  return request<Ticket>(`/api/tickets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
