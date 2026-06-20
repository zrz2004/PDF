import { useEffect, useState } from 'react'
import { Image } from 'lucide-react'
import { formatBytes } from '@/lib/format'

type Props = {
  filePath?: string
  fileSize?: number
}

type ImageData = {
  dataUrl: string
  width: number
  height: number
  format: string
}

export function ImagePreview({ filePath, fileSize }: Props) {
  const [image, setImage] = useState<ImageData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!filePath || !window.electronAPI?.readImageAsDataUrl) {
      setImage(null)
      setError('')
      return
    }
    let cancelled = false
    setLoading(true)
    setError('')
    window.electronAPI.readImageAsDataUrl(filePath).then((result) => {
      if (!cancelled) setImage(result)
    }).catch((err) => {
      if (!cancelled) setError(err instanceof Error ? err.message : String(err))
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [filePath])

  if (!filePath) {
    return (
      <div className="grid h-full min-h-[280px] place-items-center bg-[var(--lp-surface-muted)]/60 p-6 text-center text-[var(--lp-text-muted)]">
        <div>
          <Image className="mx-auto mb-3 text-[var(--lp-blue)]" size={42} />
          <div className="text-sm font-semibold text-[var(--lp-text)]">图片预览</div>
          <div className="mt-1 text-xs">添加图片文件后显示预览</div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="grid h-full min-h-[280px] place-items-center bg-[var(--lp-surface-muted)]/60 p-6 text-center text-[var(--lp-text-muted)]">
        <div className="text-sm">加载预览中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid h-full min-h-[280px] place-items-center bg-[var(--lp-surface-muted)]/60 p-6 text-center text-[var(--lp-text-muted)]">
        <div>
          <Image className="mx-auto mb-3 text-[var(--lp-warning)]" size={42} />
          <div className="text-sm text-[var(--lp-warning)]">预览加载失败</div>
          <div className="mt-1 text-xs">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-[var(--lp-border)] px-4 py-2 text-xs text-[var(--lp-text-muted)]">
        <span className="font-semibold text-[var(--lp-text)]">图片预览</span>
        {image && <span className="font-mono">{image.width} x {image.height}{fileSize ? ` | ${formatBytes(fileSize)}` : ''}</span>}
      </div>
      {image && (
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-[var(--lp-surface-muted)]/60 p-4">
          <img
            src={image.dataUrl}
            alt="图片预览"
            className="max-h-full max-w-full rounded-lg border border-[var(--lp-border)] object-contain shadow-sm"
          />
        </div>
      )}
    </div>
  )
}
