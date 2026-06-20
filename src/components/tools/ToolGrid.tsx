import { useMemo, useState, type CSSProperties } from 'react'
import { ArrowRight, FilePlus2, LockKeyhole, Sparkles } from 'lucide-react'
import { APP_TAGLINE } from '@/app/constants'
import { Button } from '@/components/ui/Button'
import type { ToolCategoryId } from '@/features/tools/categories'
import { requiredExternalEngines, toolRegistry, toolsForCategory } from '@/features/tools/registry'
import logo from '@/assets/localpdf-logo.svg'
import { ToolCard } from './ToolCard'
import { ToolCategoryTabs } from './ToolCategoryTabs'
import { ToolSearch } from './ToolSearch'

type Props = {
  category: ToolCategoryId
  onCategoryChange: (category: ToolCategoryId) => void
  onOpenTool: (toolId: string) => void
}

const quickToolIds = ['pdf-to-word', 'pdf-to-excel', 'pdf-to-pptx', 'merge-pdf', 'compress-pdf', 'word-to-pdf']

export function ToolGrid({ category, onCategoryChange, onOpenTool }: Props) {
  const [query, setQuery] = useState('')

  const tools = useMemo(() => {
    const source = query.trim() ? toolRegistry : toolsForCategory(category)
    const q = query.trim().toLowerCase()
    if (!q) return source
    return source.filter((tool) => `${tool.title} ${tool.description} ${tool.acceptedExtensions.join(' ')} ${tool.outputExtensions.join(' ')}`.toLowerCase().includes(q))
  }, [category, query])

  const quickTools = useMemo(() => quickToolIds.map((id) => toolRegistry.find((tool) => tool.id === id)).filter(Boolean), [])
  const builtInCount = toolRegistry.filter((tool) => requiredExternalEngines(tool).length === 0).length
  const externalCount = toolRegistry.length - builtInCount
  const editableCount = toolRegistry.filter((tool) => tool.fidelityModes?.some((mode) => ['editable-text', 'table-extract', 'native'].includes(mode))).length

  return (
    <div className="h-full overflow-auto bg-transparent p-3 sm:p-4 md:p-5 xl:p-6">
      <section className="panel relative overflow-hidden p-4 sm:p-5 xl:p-6">
        <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-[var(--lp-accent-soft)]/55 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-16 h-28 w-28 rounded-full bg-[var(--lp-blue-soft)]/70 blur-3xl" />
        <div className="relative z-10 grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-stretch">
          <div className="min-w-0">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <img src={logo} alt="LocalPDF Studio" className="h-12 w-12 shrink-0 rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-bg-ink)] p-1 shadow-[var(--lp-shadow-card)]" />
              <div className="min-w-0">
                <div className="status-pill w-fit" data-tone="orange"><Sparkles size={13} /> 本地私有转换工作台</div>
                <h1 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-[var(--lp-text)] sm:text-3xl xl:text-4xl">文件格式转换，不离开本机</h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--lp-text-muted)]">{APP_TAGLINE}。能力、依赖、可编辑性和输出状态直接可见。</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center xl:max-w-4xl">
              <ToolSearch value={query} onChange={setQuery} />
              <Button variant="primary" onClick={() => onOpenTool('pdf-to-word')} className="justify-center whitespace-nowrap"><FilePlus2 size={16} /> 开始转换</Button>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {quickTools.map((tool) => tool && (
                <button key={tool.id} onClick={() => onOpenTool(tool.id)} className="group flex min-w-0 items-center gap-2 rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-surface)]/80 px-3 py-2 text-left text-xs text-[var(--lp-text)] transition hover:-translate-y-0.5 hover:border-[var(--lp-accent-soft)] hover:shadow-sm" style={{ '--tool-accent': tool.accent } as CSSProperties}>
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--tool-accent)]" />
                  <span className="truncate">{tool.title}</span>
                </button>
              ))}
            </div>
          </div>

          <aside className="grid gap-3 rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-surface-muted)]/58 p-3 sm:grid-cols-3 xl:grid-cols-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--lp-text)] sm:col-span-3 xl:col-span-1"><LockKeyhole size={16} /> 能力概览</div>
            <div className="rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-surface)] p-3">
              <div className="text-xs text-[var(--lp-text-muted)]">内置工具</div>
              <div className="mt-1 text-2xl font-semibold">{builtInCount}</div>
            </div>
            <div className="rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-surface)] p-3">
              <div className="text-xs text-[var(--lp-text-muted)]">需外部引擎</div>
              <div className="mt-1 text-2xl font-semibold">{externalCount}</div>
            </div>
            <div className="rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-surface)] p-3">
              <div className="text-xs text-[var(--lp-text-muted)]">可编辑输出</div>
              <div className="mt-1 text-2xl font-semibold">{editableCount}</div>
            </div>
            <button onClick={() => onOpenTool('word-to-pdf')} className="flex items-center justify-between rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-surface)] px-3 py-2.5 text-sm text-[var(--lp-text)] transition hover:border-[var(--lp-accent-soft)] sm:col-span-3 xl:col-span-1">
              配置 Office 转 PDF <ArrowRight size={16} />
            </button>
          </aside>
        </div>
      </section>

      <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <ToolCategoryTabs active={category} onChange={onCategoryChange} />
        <div className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--lp-text-faint)]">{tools.length} 个工具</div>
      </div>

      <section className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {tools.map((tool) => <ToolCard key={tool.id} tool={tool} onOpen={onOpenTool} />)}
      </section>
    </div>
  )
}
