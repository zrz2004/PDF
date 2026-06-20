import type { PropsWithChildren } from 'react'

export function Dialog({ open, children }: PropsWithChildren<{ open: boolean }>) {
  if (!open) return null
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-6">{children}</div>
}
