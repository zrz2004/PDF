export type JobStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled'

export type JobLogEntry = {
  timestamp: string
  level: 'info' | 'warn' | 'error'
  message: string
}

export type ConversionJob = {
  id: string
  toolId: string
  toolTitle: string
  status: JobStatus
  progress: number
  currentStep: string
  inputFiles: Array<{ name: string; path: string; size?: number }>
  outputFiles: string[]
  logs: JobLogEntry[]
  createdAt: string
  updatedAt: string
  error?: string
}
