import type { PropsWithChildren } from 'react'

export function SplitPane({ children }: PropsWithChildren) {
  return <div className="workspace-grid">{children}</div>
}
