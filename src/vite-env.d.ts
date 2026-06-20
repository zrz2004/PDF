/// <reference types="vite/client" />

declare module '*.css'

type LocalPDFOutputMode = 'source' | 'ask' | 'custom'
type LocalPDFThemeMode = 'system' | 'light' | 'dark'

type LocalPDFSettings = {
  defaultOutput: LocalPDFOutputMode
  customOutputDirectory?: string
  theme: LocalPDFThemeMode
  enginePaths: Record<string, string | undefined>
}

type LocalPDFEngineStatus = {
  id: string
  label: string
  available: boolean
  version?: string
  path?: string
  configuredPath?: string
  note: string
}

type LocalPDFEngineTestResult = {
  ok: boolean
  engine: string
  path?: string
  version?: string
  languages?: string[]
  message: string
}

interface Window {
  electronAPI?: {
    minimize: () => void
    toggleMaximize: () => void
    close: () => void
    pickFiles?: (extensions: string[]) => Promise<Array<{ path: string; name: string; size: number; extension: string }>>
    pickDirectory?: () => Promise<string | null>
    pickExecutable?: (engineId: string) => Promise<string | null>
    getSettings?: () => Promise<LocalPDFSettings>
    saveSettings?: (settings: Partial<LocalPDFSettings>) => Promise<LocalPDFSettings>
    startConversion?: (request: unknown) => Promise<{ outputFiles: string[]; elapsedMs: number; logs?: string[]; warnings?: string[] }>
    getPathForFile?: (file: File) => string
    detectEngines?: () => Promise<LocalPDFEngineStatus[] | unknown>
    testEngine?: (engineId: string) => Promise<LocalPDFEngineTestResult>
    openPath?: (path: string) => Promise<unknown>
    appPaths?: () => Promise<unknown>
    platform: string
  }
}
