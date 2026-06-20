import { File, GripVertical, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatBytes } from '@/lib/format'
import type { WorkspaceFile } from './FileDropZone'

type Props = {
  files: WorkspaceFile[]
  onRemove: (id: string) => void
  onClear: () => void
}

export function FileList({ files, onRemove, onClear }: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-surface-glass)]">
      <div className="flex items-center justify-between border-b border-[var(--lp-border)] px-4 py-3">
        <div className="text-sm font-semibold">文件列表</div>
        <Button variant="ghost" className="h-8 px-2.5 text-xs" onClick={onClear} disabled={files.length === 0}>清空</Button>
      </div>
      <div className="max-h-[260px] overflow-auto">
        {files.length === 0 ? (
          <div className="grid h-32 place-items-center text-sm text-[var(--lp-text-faint)]">尚未添加文件</div>
        ) : (
          <table className="w-full table-fixed text-left text-sm">
            <thead className="sticky top-0 bg-[var(--lp-surface)] font-mono text-[11px] uppercase text-[var(--lp-text-faint)]">
              <tr>
                <th className="w-12 px-3 py-2">No.</th>
                <th className="px-3 py-2">名称</th>
                <th className="w-24 px-3 py-2">大小</th>
                <th className="w-24 px-3 py-2">状态</th>
                <th className="w-12 px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--lp-border)]">
              {files.map((file, index) => (
                <tr key={file.id} className="group hover:bg-[var(--lp-surface-muted)]/60">
                  <td className="px-3 py-3 font-mono text-xs text-[var(--lp-text-faint)]">{index + 1}</td>
                  <td className="min-w-0 px-3 py-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <GripVertical size={14} className="shrink-0 text-[var(--lp-text-faint)]" />
                      <File size={16} className="shrink-0 text-[var(--lp-text-muted)]" />
                      <span className="truncate text-[var(--lp-text)]">{file.name}</span>
                    </div>
                    <div className="mt-1 truncate font-mono text-[11px] text-[var(--lp-text-faint)]">{file.path}</div>
                  </td>
                  <td className="px-3 py-3 font-mono text-xs text-[var(--lp-text-muted)]">{formatBytes(file.size)}</td>
                  <td className="px-3 py-3 text-xs text-[var(--lp-green)]">可用</td>
                  <td className="px-3 py-3"><button onClick={() => onRemove(file.id)} className="text-[var(--lp-text-faint)] hover:text-[var(--lp-danger)]"><Trash2 size={15} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
