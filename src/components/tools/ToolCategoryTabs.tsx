import type { ToolCategoryId } from '@/features/tools/categories'
import { toolCategories } from '@/features/tools/categories'

type Props = {
  active: ToolCategoryId
  onChange: (category: ToolCategoryId) => void
}

export function ToolCategoryTabs({ active, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {toolCategories.map((category) => (
        <button
          key={category.id}
          onClick={() => onChange(category.id)}
          className={`rounded-full border px-3.5 py-2 text-sm transition ${active === category.id ? 'border-[var(--lp-accent-soft)] bg-[var(--lp-accent-soft)] text-[var(--lp-text)]' : 'border-[var(--lp-border)] bg-[var(--lp-surface)]/70 text-[var(--lp-text-muted)] hover:border-[var(--lp-accent-soft)] hover:text-[var(--lp-text)]'}`}
        >
          {category.label}
        </button>
      ))}
    </div>
  )
}
