import type { ConversionJob } from './jobTypes'

export const latestJobForTool = (jobs: ConversionJob[], toolId: string) => jobs.find((job) => job.toolId === toolId)
export const runningJobs = (jobs: ConversionJob[]) => jobs.filter((job) => job.status === 'running')
