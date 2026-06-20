import type { CSSProperties } from 'react'
import * as Lucide from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import type { FidelityMode, ToolDefinition } from '@/features/tools/registry'
import { effectiveImplementationStatus, effectiveInputMode, externalEngineLabel } from '@/features/tools/registry'

type Props = {
  tool: ToolDefinition
  onOpen: (toolId: string) => void
}

function statusLabel(tool: ToolDefinition) {
  const status = effectiveImplementationStatus(tool)
  if (status === 'external-required') return externalEngineLabel(tool)
  if (status === 'partial') return '基础可用'
  if (status === 'coming-soon') return '即将支持'
  return '内置'
}

function statusTone(tool: ToolDefinition) {
  const status = effectiveImplementationStatus(tool)
  if (status === 'external-required') return 'blue'
  if (status === 'partial') return 'orange'
  if (status === 'ready') return 'green'
  return undefined
}

function inputModeLabel(tool: ToolDefinition) {
  const mode = effectiveInputMode(tool)
  if (mode === 'multiple-to-one') return '多文件合并'
  if (mode === 'batch') return '批量'
  return '单文件'
}

function fidelityLabel(mode: FidelityMode) {
  if (mode === 'editable-text') return '可编辑文本'
  if (mode === 'table-extract') return '可编辑表格'
  if (mode === 'ocr') return 'OCR'
  if (mode === 'native') return '原生'
  return '视觉保留'
}

function fidelityTone(mode: FidelityMode) {
  if (mode === 'editable-text' || mode === 'table-extract' || mode === 'native') return 'green'
  if (mode === 'ocr') return 'orange'
  return undefined
}

export function ToolCard({ tool, onOpen }: Props) {
  const Icon = ((Lucide as unknown as Record<string, LucideIcon>)[tool.icon] ?? Lucide.File) as LucideIcon
  const primaryFidelity = tool.fidelityModes?.slice(0, 2) ?? []

  return (
    <button
      onClick={() => onOpen(tool.id)}
      className="tool-card group min-h-[118px] p-3 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[var(--lp-accent-soft)]"
      style={{ '--tool-accent': tool.accent, '--tool-accent-soft': `${tool.accent}22` } as CSSProperties}
    >
      <div className="relative z-10 flex h-full gap-3">
        <div className="tool-icon grid h-12 w-12 shrink-0 place-items-center rounded-2xl">
          <Icon size={22} strokeWidth={2.05} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="truncate text-[15px] font-semibold tracking-tight text-[var(--lp-text)]">{tool.title}</h3>
              {tool.experimental && <Badge data-tone="orange">实验</Badge>}
            </div>
            <p className="mt-1 line-clamp-1 text-xs leading-5 text-[var(--lp-text-muted)]">{tool.description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge data-tone={statusTone(tool)}>{statusLabel(tool)}</Badge>
            {primaryFidelity.map((mode) => <Badge key={mode} data-tone={fidelityTone(mode)}>{fidelityLabel(mode)}</Badge>)}
            <span className="rounded-full border border-[var(--lp-border)] bg-[var(--lp-surface)] px-2 py-0.5 text-[10px] text-[var(--lp-text-muted)]">{inputModeLabel(tool)}</span>
            {tool.outputExtensions.slice(0, 2).map((ext) => <span key={ext} className="rounded-full border border-[var(--lp-border)] bg-[var(--lp-surface)] px-2 py-0.5 font-mono text-[10px] uppercase text-[var(--lp-text-faint)]">.{ext}</span>)}
          </div>
        </div>
      </div>
    </button>
  )
}
