import { useRef, useState } from 'react'
import { File, GripVertical, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatBytes } from '@/lib/format'
import type { WorkspaceFile } from './FileDropZone'

type Props = {
  files: WorkspaceFile[]
  onRemove: (id: string) => void
  onClear: () => void
  onReorder?: (files: WorkspaceFile[]) => void
}

export function FileList({ files, onRemove, onClear, onReorder }: Props) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)
  const dragNodeRef = useRef<number | null>(null)

  function handleDragStart(index: number) {
    dragNodeRef.current = index
    setDragIndex(index)
  }

  function handleDragOver(event: React.DragEvent, index: number) {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    if (dragNodeRef.current != null && dragNodeRef.current !== index) {
      setDropIndex(index)
    }
  }

  function handleDragLeave(index: number) {
    if (dropIndex === index) setDropIndex(null)
  }

  function handleDragEnd() {
    if (dragNodeRef.current != null && dropIndex != null && dragNodeRef.current !== dropIndex && onReorder) {
      const reordered = [...files]
      const [moved] = reordered.splice(dragNodeRef.current, 1)
      reordered.splice(dropIndex, 0, moved)
      onReorder(reordered)
    }
    dragNodeRef.current = null
    setDragIndex(null)
    setDropIndex(null)
  }

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
              {files.map((file, index) => {
                const isDragging = dragIndex === index
                const isDropTarget = dropIndex === index
                return (
                  <tr
                    key={file.id}
                    draggable={!!onReorder}
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={() => handleDragLeave(index)}
                    onDragEnd={handleDragEnd}
                    className={`group transition ${isDragging ? 'opacity-40' : ''} ${isDropTarget ? 'border-t-2 border-t-[var(--lp-accent)]' : ''} hover:bg-[var(--lp-surface-muted)]/60`}
                    style={{ cursor: onReorder ? 'grab' : undefined }}
                  >
                    <td className="px-3 py-3 font-mono text-xs text-[var(--lp-text-faint)]">
                      <div className="flex items-center gap-1">
                        <GripVertical size={14} className={`shrink-0 ${onReorder ? 'cursor-grab text-[var(--lp-text-muted)]' : 'text-[var(--lp-text-faint)]'}`} />
                        <span>{index + 1}</span>
                      </div>
                    </td>
                    <td className="min-w-0 px-3 py-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <File size={16} className="shrink-0 text-[var(--lp-text-muted)]" />
                        <span className="truncate text-[var(--lp-text)]">{file.name}</span>
                      </div>
                      <div className="mt-1 truncate font-mono text-[11px] text-[var(--lp-text-faint)]">{file.path}</div>
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-[var(--lp-text-muted)]">{formatBytes(file.size)}</td>
                    <td className="px-3 py-3 text-xs text-[var(--lp-green)]">可用</td>
                    <td className="px-3 py-3"><button onClick={() => onRemove(file.id)} className="text-[var(--lp-text-faint)] hover:text-[var(--lp-danger)]"><Trash2 size={15} /></button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
