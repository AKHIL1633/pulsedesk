import Link from "next/link";
import { cookies } from "next/headers";
import type { AuthUser } from "@pulsedesk/shared";
import { Logo } from "./Logo";
import { LogoutButton } from "./LogoutButton";
import { initials } from "./format";
import { AUTH_USER_COOKIE } from "@/models/authCookies";

async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(AUTH_USER_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as AuthUser;
  } catch {
    return null;
  }
}

export async function Header() {
  const user = await getCurrentUser();
  // The login page has its own full-bleed layout.
  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="transition-opacity hover:opacity-80">
          <Logo />
        </Link>
        <div className="flex items-center gap-4">
          <p className="hidden text-sm text-slate-500 md:block">
            AI-triaged support, human-reviewed.
          </p>
          <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
            <span
              title={user.email}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-pulse-gradient text-xs font-semibold text-white shadow-sm"
            >
              {initials(user.name || user.email)}
            </span>
            <span className="hidden text-sm text-slate-600 sm:block">{user.name || user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  );
}
