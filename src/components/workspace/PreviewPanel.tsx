import { useEffect, useState } from 'react'
import type { ToolDefinition } from '@/features/tools/registry'
import { effectivePreviewMode } from '@/features/tools/registry'
import type { WorkspaceFile } from './FileDropZone'
import { ImagePreview } from '@/components/preview/ImagePreview'
import { OfficePreviewPlaceholder } from '@/components/preview/OfficePreviewPlaceholder'
import { PageThumbnailStrip } from '@/components/preview/PageThumbnailStrip'
import { PdfPreview } from '@/components/preview/PdfPreview'

type Props = {
  tool: ToolDefinition
  files: WorkspaceFile[]
}

export function PreviewPanel({ tool, files }: Props) {
  const firstFile = files[0]
  const firstExtension = firstFile?.extension
  const isPdf = tool.acceptedExtensions.includes('pdf') || firstExtension === 'pdf'
  const isImage = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff'].includes(firstExtension ?? '')
  const previewMode = effectivePreviewMode(tool)

  const [pdfInfo, setPdfInfo] = useState<{ pageCount: number; fileSize: number } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (!isPdf || !firstFile?.path || !window.electronAPI?.getPdfInfo) {
      setPdfInfo(null)
      setCurrentPage(1)
      return
    }
    let cancelled = false
    window.electronAPI.getPdfInfo(firstFile.path).then((info) => {
      if (!cancelled) setPdfInfo(info)
    }).catch(() => {
      if (!cancelled) setPdfInfo(null)
    })
    return () => { cancelled = true }
  }, [isPdf, firstFile?.path])

  useEffect(() => {
    setCurrentPage(1)
  }, [firstFile?.path])

  return (
    <section className="studio-panel flex min-h-[360px] min-w-0 overflow-hidden rounded-2xl">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-[var(--lp-border)] px-4 py-3 text-xs text-[var(--lp-text-muted)]">
          <span className="font-semibold text-[var(--lp-text)]">预览</span>
          <span className="font-mono uppercase tracking-[0.14em]">{previewMode === 'placeholder' ? 'placeholder' : previewMode}</span>
        </div>
        {isPdf ? (
          <PdfPreview
            filePath={firstFile?.path}
            pageCount={pdfInfo?.pageCount}
            fileSize={pdfInfo?.fileSize ?? firstFile?.size}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        ) : isImage ? (
          <ImagePreview filePath={firstFile?.path} fileSize={firstFile?.size} />
        ) : (
          <OfficePreviewPlaceholder fileName={firstFile?.name} fileSize={firstFile?.size} extension={firstFile?.extension} />
        )}
        {isPdf && (
          <PageThumbnailStrip
            filePath={firstFile?.path}
            pageCount={pdfInfo?.pageCount}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </section>
  )
}
