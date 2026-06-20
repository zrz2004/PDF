import { TerminalSquare } from 'lucide-react'
import type { ConversionJob } from '@/features/jobs/jobTypes'

type Props = {
  job?: ConversionJob
}

export function JobLogDrawer({ job }: Props) {
  return (
    <section className="rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-surface-glass)] p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><TerminalSquare size={16} /> 任务日志</div>
      <div className="max-h-36 overflow-auto rounded-xl border border-[var(--lp-border)] bg-[var(--lp-bg-ink)] p-3 font-mono text-[11px] leading-5 text-[#d8d5ca]">
        {job?.logs.length ? job.logs.map((entry, index) => (
          <div key={`${entry.timestamp}-${index}`}><span className="text-[#8c887d]">{new Date(entry.timestamp).toLocaleTimeString()}</span> [{entry.level}] {entry.message}</div>
        )) : <div className="text-[#8c887d]">等待创建任务。实际转换会显示输出路径和错误诊断，敏感选项会被隐藏。</div>}
      </div>
    </section>
  )
}
