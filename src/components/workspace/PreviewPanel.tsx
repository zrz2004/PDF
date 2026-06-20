import type { ToolDefinition } from '@/features/tools/registry'
import type { WorkspaceFile } from './FileDropZone'
import { effectivePreviewMode } from '@/features/tools/registry'
import { ImagePreview } from '@/components/preview/ImagePreview'
import { OfficePreviewPlaceholder } from '@/components/preview/OfficePreviewPlaceholder'
import { PageThumbnailStrip } from '@/components/preview/PageThumbnailStrip'
import { PdfPreview } from '@/components/preview/PdfPreview'

type Props = {
  tool: ToolDefinition
  files: WorkspaceFile[]
}

export function PreviewPanel({ tool, files }: Props) {
  const firstExtension = files[0]?.extension
  const isPdf = tool.acceptedExtensions.includes('pdf') || firstExtension === 'pdf'
  const isImage = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff'].includes(firstExtension ?? '')
  const previewMode = effectivePreviewMode(tool)

  return (
    <section className="studio-panel flex min-h-[360px] min-w-0 overflow-hidden rounded-2xl">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-[var(--lp-border)] px-4 py-3 text-xs text-[var(--lp-text-muted)]">
          <span className="font-semibold text-[var(--lp-text)]">预览</span>
          <span className="font-mono uppercase tracking-[0.14em]">{previewMode === 'placeholder' ? 'placeholder' : previewMode}</span>
        </div>
        {isPdf ? <PdfPreview /> : isImage ? <ImagePreview /> : <OfficePreviewPlaceholder />}
        {isPdf && <PageThumbnailStrip />}
      </div>
    </section>
  )
}
