import { FileSpreadsheet, FileText, Presentation } from 'lucide-react'
import { formatBytes } from '@/lib/format'

type Props = {
  fileName?: string
  fileSize?: number
  extension?: string
}

const iconMap: Record<string, typeof FileText> = {
  doc: FileText, docx: FileText, rtf: FileText, odt: FileText,
  xls: FileSpreadsheet, xlsx: FileSpreadsheet, csv: FileSpreadsheet, ods: FileSpreadsheet,
  ppt: Presentation, pptx: Presentation, odp: Presentation,
}

const labelMap: Record<string, string> = {
  doc: 'Word 文档', docx: 'Word 文档', rtf: '富文本', odt: 'OpenDocument 文本',
  xls: 'Excel 表格', xlsx: 'Excel 表格', csv: 'CSV 数据', ods: 'OpenDocument 表格',
  ppt: 'PowerPoint 演示', pptx: 'PowerPoint 演示', odp: 'OpenDocument 演示',
}

export function OfficePreviewPlaceholder({ fileName, fileSize, extension }: Props) {
  const ext = extension?.toLowerCase() || ''
  const Icon = iconMap[ext] || FileText
  const label = labelMap[ext] || 'Office 文件'

  return (
    <div className="grid h-full min-h-[280px] place-items-center bg-[var(--lp-surface-muted)]/60 p-6 text-center text-[var(--lp-text-muted)]">
      <div>
        <Icon className="mx-auto mb-3 text-[var(--lp-accent)]" size={42} />
        <div className="text-sm font-semibold text-[var(--lp-text)]">{label}</div>
        {fileName && <div className="mt-2 max-w-[240px] truncate text-xs text-[var(--lp-text)]">{fileName}</div>}
        {fileSize != null && <div className="mt-1 text-xs">{formatBytes(fileSize)}</div>}
        {ext && <div className="mt-1 font-mono text-[11px] uppercase">.{ext}</div>}
        <div className="mt-3 text-xs text-[var(--lp-text-faint)]">Office 转 PDF 需要安装 LibreOffice</div>
      </div>
    </div>
  )
}
