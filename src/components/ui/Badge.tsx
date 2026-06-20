import type { HTMLAttributes, PropsWithChildren } from 'react'
import { twMerge } from 'tailwind-merge'

export function Badge({ children, className, ...props }: PropsWithChildren<HTMLAttributes<HTMLSpanElement>>) {
  return <span className={twMerge('status-pill', className)} {...props}>{children}</span>
}
