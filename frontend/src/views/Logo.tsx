export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <div className="group flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-pulse-400" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-pulse-gradient" />
      </span>
      <span
        className={`text-lg font-bold tracking-tight ${inverted ? "text-white" : "text-slate-900"}`}
      >
        Pulse
        <span
          className={
            inverted ? "text-pulse-100" : "bg-pulse-gradient bg-clip-text text-transparent"
          }
        >
          Desk
        </span>
      </span>
    </div>
  );
}
