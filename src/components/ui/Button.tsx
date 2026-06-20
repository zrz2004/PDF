import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import { twMerge } from 'tailwind-merge'
import clsx from 'clsx'

type ButtonVariant = 'default' | 'primary' | 'danger' | 'ghost'

export function Button({ children, className, variant = 'default', ...props }: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }>) {
  return (
    <button
      className={twMerge(
        clsx(
          'studio-button',
          variant === 'primary' && 'studio-button-primary',
          variant === 'danger' && 'border-[#b34d42]/40 bg-[#b34d42]/10 text-[#8e332b] hover:border-[#b34d42] hover:bg-[#b34d42]/15',
          variant === 'ghost' && 'border-transparent bg-transparent shadow-none hover:border-[var(--lp-border)] hover:bg-[var(--lp-surface-muted)]',
        ),
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
