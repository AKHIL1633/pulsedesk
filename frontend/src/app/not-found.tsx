import Link from "next/link";

export default function NotFound() {
  return (
    <div className="animate-fade-in-up rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
      <p className="text-5xl">🔍</p>
      <p className="mt-4 text-lg font-semibold text-slate-900">Ticket not found</p>
      <p className="mt-1 text-sm text-slate-500">That ticket doesn&apos;t exist or was removed.</p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-lg bg-pulse-gradient px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5"
      >
        Back to tickets
      </Link>
    </div>
  );
}
