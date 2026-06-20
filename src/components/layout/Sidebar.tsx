import { Archive, Clock3, FileImage, FileText, Home, Image, LockKeyhole, PencilRuler, Settings } from 'lucide-react'
import type { AppRoute } from '@/app/router'
import { toolCategories } from '@/features/tools/categories'

type SidebarProps = {
  route: AppRoute
  onNavigate: (route: AppRoute) => void
}

const categoryIcons = {
  popular: Home,
  'pdf-convert': FileText,
  'to-pdf': Archive,
  'pdf-edit': PencilRuler,
  'pdf-security': LockKeyhole,
  image: Image,
  experimental: FileImage,
}

export function Sidebar({ route, onNavigate }: SidebarProps) {
  const active = route.name === 'home' ? route.category ?? 'popular' : undefined

  return (
    <aside className="mr-3 hidden w-[238px] shrink-0 flex-col rounded-[24px] border border-[var(--lp-border)] bg-[var(--lp-surface-glass)] p-3 shadow-[var(--lp-shadow-card)] backdrop-blur-md lg:flex">
      <button onClick={() => onNavigate({ name: 'home', category: 'popular' })} className="mb-3 rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-surface-raised)] p-3 text-left transition hover:border-[var(--lp-accent-soft)] hover:shadow-sm">
        <div className="text-sm font-semibold tracking-tight text-[var(--lp-text)]">工具首页</div>
        <div className="mt-1 text-xs leading-5 text-[var(--lp-text-muted)]">Local-first 文件转换工作台</div>
      </button>

      <div className="space-y-1">
        {toolCategories.map((category) => {
          const Icon = categoryIcons[category.id]
          return (
            <button key={category.id} onClick={() => onNavigate({ name: 'home', category: category.id })} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${active === category.id ? 'bg-[var(--lp-accent-soft)] text-[var(--lp-text)]' : 'text-[var(--lp-text-muted)] hover:bg-[var(--lp-surface-muted)] hover:text-[var(--lp-text)]'}`}>
              <Icon size={17} className={active === category.id ? 'text-[var(--lp-accent-strong)]' : 'text-[var(--lp-text-faint)] group-hover:text-[var(--lp-accent)]'} />
              <span>{category.label}</span>
            </button>
          )
        })}
      </div>

      <div className="mt-auto space-y-1 border-t border-[var(--lp-border)] pt-3">
        <button onClick={() => onNavigate({ name: 'history' })} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${route.name === 'history' ? 'bg-[var(--lp-surface-muted)] text-[var(--lp-text)]' : 'text-[var(--lp-text-muted)] hover:bg-[var(--lp-surface-muted)] hover:text-[var(--lp-text)]'}`}>
          <Clock3 size={17} /> 历史记录
        </button>
        <button onClick={() => onNavigate({ name: 'settings' })} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${route.name === 'settings' ? 'bg-[var(--lp-surface-muted)] text-[var(--lp-text)]' : 'text-[var(--lp-text-muted)] hover:bg-[var(--lp-surface-muted)] hover:text-[var(--lp-text)]'}`}>
          <Settings size={17} /> 设置
        </button>
      </div>
    </aside>
  )
}
