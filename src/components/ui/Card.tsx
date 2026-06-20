import type { PropsWithChildren } from 'react'
import { twMerge } from 'tailwind-merge'

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <section className={twMerge('panel', className)}>{children}</section>
}
