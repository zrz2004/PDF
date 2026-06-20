import { create } from 'zustand'
import type { ConversionJob, JobStatus } from './jobTypes'

const now = () => new Date().toISOString()

type JobStore = {
  jobs: ConversionJob[]
  createDraftJob: (toolId: string, toolTitle: string, files: Array<{ name: string; path: string; size?: number }>) => ConversionJob
  updateJob: (id: string, patch: Partial<ConversionJob>) => void
  appendLog: (id: string, level: 'info' | 'warn' | 'error', message: string) => void
  setStatus: (id: string, status: JobStatus, currentStep?: string) => void
}

export const useJobStore = create<JobStore>((set, get) => ({
  jobs: [],
  createDraftJob: (toolId, toolTitle, files) => {
    const job: ConversionJob = {
      id: crypto.randomUUID(),
      toolId,
      toolTitle,
      status: 'queued',
      progress: 0,
      currentStep: '等待开始',
      inputFiles: files,
      outputFiles: [],
      logs: [{ timestamp: now(), level: 'info', message: `已创建 ${toolTitle} 任务` }],
      createdAt: now(),
      updatedAt: now(),
    }
    set({ jobs: [job, ...get().jobs] })
    return job
  },
  updateJob: (id, patch) => set({ jobs: get().jobs.map((job) => job.id === id ? { ...job, ...patch, updatedAt: now() } : job) }),
  appendLog: (id, level, message) => set({ jobs: get().jobs.map((job) => job.id === id ? { ...job, logs: [...job.logs, { timestamp: now(), level, message }], updatedAt: now() } : job) }),
  setStatus: (id, status, currentStep) => set({ jobs: get().jobs.map((job) => job.id === id ? { ...job, status, currentStep: currentStep ?? job.currentStep, updatedAt: now() } : job) }),
}))
