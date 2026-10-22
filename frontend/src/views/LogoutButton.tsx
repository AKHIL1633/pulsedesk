"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/controllers/auth";

export function LogoutButton() {
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
    >
      Log out
    </button>
  );
}
