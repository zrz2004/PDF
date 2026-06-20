import { Image } from 'lucide-react'

export function ImagePreview() {
  return (
    <div className="grid h-full min-h-[280px] place-items-center bg-[var(--lp-surface-muted)]/60 p-6 text-center text-[var(--lp-text-muted)]">
      <div>
        <Image className="mx-auto mb-3 text-[var(--lp-blue)]" size={42} />
        <div className="text-sm font-semibold text-[var(--lp-text)]">图片预览</div>
        <div className="mt-1 text-xs">添加图片文件后显示缩略图和尺寸。</div>
      </div>
    </div>
  )
}
