import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatBytes } from '@/lib/format'

type Props = {
  filePath?: string
  pageCount?: number
  fileSize?: number
  currentPage: number
  onPageChange: (page: number) => void
}

type PageRender = {
  pageNumber: number
  width: number
  height: number
  dataUrl: string
}

export function PdfPreview({ filePath, pageCount, fileSize, currentPage, onPageChange }: Props) {
  const [render, setRender] = useState<PageRender | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const cancelledRef = useRef(false)

  useEffect(() => {
    if (!filePath || !window.electronAPI?.renderPdfPage) return
    cancelledRef.current = false
    setLoading(true)
    setError('')
    window.electronAPI.renderPdfPage(filePath, currentPage).then((result) => {
      if (!cancelledRef.current) setRender(result)
    }).catch((err) => {
      if (!cancelledRef.current) setError(err instanceof Error ? err.message : String(err))
    }).finally(() => {
      if (!cancelledRef.current) setLoading(false)
    })
    return () => { cancelledRef.current = true }
  }, [filePath, currentPage])

  if (!filePath) {
    return (
      <div className="grid min-h-0 flex-1 place-items-center bg-[var(--lp-surface-muted)]/60 p-6 text-center text-[var(--lp-text-muted)]">
        <div>
          <FileText className="mx-auto mb-3 text-[var(--lp-accent)]" size={42} />
          <div className="text-sm font-semibold text-[var(--lp-text)]">PDF 预览</div>
          <div className="mt-1 text-xs">添加 PDF 文件后显示页面预览</div>
        </div>
      </div>
    )
  }

  const canPrev = currentPage > 1
  const canNext = pageCount != null && currentPage < pageCount

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-[var(--lp-border)] px-4 py-2 text-xs text-[var(--lp-text-muted)]">
        <span className="font-semibold text-[var(--lp-text)]">PDF 预览</span>
        <div className="flex items-center gap-2">
          {render && <span className="font-mono">{render.width} x {render.height}</span>}
          {fileSize != null && <span className="font-mono">{formatBytes(fileSize)}</span>}
          {pageCount != null && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" className="h-7 w-7 p-0" onClick={() => canPrev && onPageChange(currentPage - 1)} disabled={!canPrev || loading}>
                <ChevronLeft size={14} />
              </Button>
              <span className="min-w-[60px] text-center font-mono">{currentPage} / {pageCount}</span>
              <Button variant="ghost" className="h-7 w-7 p-0" onClick={() => canNext && onPageChange(currentPage + 1)} disabled={!canNext || loading}>
                <ChevronRight size={14} />
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto bg-[var(--lp-surface-muted)]/60 p-4">
        {loading && !render && <div className="text-sm text-[var(--lp-text-muted)]">渲染第 {currentPage} 页...</div>}
        {error && (
          <div className="text-center">
            <FileText className="mx-auto mb-2 text-[var(--lp-warning)]" size={32} />
            <div className="text-sm text-[var(--lp-warning)]">渲染失败</div>
            <div className="mt-1 text-xs text-[var(--lp-text-muted)]">{error}</div>
          </div>
        )}
        {render && (
          <img
            src={render.dataUrl}
            alt={`PDF 第 ${render.pageNumber} 页`}
            className="max-h-full max-w-full rounded-lg border border-[var(--lp-border)] object-contain shadow-md"
          />
        )}
        {loading && render && (
          <div className="absolute inset-0 z-10 grid place-items-center rounded-lg bg-[var(--lp-surface-muted)]/50">
            <div className="rounded-lg bg-[var(--lp-surface)]/90 px-4 py-2 text-xs text-[var(--lp-text-muted)] shadow-sm">
              渲染第 {currentPage} 页...
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
