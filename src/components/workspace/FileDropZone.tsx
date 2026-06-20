import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { FilePlus2, ShieldCheck } from 'lucide-react'
import type { ToolDefinition } from '@/features/tools/registry'
import { extensionOf, matchesExtensions } from '@/lib/fileTypes'

export type WorkspaceFile = {
  id: string
  name: string
  path: string
  size: number
  extension: string
}

type Props = {
  tool: ToolDefinition
  onFiles: (files: WorkspaceFile[]) => void
  onRejected?: (names: string[], reason: string) => void
}

export function FileDropZone({ tool, onFiles, onRejected }: Props) {
  const onDrop = useCallback((dropped: File[]) => {
    const supported = dropped.filter((file) => matchesExtensions(file.name, tool.acceptedExtensions))
    const rejected = dropped.filter((file) => !matchesExtensions(file.name, tool.acceptedExtensions))

    if (rejected.length) {
      onRejected?.(rejected.map((file) => file.name), `仅支持 ${tool.acceptedExtensions.map((ext) => `.${ext}`).join('、')}`)
    }

    if (!supported.length) return
    onFiles(supported.map((file) => {
      const electronPath = window.electronAPI?.getPathForFile?.(file)
      return {
        id: crypto.randomUUID(),
        name: file.name,
        path: electronPath || (file as File & { path?: string }).path || file.name,
        size: file.size,
        extension: extensionOf(file.name),
      }
    }))
  }, [onFiles, onRejected, tool.acceptedExtensions])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <div {...getRootProps()} className={`drag-grid grid min-h-[148px] place-items-center rounded-2xl border border-dashed p-5 text-center transition ${isDragActive ? 'border-[var(--lp-accent)] bg-[var(--lp-accent-soft)]/60' : 'border-[var(--lp-border-strong)] bg-[var(--lp-surface-muted)]/58 hover:bg-[var(--lp-surface-muted)]'}`}>
      <input {...getInputProps({ 'data-dropzone-input': true } as Record<string, unknown>)} />
      <div>
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-surface)] text-[var(--lp-accent)] shadow-sm"><FilePlus2 size={25} /></div>
        <div className="mt-3 text-sm font-semibold text-[var(--lp-text)]">拖拽文件到这里，或点击添加</div>
        <div className="mt-1 text-xs text-[var(--lp-text-muted)]">支持：{tool.acceptedExtensions.map((ext) => `.${ext}`).join('  ')}</div>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[var(--lp-border)] bg-[var(--lp-surface-glass)] px-2.5 py-1 text-[11px] text-[var(--lp-text-muted)]"><ShieldCheck size={12} /> 文件只在本机处理</div>
      </div>
    </div>
  )
}
