/**
 * Cookie names shared between middleware.ts (edge), api.ts/auth.ts (client),
 * and Header.tsx (server) — all three need to agree on where the reviewer
 * session lives.
 */
export const AUTH_TOKEN_COOKIE = "pulsedesk_token";
export const AUTH_USER_COOKIE = "pulsedesk_user";
