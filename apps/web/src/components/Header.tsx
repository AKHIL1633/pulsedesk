import Link from "next/link";
import { cookies } from "next/headers";
import type { AuthUser } from "@pulsedesk/shared";
import { Logo } from "./Logo";
import { LogoutButton } from "./LogoutButton";
import { AUTH_USER_COOKIE } from "@/lib/authCookies";

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

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/">
          <Logo />
        </Link>
        <div className="flex items-center gap-4">
          <p className="text-sm text-slate-500">AI-triaged support, human-reviewed.</p>
          {user && (
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <span className="text-sm text-slate-600">{user.email}</span>
              <LogoutButton />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
