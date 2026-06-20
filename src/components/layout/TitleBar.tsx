import { Minus, Search, Settings, Square, X } from 'lucide-react'
import { APP_NAME } from '@/app/constants'
import { Button } from '@/components/ui/Button'
import logo from '@/assets/localpdf-logo.svg'

type TitleBarProps = {
  title?: string
  onOpenSettings: () => void
  onOpenCommand: () => void
}

export function TitleBar({ title, onOpenSettings, onOpenCommand }: TitleBarProps) {
  const appWindow = window.electronAPI

  return (
    <header className="electron-drag relative z-20 flex h-14 shrink-0 items-center justify-between px-3 text-[var(--lp-text)]">
      <div className="flex min-w-0 items-center gap-3">
        <img src={logo} alt="LocalPDF Studio" className="h-8 w-8 rounded-xl border border-[var(--lp-border)] bg-[var(--lp-bg-ink)] shadow-[0_10px_30px_rgba(20,20,19,.14)]" />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold tracking-tight">{title ?? APP_NAME}</div>
          <div className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--lp-text-faint)]">本机私有转换 · 不上传</div>
        </div>
      </div>

      <div className="electron-no-drag flex items-center gap-2">
        <button onClick={onOpenCommand} className="hidden items-center gap-2 rounded-full border border-[var(--lp-border)] bg-[var(--lp-surface-glass)] px-3 py-1.5 text-xs text-[var(--lp-text-muted)] shadow-sm transition hover:border-[var(--lp-accent-soft)] hover:bg-[var(--lp-surface)] md:flex">
          <Search size={14} />
          <span>搜索工具</span>
          <kbd className="rounded-md border border-[var(--lp-border)] bg-[var(--lp-surface-muted)] px-1.5 py-0.5 font-mono text-[10px]">Ctrl K</kbd>
        </button>
        <Button variant="ghost" className="h-9 w-9 rounded-full p-0" onClick={onOpenSettings} title="设置">
          <Settings size={15} />
        </Button>
        <div className="ml-1 flex items-center overflow-hidden rounded-full border border-[var(--lp-border)] bg-[var(--lp-surface-glass)] shadow-sm">
          <button className="grid h-8 w-10 place-items-center text-[var(--lp-text-muted)] transition hover:bg-[var(--lp-surface-muted)]" onClick={() => appWindow?.minimize()}><Minus size={15} /></button>
          <button className="grid h-8 w-10 place-items-center text-[var(--lp-text-muted)] transition hover:bg-[var(--lp-surface-muted)]" onClick={() => appWindow?.toggleMaximize()}><Square size={13} /></button>
          <button className="grid h-8 w-10 place-items-center text-[var(--lp-text-muted)] transition hover:bg-[var(--lp-danger)] hover:text-white" onClick={() => appWindow?.close()}><X size={15} /></button>
        </div>
      </div>
    </header>
  )
}
