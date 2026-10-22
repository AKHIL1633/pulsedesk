export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-44 animate-pulse rounded-2xl bg-gradient-to-r from-pulse-100 to-slate-100" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-white ring-1 ring-slate-200" />
        ))}
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-white ring-1 ring-slate-200" />
        ))}
      </div>
    </div>
  );
}
