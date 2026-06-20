import { FolderOpen, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

type Props = {
  value: string
  onChange: (value: string) => void
  modeLabel?: string
  customDirectory?: string
}

export function OutputDirectoryPicker({ value, onChange, modeLabel = '原文件所在文件夹', customDirectory }: Props) {
  async function browse() {
    const dir = await window.electronAPI?.pickDirectory?.()
    if (dir) onChange(dir)
  }

  return (
    <div className="rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-surface-glass)] p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="block text-xs font-medium text-[var(--lp-text-muted)]">输出文件夹</label>
        <span className="status-pill">{modeLabel}</span>
      </div>
      <div className="flex min-w-0 gap-2">
        <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={customDirectory || '默认：原文件所在文件夹'} />
        {value && <Button type="button" variant="ghost" onClick={() => onChange('')} className="shrink-0"><RotateCcw size={16} /> 默认</Button>}
        <Button type="button" onClick={browse} className="shrink-0"><FolderOpen size={16} /> 浏览</Button>
      </div>
      <p className="mt-2 text-xs leading-5 text-[var(--lp-text-faint)]">留空时使用设置中的默认输出策略；手动填写或浏览选择只影响当前工具页面。</p>
    </div>
  )
}
