import Image from "next/image";
import type { Ticket } from "@pulsedesk/shared";
import { IMAGES } from "./images";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function DashboardBanner({ tickets }: { tickets: Ticket[] }) {
  const awaiting = tickets.filter((t) => t.status === "NEW" || t.status === "AI_PROCESSED").length;

  return (
    <section className="relative h-44 animate-fade-in-up overflow-hidden rounded-2xl shadow-lg shadow-pulse-900/10 sm:h-48">
      <Image
        src={IMAGES.dashboardBanner}
        alt="Team collaborating around laptops"
        fill
        priority
        sizes="(min-width: 1152px) 1152px, 100vw"
        className="animate-slow-zoom object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-pulse-900/95 via-pulse-700/80 to-teal-600/30" />
      <div className="relative flex h-full flex-col justify-center gap-2 px-8 text-white">
        <p className="text-sm font-medium text-pulse-100">{greeting()} 👋</p>
        <h1 className="text-2xl font-bold sm:text-3xl">Ticket review queue</h1>
        <p className="max-w-lg text-sm text-white/80">
          {awaiting === 0
            ? "You're all caught up — nothing is waiting for review."
            : `${awaiting} ticket${awaiting === 1 ? " is" : "s are"} waiting for a human decision.`}
        </p>
      </div>
      <span className="absolute bottom-2 right-3 text-[10px] text-white/50">Photo via Unsplash</span>
    </section>
  );
}
