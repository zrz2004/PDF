import { create } from 'zustand'
import type { EngineId } from '@/features/tools/registry'

export type OutputMode = 'source' | 'ask' | 'custom'
export type ThemeMode = 'system' | 'light' | 'dark'

export type AppSettings = {
  defaultOutput: OutputMode
  customOutputDirectory?: string
  theme: ThemeMode
  enginePaths: Record<string, string | undefined>
}

export type EngineStatus = {
  id: EngineId
  label: string
  available: boolean
  version?: string
  path?: string
  configuredPath?: string
  note: string
}

type SettingsStore = AppSettings & {
  settingsLoaded: boolean
  engines: EngineStatus[]
  hydrateSettings: (settings: Partial<AppSettings>) => void
  setDefaultOutput: (defaultOutput: OutputMode) => void
  setCustomOutputDirectory: (customOutputDirectory: string) => void
  setTheme: (theme: ThemeMode) => void
  setEnginePath: (engineId: EngineId, enginePath: string) => void
  clearEnginePath: (engineId: EngineId) => void
  setEngineStatus: (engines: EngineStatus[]) => void
}

export const defaultSettings: AppSettings = {
  defaultOutput: 'source',
  customOutputDirectory: '',
  theme: 'system',
  enginePaths: {},
}

export const defaultEngines: EngineStatus[] = [
  { id: 'qpdf', label: 'qpdf', available: false, note: '外部配置：PDF 加密、解密、线性化与结构优化' },
  { id: 'libreoffice', label: 'LibreOffice', available: false, note: '外部配置：Word/Excel/PPT 转 PDF' },
  { id: 'pdfcpu', label: 'PDF 页面编辑内核', available: true, note: '内置 pdf-lib：合并、拆分、旋转、删页、页码、水印' },
  { id: 'pdfium', label: 'PDF 渲染/提取内核', available: true, note: '内置 PDF.js/pdf-parse：页面渲染、文本、表格、图片提取' },
  { id: 'image', label: '图片处理内核', available: true, note: '内置 sharp：图片格式转换与图片转 PDF' },
  { id: 'office-writer', label: 'Office 生成内核', available: true, note: '内置 docx/xlsx/pptx：生成兼容 Office 文件' },
  { id: 'epub', label: 'EPUB 生成内核', available: true, note: '内置 jszip：文本型/固定布局 EPUB 生成' },
  { id: 'tesseract', label: 'Tesseract OCR', available: false, note: '外部配置：扫描件 OCR 识别' },
  { id: 'external-ghostscript', label: 'Ghostscript', available: false, note: '可选外部配置：高级 PDF 压缩' },
]

function normalizeSettings(settings: Partial<AppSettings> = {}): AppSettings {
  return {
    defaultOutput: settings.defaultOutput ?? defaultSettings.defaultOutput,
    customOutputDirectory: settings.customOutputDirectory ?? defaultSettings.customOutputDirectory,
    theme: settings.theme ?? defaultSettings.theme,
    enginePaths: settings.enginePaths ?? defaultSettings.enginePaths,
  }
}

function mergeEngineStatuses(detected: EngineStatus[]) {
  const byId = new Map(detected.map((engine) => [engine.id, engine]))
  const merged = defaultEngines.map((engine) => {
    const found = byId.get(engine.id)
    return found ? { ...engine, ...found, note: found.note || engine.note } : engine
  })
  const known = new Set(defaultEngines.map((engine) => engine.id))
  return [...merged, ...detected.filter((engine) => !known.has(engine.id))]
}

export function settingsPayload(state: AppSettings): AppSettings {
  return normalizeSettings(state)
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  ...defaultSettings,
  settingsLoaded: false,
  engines: defaultEngines,
  hydrateSettings: (settings) => set({ ...normalizeSettings(settings), settingsLoaded: true }),
  setDefaultOutput: (defaultOutput) => set({ defaultOutput }),
  setCustomOutputDirectory: (customOutputDirectory) => set({ customOutputDirectory }),
  setTheme: (theme) => set({ theme }),
  setEnginePath: (engineId, enginePath) => set((state) => ({ enginePaths: { ...state.enginePaths, [engineId]: enginePath } })),
  clearEnginePath: (engineId) => set((state) => {
    const next = { ...state.enginePaths }
    delete next[engineId]
    return { enginePaths: next }
  }),
  setEngineStatus: (engines) => set({ engines: mergeEngineStatuses(engines) }),
}))
