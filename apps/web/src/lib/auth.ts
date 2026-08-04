"use client";

import { login as loginRequest } from "./api";
import { AUTH_TOKEN_COOKIE, AUTH_USER_COOKIE } from "./authCookies";

// Matches the JWT's own expiry (apps/api/src/auth/jwt.ts).
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export async function login(email: string, password: string): Promise<void> {
  const { token, user } = await loginRequest(email, password);
  document.cookie = `${AUTH_TOKEN_COOKIE}=${token}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; samesite=lax`;
  document.cookie = `${AUTH_USER_COOKIE}=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; samesite=lax`;
}

export function logout(): void {
  document.cookie = `${AUTH_TOKEN_COOKIE}=; path=/; max-age=0`;
  document.cookie = `${AUTH_USER_COOKIE}=; path=/; max-age=0`;
}
