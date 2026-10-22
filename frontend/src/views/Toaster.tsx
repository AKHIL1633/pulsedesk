"use client";

import { useEffect, useState } from "react";

type ToastKind = "success" | "error";
interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

const EVENT = "pulsedesk:toast";

/**
 * Fires a toast from anywhere. Event-based so toasts survive the remount that
 * router.refresh() causes on the ticket detail page.
 */
export function toast(message: string, kind: ToastKind = "success") {
  window.dispatchEvent(new CustomEvent<Omit<ToastItem, "id">>(EVENT, { detail: { message, kind } }));
}

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    function onToast(e: Event) {
      const { message, kind } = (e as CustomEvent<Omit<ToastItem, "id">>).detail;
      const id = Date.now() + Math.random();
      setItems((prev) => [...prev, { id, message, kind }]);
      setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3200);
    }
    window.addEventListener(EVENT, onToast);
    return () => window.removeEventListener(EVENT, onToast);
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col gap-2" aria-live="polite">
      {items.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex animate-slide-in-right items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ring-1 ${
            t.kind === "success"
              ? "bg-white text-slate-800 ring-emerald-200"
              : "bg-red-50 text-red-800 ring-red-200"
          }`}
        >
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-white ${
              t.kind === "success" ? "bg-emerald-500" : "bg-red-500"
            }`}
          >
            {t.kind === "success" ? "✓" : "!"}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
