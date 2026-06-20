import { useEffect, useState } from 'react'
import { CheckCircle2, FolderCog, HardDrive, Palette, RefreshCw, ShieldCheck, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { EngineId } from '@/features/tools/registry'
import { settingsPayload, useSettingsStore, type AppSettings, type EngineStatus, type OutputMode, type ThemeMode } from './settingsStore'

const configurableEngines = new Set<EngineId>(['qpdf', 'libreoffice', 'tesseract', 'external-ghostscript'])

const installHints: Partial<Record<EngineId, string>> = {
  qpdf: '用于加密、解密和线性化。请选择 qpdf.exe，或把 qpdf 加入 PATH。',
  libreoffice: '用于 Word/Excel/PPT 转 PDF。请选择 LibreOffice\\program\\soffice.exe。',
  tesseract: '用于扫描件 OCR。中文识别还需要 chi_sim 语言包。',
  'external-ghostscript': '可选，用于 balanced/strong 高级 PDF 压缩。当前内置压缩不强制需要。',
}

export function SettingsPage() {
  const defaultOutput = useSettingsStore((state) => state.defaultOutput)
  const customOutputDirectory = useSettingsStore((state) => state.customOutputDirectory)
  const theme = useSettingsStore((state) => state.theme)
  const enginePaths = useSettingsStore((state) => state.enginePaths)
  const engines = useSettingsStore((state) => state.engines)
  const hydrateSettings = useSettingsStore((state) => state.hydrateSettings)
  const setDefaultOutput = useSettingsStore((state) => state.setDefaultOutput)
  const setCustomOutputDirectory = useSettingsStore((state) => state.setCustomOutputDirectory)
  const setTheme = useSettingsStore((state) => state.setTheme)
  const setEnginePath = useSettingsStore((state) => state.setEnginePath)
  const clearEnginePath = useSettingsStore((state) => state.clearEnginePath)
  const setEngineStatus = useSettingsStore((state) => state.setEngineStatus)
  const [detecting, setDetecting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testingEngine, setTestingEngine] = useState<EngineId | null>(null)
  const [testResults, setTestResults] = useState<Record<string, { ok: boolean; message: string }>>({})

  async function persist(patch: Partial<AppSettings>) {
    setSaving(true)
    try {
      const current = settingsPayload(useSettingsStore.getState())
      const next = { ...current, ...patch, enginePaths: patch.enginePaths ?? current.enginePaths }
      const saved = await window.electronAPI?.saveSettings?.(next)
      if (saved) hydrateSettings(saved)
      return saved ?? next
    } finally {
      setSaving(false)
    }
  }

  async function detect() {
    setDetecting(true)
    try {
      const detected = await window.electronAPI?.detectEngines?.()
      if (Array.isArray(detected)) setEngineStatus(detected as EngineStatus[])
    } finally {
      setDetecting(false)
    }
  }

  async function chooseOutputDirectory() {
    const dir = await window.electronAPI?.pickDirectory?.()
    if (!dir) return
    setCustomOutputDirectory(dir)
    setDefaultOutput('custom')
    await persist({ customOutputDirectory: dir, defaultOutput: 'custom' })
  }

  async function changeOutputMode(mode: OutputMode) {
    setDefaultOutput(mode)
    await persist({ defaultOutput: mode })
  }

  async function changeTheme(nextTheme: ThemeMode) {
    setTheme(nextTheme)
    await persist({ theme: nextTheme })
  }

  async function chooseEngine(engineId: EngineId) {
    const filePath = await window.electronAPI?.pickExecutable?.(engineId)
    if (!filePath) return
    const nextEnginePaths = { ...useSettingsStore.getState().enginePaths, [engineId]: filePath }
    setEnginePath(engineId, filePath)
    await persist({ enginePaths: nextEnginePaths })
    await detect()
  }

  async function clearEngine(engineId: EngineId) {
    const nextEnginePaths = { ...useSettingsStore.getState().enginePaths }
    delete nextEnginePaths[engineId]
    clearEnginePath(engineId)
    await persist({ enginePaths: nextEnginePaths })
    await detect()
  }

  async function runEngineTest(engineId: EngineId) {
    setTestingEngine(engineId)
    setTestResults((current) => ({ ...current, [engineId]: { ok: false, message: '测试中…' } }))
    try {
      if (!window.electronAPI?.testEngine) throw new Error('当前运行环境没有暴露 Electron 引擎测试接口，请使用桌面版运行测试。')
      const result = await window.electronAPI.testEngine(engineId)
      setTestResults((current) => ({ ...current, [engineId]: { ok: result.ok === true, message: result.message || '测试完成' } }))
      await detect()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setTestResults((current) => ({ ...current, [engineId]: { ok: false, message } }))
    } finally {
      setTestingEngine(null)
    }
  }

  useEffect(() => {
    detect().catch(() => undefined)
  }, [])

  return (
    <div className="h-full overflow-auto p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">设置</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--lp-text-muted)]">管理输出目录、转换引擎、隐私和外观。内置能力会显示具体实现；qpdf、LibreOffice、Tesseract 等外部引擎可配置路径后解锁对应功能。</p>
        </div>
        <Button onClick={() => detect()} disabled={detecting || saving}><RefreshCw size={16} /> {detecting ? '检测中' : saving ? '保存中' : '重新检测'}</Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-lg font-semibold"><HardDrive size={19} /> 转换引擎</div>
          <p className="mt-2 text-sm leading-6 text-[var(--lp-text-muted)]">LocalPDF 会优先使用你选择的可执行文件，其次才检查 PATH 和常见安装目录。外部引擎不会被上传或写入日志。</p>
          <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--lp-border)]">
            {engines.map((engine) => {
              const configurable = configurableEngines.has(engine.id)
              const customPath = enginePaths[engine.id] || engine.configuredPath
              return (
                <div key={engine.id} className="flex flex-col gap-3 border-b border-[var(--lp-border)] p-4 last:border-b-0 2xl:flex-row 2xl:items-center 2xl:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-[var(--lp-text)]">
                      {engine.available ? <CheckCircle2 className="text-[var(--lp-green)]" size={16} /> : <XCircle className="text-[var(--lp-danger)]" size={16} />}
                      {engine.label}
                      {engine.version && <span className="max-w-[280px] truncate font-mono text-xs text-[var(--lp-text-faint)]">{engine.version}</span>}
                    </div>
                    <div className="mt-1 text-xs leading-5 text-[var(--lp-text-muted)]">{engine.note}</div>
                    {engine.path && <div className="mt-1 truncate font-mono text-[11px] text-[var(--lp-text-faint)]">检测：{engine.path}</div>}
                    {customPath && <div className="mt-1 truncate font-mono text-[11px] text-[var(--lp-accent-strong)]">配置：{customPath}</div>}
                    {configurable && installHints[engine.id] && <div className="mt-2 text-[11px] leading-5 text-[var(--lp-text-faint)]">{installHints[engine.id]}</div>}
                    {testResults[engine.id] && <div className={`mt-2 rounded-xl border px-3 py-2 text-[11px] leading-5 ${testResults[engine.id].ok ? 'border-[var(--lp-green)]/25 bg-[var(--lp-green-soft)]/35 text-[var(--lp-green)]' : 'border-[var(--lp-danger)]/25 bg-[var(--lp-danger-soft)]/35 text-[var(--lp-danger)]'}`}>{testResults[engine.id].message}</div>}
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <span className="status-pill" data-tone={engine.available ? 'green' : undefined}>{engine.available ? '可用' : '缺失'}</span>
                    {configurable && <Button variant="ghost" className="text-xs" onClick={() => runEngineTest(engine.id)} disabled={saving || testingEngine !== null}>{testingEngine === engine.id ? '测试中' : '测试'}</Button>}
                    {configurable && <Button variant="ghost" className="text-xs" onClick={() => chooseEngine(engine.id)} disabled={saving}>{customPath ? '重新选择' : '选择路径'}</Button>}
                    {configurable && customPath && <Button variant="ghost" className="text-xs" onClick={() => clearEngine(engine.id)} disabled={saving}>清除</Button>}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-2 font-semibold"><FolderCog size={18} /> 默认输出</div>
            <div className="mt-4 space-y-3 text-sm text-[var(--lp-text-muted)]">
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-[var(--lp-border)] bg-[var(--lp-surface-muted)]/60 p-3 transition hover:border-[var(--lp-accent-soft)]"><span>原文件所在文件夹</span><input type="radio" name="default-output" checked={defaultOutput === 'source'} onChange={() => changeOutputMode('source')} /></label>
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-[var(--lp-border)] bg-[var(--lp-surface-muted)]/60 p-3 transition hover:border-[var(--lp-accent-soft)]"><span>每次开始转换时询问</span><input type="radio" name="default-output" checked={defaultOutput === 'ask'} onChange={() => changeOutputMode('ask')} /></label>
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-[var(--lp-border)] bg-[var(--lp-surface-muted)]/60 p-3 transition hover:border-[var(--lp-accent-soft)]"><span>统一自定义目录</span><input type="radio" name="default-output" checked={defaultOutput === 'custom'} onChange={() => changeOutputMode('custom')} /></label>
            </div>
            <div className="mt-4 rounded-xl border border-[var(--lp-border)] bg-[var(--lp-surface-glass)] p-3">
              <div className="text-xs text-[var(--lp-text-muted)]">当前自定义目录</div>
              <div className="mt-1 min-h-5 truncate font-mono text-xs text-[var(--lp-text)]">{customOutputDirectory || '尚未选择'}</div>
              <Button className="mt-3 w-full justify-center text-xs" variant="ghost" onClick={chooseOutputDirectory} disabled={saving}>选择目录</Button>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 font-semibold"><Palette size={18} /> 外观主题</div>
            <div className="mt-4 grid gap-2 text-sm text-[var(--lp-text-muted)]">
              {([
                ['system', '跟随系统'],
                ['light', '浅色纸面'],
                ['dark', '深色工作台'],
              ] as Array<[ThemeMode, string]>).map(([value, label]) => (
                <label key={value} className="flex cursor-pointer items-center justify-between rounded-xl border border-[var(--lp-border)] bg-[var(--lp-surface-muted)]/60 p-3 transition hover:border-[var(--lp-accent-soft)]">
                  <span>{label}</span>
                  <input type="radio" name="theme" checked={theme === value} onChange={() => changeTheme(value)} />
                </label>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 font-semibold"><ShieldCheck size={18} /> 隐私</div>
            <p className="mt-2 text-sm leading-6 text-[var(--lp-text-muted)]">转换文件不会上传云端。密码不会保存到历史记录或日志中；任务日志只显示“敏感字段已隐藏”。设置文件仅保存主题、输出目录和外部引擎路径。</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
