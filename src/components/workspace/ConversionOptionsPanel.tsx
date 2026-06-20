import { Select } from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import type { ToolDefinition } from '@/features/tools/registry'
import type { ToolOption } from '@/features/tools/schemas'

type Props = {
  tool: ToolDefinition
  values: Record<string, string | number | boolean>
  onChange: (key: string, value: string | number | boolean) => void
}

function OptionInput({ option, value, onChange }: { option: ToolOption; value: string | number | boolean | undefined; onChange: (value: string | number | boolean) => void }) {
  if (option.kind === 'select') {
    return (
      <Select value={String(value ?? option.defaultValue ?? '')} onChange={(event) => onChange(event.target.value)}>
        {option.choices?.map((choice) => <option key={choice.value} value={choice.value}>{choice.label}</option>)}
      </Select>
    )
  }
  if (option.kind === 'switch') {
    const checked = Boolean(value ?? option.defaultValue)
    return <button type="button" onClick={() => onChange(!checked)} className="flex items-center gap-3 text-sm text-[var(--lp-text-muted)]"><Switch checked={checked} /> {checked ? '开启' : '关闭'}</button>
  }
  return (
    <input
      className="studio-input w-full"
      type={option.kind === 'password' ? 'password' : option.kind === 'number' ? 'number' : 'text'}
      value={String(value ?? option.defaultValue ?? '')}
      placeholder={option.placeholder}
      onChange={(event) => onChange(option.kind === 'number' ? Number(event.target.value) : event.target.value)}
    />
  )
}

export function ConversionOptionsPanel({ tool, values, onChange }: Props) {
  const visibleOptions = tool.options.filter((option) => {
    if (option.kind === 'directory') return false
    if (option.key === 'ocrLanguage') return values.mode === 'ocr-docx' || values.mode === 'ocr-pptx' || values.tableMode === 'ocr-table'
    return true
  })

  return (
    <section className="rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-surface-glass)] p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="text-sm font-semibold">转换选项</div>
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--lp-text-faint)]">{visibleOptions.length ? `${visibleOptions.length} 项` : '无选项'}</div>
      </div>
      {visibleOptions.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {visibleOptions.map((option) => (
            <label key={option.key} className="block min-w-0">
              <span className="mb-2 block text-xs font-medium text-[var(--lp-text-muted)]">{option.label}</span>
              <OptionInput option={option} value={values[option.key]} onChange={(value) => onChange(option.key, value)} />
              {option.help && <span className="mt-1 block text-[11px] text-[var(--lp-text-faint)]">{option.help}</span>}
            </label>
          ))}
        </div>
      ) : <div className="rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-surface-muted)]/60 p-4 text-sm text-[var(--lp-text-muted)]">这个工具没有额外选项。</div>}
    </section>
  )
}
