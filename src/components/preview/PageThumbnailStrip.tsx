import { useCallback, useEffect, useState } from 'react'

type Props = {
  filePath?: string
  pageCount?: number
  currentPage: number
  onPageChange: (page: number) => void
}

type Thumbnail = {
  pageNumber: number
  dataUrl: string
}

const MAX_THUMBNAILS = 8

export function PageThumbnailStrip({ filePath, pageCount, currentPage, onPageChange }: Props) {
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([])
  const [loading, setLoading] = useState(false)

  const loadThumbnails = useCallback(async () => {
    if (!filePath || !pageCount || !window.electronAPI?.renderPdfPage) return
    const count = Math.min(pageCount, MAX_THUMBNAILS)
    setLoading(true)
    try {
      const results: Thumbnail[] = []
      for (let page = 1; page <= count; page++) {
        try {
          const result = await window.electronAPI.renderPdfPage(filePath, page)
          results.push({ pageNumber: result.pageNumber, dataUrl: result.dataUrl })
        } catch {
          // skip pages that fail to render
        }
        setThumbnails([...results])
      }
    } finally {
      setLoading(false)
    }
  }, [filePath, pageCount])

  useEffect(() => {
    setThumbnails([])
    loadThumbnails()
  }, [loadThumbnails])

  if (!filePath || !pageCount) return null

  return (
    <div className="flex gap-2 overflow-x-auto border-t border-[var(--lp-border)] bg-[var(--lp-surface-muted)]/60 p-3">
      {loading && thumbnails.length === 0 && (
        <div className="flex h-16 items-center px-2 text-xs text-[var(--lp-text-muted)]">加载缩略图...</div>
      )}
      {thumbnails.map((thumb) => {
        const isActive = thumb.pageNumber === currentPage
        return (
          <button
            key={thumb.pageNumber}
            onClick={() => onPageChange(thumb.pageNumber)}
            className={`shrink-0 overflow-hidden rounded-lg border-2 transition ${isActive ? 'border-[var(--lp-accent)] shadow-sm' : 'border-transparent hover:border-[var(--lp-border-strong)]'}`}
            title={`第 ${thumb.pageNumber} 页`}
          >
            <img
              src={thumb.dataUrl}
              alt={`第 ${thumb.pageNumber} 页`}
              className="h-16 w-auto object-cover"
            />
          </button>
        )
      })}
      {thumbnails.length > 0 && pageCount > MAX_THUMBNAILS && (
        <div className="flex h-16 shrink-0 items-center px-2 text-xs text-[var(--lp-text-muted)]">
          共 {pageCount} 页
        </div>
      )}
    </div>
  )
}
