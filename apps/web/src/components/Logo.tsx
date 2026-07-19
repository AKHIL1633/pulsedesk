export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-full bg-pulse-gradient" />
      <span className="text-lg font-bold tracking-tight text-slate-900">
        Pulse<span className="bg-pulse-gradient bg-clip-text text-transparent">Desk</span>
      </span>
    </div>
  );
}
