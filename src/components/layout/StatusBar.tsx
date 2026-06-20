import { Activity, CheckCircle2, CircleDashed, HardDrive, ShieldCheck } from 'lucide-react'
import { useJobStore } from '@/features/jobs/jobStore'
import { useSettingsStore } from '@/features/settings/settingsStore'

export function StatusBar() {
  const jobs = useJobStore((state) => state.jobs)
  const running = jobs.filter((job) => job.status === 'running').length
  const queued = jobs.filter((job) => job.status === 'queued').length
  const engines = useSettingsStore((state) => state.engines)
  const available = engines.filter((engine) => engine.available).length

  return (
    <footer className="relative z-10 flex h-8 shrink-0 items-center justify-between gap-3 px-4 font-mono text-[11px] text-[var(--lp-text-faint)]">
      <div className="flex min-w-0 items-center gap-4">
        <span className="flex items-center gap-1.5 text-[var(--lp-text-muted)]"><CircleDashed size={13} /> 就绪</span>
        <span className="hidden items-center gap-1.5 sm:flex"><Activity size={13} /> 运行 {running}</span>
        <span className="hidden sm:inline">排队 {queued}</span>
      </div>
      <div className="flex min-w-0 items-center gap-4">
        <span className="hidden items-center gap-1.5 md:flex"><ShieldCheck size={13} /> 仅本机</span>
        <span className="hidden items-center gap-1.5 sm:flex"><HardDrive size={13} /> 引擎 {available}/{engines.length}</span>
        <span className="flex items-center gap-1.5 text-[var(--lp-green)]"><CheckCircle2 size={13} /> 不上传</span>
      </div>
    </footer>
  )
}
