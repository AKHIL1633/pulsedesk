"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LOW_CONFIDENCE_THRESHOLD, type Ticket } from "@pulsedesk/shared";
import { useCountUp } from "@/controllers/useCountUp";

interface Stat {
  label: string;
  value: number;
  href: string;
  hint: string;
  accent: string;
  icon: string;
}

function StatCard({ stat, active, index }: { stat: Stat; active: boolean; index: number }) {
  const value = useCountUp(stat.value);
  return (
    <Link
      href={stat.href}
      style={{ animationDelay: `${index * 70}ms` }}
      className={`group relative animate-fade-in-up overflow-hidden rounded-xl border bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
        active ? "border-pulse-400 ring-2 ring-pulse-100" : "border-slate-200"
      }`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 ${stat.accent}`} />
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{stat.label}</p>
        <span className="text-lg transition-transform group-hover:scale-125">{stat.icon}</span>
      </div>
      <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-400 group-hover:text-pulse-600">{stat.hint} →</p>
    </Link>
  );
}

export function StatCards({ tickets }: { tickets: Ticket[] }) {
  const searchParams = useSearchParams();
  const current = searchParams.toString();

  const stats: Stat[] = [
    {
      label: "All tickets",
      value: tickets.length,
      href: "/",
      hint: "View all",
      accent: "bg-pulse-gradient",
      icon: "📥",
    },
    {
      label: "Needs review",
      value: tickets.filter((t) => t.status === "AI_PROCESSED").length,
      href: "/?status=AI_PROCESSED",
      hint: "Review AI suggestions",
      accent: "bg-pulse-500",
      icon: "🤖",
    },
    {
      label: "Urgent",
      value: tickets.filter((t) => t.priority === "URGENT").length,
      href: "/?priority=URGENT",
      hint: "Handle first",
      accent: "bg-red-500",
      icon: "🔥",
    },
    {
      label: "Low confidence",
      value: tickets.filter(
        (t) => t.aiConfidence !== null && t.aiConfidence < LOW_CONFIDENCE_THRESHOLD,
      ).length,
      href: "/?status=AI_PROCESSED",
      hint: "Double-check these",
      accent: "bg-amber-400",
      icon: "⚠️",
    },
    {
      label: "Resolved",
      value: tickets.filter((t) => t.status === "RESOLVED").length,
      href: "/?status=RESOLVED",
      hint: "See closed",
      accent: "bg-emerald-500",
      icon: "✅",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((stat, i) => (
        <StatCard
          key={stat.label}
          stat={stat}
          index={i}
          active={stat.href !== "/" && `/?${current}` === stat.href && stat.label !== "Low confidence"}
        />
      ))}
    </div>
  );
}
