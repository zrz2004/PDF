import { useEffect, useMemo, useState } from 'react'
import { Command, FileSearch } from 'lucide-react'
import { AppProviders } from '@/app/providers'
import type { AppRoute } from '@/app/router'
import { homeRoute } from '@/app/router'
import { AppShell } from '@/components/layout/AppShell'
import { ToolGrid } from '@/components/tools/ToolGrid'
import { ToolWorkspace } from '@/components/workspace/ToolWorkspace'
import { HistoryPage } from '@/features/history/HistoryPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import type { ToolCategoryId } from '@/features/tools/categories'
import { toolRegistry, externalEngineLabel } from '@/features/tools/registry'

function CommandPalette({ open, onClose, onOpenTool }: { open: boolean; onClose: () => void; onOpenTool: (toolId: string) => void }) {
  const [query, setQuery] = useState('')
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return toolRegistry.slice(0, 9)
    return toolRegistry.filter((tool) => `${tool.title} ${tool.description} ${tool.acceptedExtensions.join(' ')}`.toLowerCase().includes(q)).slice(0, 12)
  }, [query])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(20,20,19,.42)] p-6 backdrop-blur-sm" onMouseDown={onClose}>
      <div className="mx-auto mt-[8vh] max-w-2xl overflow-hidden rounded-[28px] border border-[var(--lp-border)] bg-[var(--lp-surface)] shadow-[var(--lp-shadow-soft)]" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-[var(--lp-border)] px-4 py-3">
          <Command size={18} className="text-[var(--lp-accent)]" />
          <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索工具、格式、操作…" className="h-10 flex-1 bg-transparent text-sm text-[var(--lp-text)] outline-none placeholder:text-[var(--lp-text-faint)]" />
          <kbd className="rounded-md border border-[var(--lp-border)] bg-[var(--lp-surface-muted)] px-2 py-1 font-mono text-[11px] text-[var(--lp-text-faint)]">ESC</kbd>
        </div>
        <div className="max-h-[420px] overflow-auto p-2">
          {results.map((tool) => (
            <button key={tool.id} onClick={() => { onOpenTool(tool.id); onClose() }} className="flex w-full items-center gap-3 rounded-2xl p-3 text-left transition hover:bg-[var(--lp-surface-muted)]">
              <span className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--lp-border)]" style={{ color: tool.accent, background: `${tool.accent}16` }}><FileSearch size={19} /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-[var(--lp-text)]">{tool.title}</span>
                <span className="mt-0.5 block truncate text-xs text-[var(--lp-text-muted)]">{tool.description}</span>
              </span>
              <span className="hidden font-mono text-[11px] text-[var(--lp-text-faint)] sm:block">{externalEngineLabel(tool) || tool.outputExtensions.map((ext) => `.${ext}`).join(' ')}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function AppContent() {
  const [route, setRoute] = useState<AppRoute>(homeRoute)
  const [commandOpen, setCommandOpen] = useState(false)
  const currentCategory: ToolCategoryId = route.name === 'home' ? route.category ?? 'popular' : route.name === 'tool' ? route.fromCategory ?? 'popular' : 'popular'

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setCommandOpen((open) => !open)
      }
      if (event.key === 'Escape') setCommandOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  function openTool(toolId: string) {
    setRoute({ name: 'tool', toolId, fromCategory: currentCategory })
  }

  return (
    <>
      <AppShell route={route} onNavigate={setRoute} onOpenCommand={() => setCommandOpen(true)}>
        {route.name === 'home' && <ToolGrid category={route.category ?? 'popular'} onCategoryChange={(category) => setRoute({ name: 'home', category })} onOpenTool={openTool} />}
        {route.name === 'tool' && <ToolWorkspace toolId={route.toolId} onBack={() => setRoute({ name: 'home', category: route.fromCategory ?? 'popular' })} />}
        {route.name === 'history' && <HistoryPage />}
        {route.name === 'settings' && <SettingsPage />}
      </AppShell>
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} onOpenTool={openTool} />
    </>
  )
}

export default function App() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  )
}
