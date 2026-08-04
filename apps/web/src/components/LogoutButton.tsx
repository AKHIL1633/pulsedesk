"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";

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
      className="text-sm font-medium text-slate-500 hover:text-slate-700"
    >
      Log out
    </button>
  );
}
