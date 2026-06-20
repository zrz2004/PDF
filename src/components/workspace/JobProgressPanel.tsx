import { Activity, CheckCircle2, CircleAlert, Clock3 } from 'lucide-react'
import { Progress } from '@/components/ui/Progress'
import type { ConversionJob } from '@/features/jobs/jobTypes'

type Props = {
  job?: ConversionJob
}

export function JobProgressPanel({ job }: Props) {
  const icon = job?.status === 'failed' ? <CircleAlert size={16} className="text-[var(--lp-danger)]" /> : job?.status === 'succeeded' ? <CheckCircle2 size={16} className="text-[var(--lp-green)]" /> : job?.status === 'running' ? <Activity size={16} className="text-[var(--lp-accent)]" /> : <Clock3 size={16} />

  return (
    <section className="rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-surface-glass)] p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold">{icon}{job?.currentStep ?? '等待任务'}</div>
        <div className="font-mono text-xs text-[var(--lp-text-faint)]">{job ? `${job.progress}%` : '0%'}</div>
      </div>
      <div className="mt-3"><Progress value={job?.progress ?? 0} /></div>
      {job?.error && <div className="mt-3 rounded-xl border border-[var(--lp-danger)]/25 bg-[var(--lp-danger-soft)]/50 p-3 text-xs text-[var(--lp-danger)]">{job.error}</div>}
    </section>
  )
}
