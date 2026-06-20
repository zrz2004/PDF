import { FileText } from 'lucide-react'

export function OfficePreviewPlaceholder() {
  return (
    <div className="grid h-full min-h-[280px] place-items-center bg-[var(--lp-surface-muted)]/60 p-6 text-center text-[var(--lp-text-muted)]">
      <div>
        <FileText className="mx-auto mb-3 text-[var(--lp-accent)]" size={42} />
        <div className="text-sm font-semibold text-[var(--lp-text)]">Office 文件预览</div>
        <div className="mt-1 text-xs">首版只显示文件信息；Office 转 PDF 需要 LibreOffice。</div>
      </div>
    </div>
  )
}
