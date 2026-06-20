import type { PropsWithChildren } from 'react'

export function Toolbar({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-[58px] flex-wrap items-center gap-2 border-b border-[var(--lp-border)] bg-[var(--lp-surface-glass)] px-3 py-2 backdrop-blur-md">
      {children}
    </div>
  )
}
