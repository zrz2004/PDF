export function PageThumbnailStrip() {
  return (
    <div className="flex gap-2 overflow-x-auto border-t border-[var(--lp-border)] bg-[var(--lp-surface-muted)]/60 p-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="grid h-20 w-14 shrink-0 place-items-center rounded-lg border border-[var(--lp-border)] bg-[#fffdf8] text-xs font-mono text-black/60">{index + 1}</div>
      ))}
    </div>
  )
}
