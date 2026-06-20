import type { PropsWithChildren } from 'react'

export function Tooltip({ children }: PropsWithChildren<{ text?: string }>) {
  return <>{children}</>
}
