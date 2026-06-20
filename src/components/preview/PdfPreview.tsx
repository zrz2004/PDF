import { ChevronLeft, ChevronRight, FileText, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function PdfPreview() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-[var(--lp-border)] p-3">
        <div className="text-sm font-semibold">PDF 预览</div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" className="h-8 w-8 p-0"><ChevronLeft size={15} /></Button>
          <Button variant="ghost" className="h-8 w-8 p-0"><ChevronRight size={15} /></Button>
          <Button variant="ghost" className="h-8 w-8 p-0"><Minus size={15} /></Button>
          <Button variant="ghost" className="h-8 w-8 p-0"><Plus size={15} /></Button>
        </div>
      </div>
      <div className="grid min-h-0 flex-1 place-items-center bg-[var(--lp-surface-muted)]/60 p-6">
        <div className="grid h-[420px] w-[300px] max-w-full place-items-center rounded-xl border border-[var(--lp-border)] bg-[#fffdf8] text-center text-[#222] shadow-2xl">
          <div>
            <FileText className="mx-auto mb-3 text-[var(--lp-accent)]" size={42} />
            <div className="font-semibold">页面预览</div>
            <div className="mt-2 text-xs text-black/55">首版使用占位预览，转换前不会读取文件内容</div>
          </div>
        </div>
      </div>
    </div>
  )
}
