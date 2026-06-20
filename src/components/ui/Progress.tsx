export function Progress({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className="h-2 overflow-hidden rounded-full bg-[var(--lp-surface-muted)]">
      <div className="h-full rounded-full bg-[var(--lp-accent)] transition-all" style={{ width: `${clamped}%` }} />
    </div>
  )
}
