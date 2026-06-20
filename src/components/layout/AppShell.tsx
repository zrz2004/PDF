import type { PropsWithChildren } from 'react'
import type { AppRoute } from '@/app/router'
import { getToolById } from '@/features/tools/registry'
import { Sidebar } from './Sidebar'
import { StatusBar } from './StatusBar'
import { TitleBar } from './TitleBar'

type AppShellProps = PropsWithChildren<{
  route: AppRoute
  onNavigate: (route: AppRoute) => void
  onOpenCommand: () => void
}>

export function AppShell({ route, onNavigate, onOpenCommand, children }: AppShellProps) {
  const title = route.name === 'tool' ? getToolById(route.toolId)?.title : route.name === 'settings' ? '设置' : route.name === 'history' ? '历史记录' : '工具首页'

  return (
    <div className="app-shell app-grain flex h-full flex-col overflow-hidden text-[var(--lp-text)]">
      <TitleBar title={title} onOpenCommand={onOpenCommand} onOpenSettings={() => onNavigate({ name: 'settings' })} />
      <div className="relative z-10 flex min-h-0 flex-1 overflow-hidden px-2 pb-2 md:px-3 md:pb-3">
        <Sidebar route={route} onNavigate={onNavigate} />
        <main className="min-w-0 flex-1 overflow-hidden rounded-[24px] border border-[var(--lp-border)] bg-[var(--lp-surface-glass)] shadow-[var(--lp-shadow-soft)] backdrop-blur-md">
          {children}
        </main>
      </div>
      <StatusBar />
    </div>
  )
}
