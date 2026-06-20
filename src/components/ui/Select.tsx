import type { SelectHTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={twMerge('studio-input w-full appearance-none', className)} {...props}>
      {children}
    </select>
  )
}
