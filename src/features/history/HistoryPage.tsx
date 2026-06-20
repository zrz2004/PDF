import { AlertCircle, CheckCircle2, Clock3, ExternalLink, FolderOpen, Trash2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useHistoryStore, type HistoryItem } from './historyStore'

function folderFor(filePath: string) {
  const slash = Math.max(filePath.lastIndexOf('\\'), filePath.lastIndexOf('/'))
  return slash > 0 ? filePath.slice(0, slash) : filePath
}

function statusMeta(status: HistoryItem['status']) {
  if (status === 'succeeded') return { label: '成功', tone: 'green', icon: CheckCircle2 }
  if (status === 'cancelled') return { label: '已取消', tone: 'orange', icon: XCircle }
  return { label: '失败', tone: undefined, icon: AlertCircle }
}

export function HistoryPage() {
  const items = useHistoryStore((state) => state.items)
  const clear = useHistoryStore((state) => state.clear)

  return (
    <div className="h-full overflow-auto p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">历史记录</h1>
          <p className="mt-2 text-sm text-[var(--lp-text-muted)]">查看本机转换任务。清空历史不会删除输出文件。</p>
        </div>
        <Button variant="ghost" onClick={clear}><Trash2 size={16} /> 清空</Button>
      </div>
      <Card className="p-4">
        {items.length === 0 ? (
          <div className="grid min-h-[360px] place-items-center text-center text-[var(--lp-text-muted)]">
            <div>
              <Clock3 className="mx-auto mb-3 text-[var(--lp-text-faint)]" size={36} />
              <div className="text-sm text-[var(--lp-text)]">还没有转换历史</div>
              <div className="mt-1 text-xs text-[var(--lp-text-faint)]">完成任务后会出现在这里。</div>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[var(--lp-border)]">
            {items.map((item) => {
              const meta = statusMeta(item.status)
              const Icon = meta.icon
              const firstOutput = item.outputFiles[0]
              return (
                <div key={item.id} className="grid gap-3 py-4 text-sm xl:grid-cols-[1fr_auto_auto] xl:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-medium text-[var(--lp-text)]">{item.toolTitle}</div>
                      <span className="status-pill" data-tone={meta.tone}><Icon size={12} /> {meta.label}</span>
                    </div>
                    <div className="mt-1 font-mono text-xs text-[var(--lp-text-faint)]">{firstOutput || item.outputDirectory}</div>
                    {item.error && <div className="mt-2 rounded-xl border border-[var(--lp-danger)]/25 bg-[var(--lp-danger-soft)]/45 p-2 text-xs text-[var(--lp-danger)]">{item.error}</div>}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--lp-text-muted)]">
                    <span>{item.inputCount} 个文件</span>
                    <span className="font-mono text-[var(--lp-text-faint)]">{new Date(item.finishedAt).toLocaleString()}</span>
                  </div>
                  <div className="flex flex-wrap justify-start gap-2 xl:justify-end">
                    <Button variant="ghost" className="h-8 px-2.5 text-xs" disabled={!firstOutput} onClick={() => firstOutput && window.electronAPI?.openPath?.(firstOutput)}><ExternalLink size={14} /> 打开文件</Button>
                    <Button variant="ghost" className="h-8 px-2.5 text-xs" disabled={!firstOutput} onClick={() => firstOutput && window.electronAPI?.openPath?.(folderFor(firstOutput))}><FolderOpen size={14} /> 打开文件夹</Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
