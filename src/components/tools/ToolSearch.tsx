import { Search } from 'lucide-react'
import { Input } from '@/components/ui/Input'

type ToolSearchProps = {
  value: string
  onChange: (value: string) => void
}

export function ToolSearch({ value, onChange }: ToolSearchProps) {
  return (
    <label className="relative block w-full max-w-xl">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--lp-text-faint)]" size={17} />
      <Input value={value} onChange={(event) => onChange(event.target.value)} className="pl-10" placeholder="搜索：PDF转Word、压缩、水印、图片转PDF…" />
    </label>
  )
}
