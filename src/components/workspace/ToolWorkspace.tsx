import { useMemo, useState } from 'react'
import { AlertCircle, ArrowLeft, Play, Plus, Square, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Toolbar } from '@/components/layout/Toolbar'
import { SplitPane } from '@/components/layout/SplitPane'
import { effectiveImplementationStatus, effectiveInputMode, externalEngineLabel, getToolById, requiredExternalEngines } from '@/features/tools/registry'
import { useJobStore } from '@/features/jobs/jobStore'
import { latestJobForTool } from '@/features/jobs/jobSelectors'
import { useHistoryStore } from '@/features/history/historyStore'
import { useSettingsStore } from '@/features/settings/settingsStore'
import { formatDuration } from '@/lib/format'
import { matchesExtensions } from '@/lib/fileTypes'
import { ConversionOptionsPanel } from './ConversionOptionsPanel'
import { FileDropZone, type WorkspaceFile } from './FileDropZone'
import { FileList } from './FileList'
import { JobLogDrawer } from './JobLogDrawer'
import { JobProgressPanel } from './JobProgressPanel'
import { OutputDirectoryPicker } from './OutputDirectoryPicker'
import { PreviewPanel } from './PreviewPanel'

type Props = {
  toolId: string
  onBack: () => void
}

const sensitiveKeyPattern = /(password|token|secret|key|credential)/i

function sanitizeOptionsForLog(options: Record<string, string | number | boolean>, sensitiveKeys: string[] = []) {
  return Object.fromEntries(Object.entries(options).map(([key, value]) => {
    const sensitive = sensitiveKeyPattern.test(key) || sensitiveKeys.some((item) => item.toLowerCase() === key.toLowerCase())
    return [key, sensitive ? '[REDACTED]' : value]
  }))
}

export function ToolWorkspace({ toolId, onBack }: Props) {
  const tool = getToolById(toolId)
  const [files, setFiles] = useState<WorkspaceFile[]>([])
  const [fileWarning, setFileWarning] = useState('')
  const [outputDirectory, setOutputDirectory] = useState('')
  const [options, setOptions] = useState<Record<string, string | number | boolean>>({})
  const jobs = useJobStore((state) => state.jobs)
  const createDraftJob = useJobStore((state) => state.createDraftJob)
  const updateJob = useJobStore((state) => state.updateJob)
  const appendLog = useJobStore((state) => state.appendLog)
  const addHistory = useHistoryStore((state) => state.add)
  const engines = useSettingsStore((state) => state.engines)
  const defaultOutput = useSettingsStore((state) => state.defaultOutput)
  const customOutputDirectory = useSettingsStore((state) => state.customOutputDirectory)
  const latestJob = useMemo(() => tool ? latestJobForTool(jobs, tool.id) : undefined, [jobs, tool])
  const inputMode = tool ? effectiveInputMode(tool) : 'single'
  const missingEngines = useMemo(() => {
    if (!tool) return []
    const missing = requiredExternalEngines(tool).filter((engineId) => !engines.find((engine) => engine.id === engineId)?.available)
    const wantsOcr = options.mode === 'ocr-docx' || options.mode === 'ocr-pptx' || options.tableMode === 'ocr-table'
    const tesseractReady = engines.find((engine) => engine.id === 'tesseract')?.available
    if (wantsOcr && !tesseractReady && !missing.includes('tesseract')) missing.push('tesseract')
    return missing
  }, [engines, options.mode, options.tableMode, tool])
  const status = tool ? effectiveImplementationStatus(tool) : 'coming-soon'

  if (!tool) {
    return <div className="p-6 text-[var(--lp-text-muted)]">找不到工具：{toolId}</div>
  }

  function addFiles(next: WorkspaceFile[]) {
    const supported = next.filter((file) => matchesExtensions(file.name, tool!.acceptedExtensions))
    const rejected = next.filter((file) => !matchesExtensions(file.name, tool!.acceptedExtensions))

    if (rejected.length) {
      setFileWarning(`已忽略 ${rejected.length} 个不支持的文件：${rejected.slice(0, 3).map((file) => file.name).join('、')}`)
    } else {
      setFileWarning('')
    }

    if (!supported.length) return
    setFiles((current) => {
      if (inputMode === 'single') {
        if (supported.length > 1 || current.length) setFileWarning('该工具一次只处理 1 个文件，已保留最新选择的文件。')
        return [supported[supported.length - 1]]
      }
      return [...current, ...supported]
    })
  }

  async function browseFiles() {
    if (!window.electronAPI?.pickFiles) {
      document.querySelector<HTMLInputElement>('[data-dropzone-input]')?.click()
      return
    }
    const picked = await window.electronAPI.pickFiles(tool!.acceptedExtensions)
    addFiles(picked.map((file) => ({ id: crypto.randomUUID(), ...file })))
  }

  async function resolveOutputDirectoryForJob() {
    const manual = outputDirectory.trim()
    if (manual) return manual
    if (defaultOutput === 'custom') return customOutputDirectory?.trim() || ''
    if (defaultOutput === 'ask') {
      const picked = await window.electronAPI?.pickDirectory?.()
      if (!picked) return null
      setOutputDirectory(picked)
      return picked
    }
    return ''
  }

  async function startJob() {
    if (!tool || files.length === 0 || missingEngines.length > 0 || status === 'coming-soon') return
    const resolvedOutputDirectory = await resolveOutputDirectoryForJob()
    if (resolvedOutputDirectory === null) return

    const job = createDraftJob(tool.id, tool.title, files.map((file) => ({ name: file.name, path: file.path, size: file.size })))
    appendLog(job.id, 'info', `输出目录：${resolvedOutputDirectory || '原文件所在文件夹'}`)
    appendLog(job.id, 'info', `转换选项：${JSON.stringify(sanitizeOptionsForLog(options, tool.sensitiveOptionKeys))}`)
    if (tool.sensitiveOptionKeys?.length || tool.options.some((option) => option.kind === 'password')) appendLog(job.id, 'info', '敏感字段已隐藏，不会写入日志或历史记录')
    updateJob(job.id, { status: 'running', currentStep: '验证输入', progress: 8 })

    try {
      const engineLabel = externalEngineLabel(tool) || '内置转换引擎'
      updateJob(job.id, { currentStep: `加载转换引擎：${engineLabel}`, progress: 22 })
      const result = await window.electronAPI?.startConversion?.({
        toolId: tool.id,
        inputFiles: files.map((file) => ({ name: file.name, path: file.path, size: file.size })),
        outputDirectory: resolvedOutputDirectory,
        options,
      })
      if (!result) throw new Error('当前运行环境没有暴露 Electron 转换接口')
      updateJob(job.id, { status: 'succeeded', currentStep: '完成', progress: 100, outputFiles: result.outputFiles })
      for (const log of result.logs ?? []) appendLog(job.id, 'info', log)
      for (const warning of result.warnings ?? []) appendLog(job.id, 'warn', warning)
      for (const file of result.outputFiles) appendLog(job.id, 'info', `输出：${file}`)
      appendLog(job.id, 'info', `耗时：${formatDuration(result.elapsedMs)}`)
      addHistory({ id: job.id, toolTitle: tool.title, inputCount: files.length, outputDirectory: resolvedOutputDirectory || '原文件所在文件夹', outputFiles: result.outputFiles, status: 'succeeded', finishedAt: new Date().toISOString() })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      updateJob(job.id, { status: 'failed', currentStep: '失败', progress: 100, error: message })
      appendLog(job.id, 'error', message)
      addHistory({ id: job.id, toolTitle: tool.title, inputCount: files.length, outputDirectory: resolvedOutputDirectory || '原文件所在文件夹', outputFiles: [], status: 'failed', finishedAt: new Date().toISOString(), error: message })
    }
  }

  function cancelJob() {
    if (!latestJob) return
    updateJob(latestJob.id, { status: 'cancelled', currentStep: '已标记取消' })
    appendLog(latestJob.id, 'warn', '已停止前端显示；当前内置同步转换可能会继续运行到本轮结束')
  }

  const canStart = files.length > 0 && missingEngines.length === 0 && status !== 'coming-soon'
  const engineName = (engine: string) => engine === 'libreoffice' ? 'LibreOffice' : engine === 'tesseract' ? 'Tesseract OCR' : engine
  const requirementText = missingEngines.length ? `缺少外部引擎：${missingEngines.map(engineName).join('、')}` : (externalEngineLabel(tool) || '内置转换能力，无需额外安装')
  const outputModeLabel = outputDirectory.trim() ? '本次手动选择' : defaultOutput === 'custom' ? '设置中的统一目录' : defaultOutput === 'ask' ? '开始时询问' : '原文件所在文件夹'

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Toolbar>
        <Button variant="ghost" onClick={onBack}><ArrowLeft size={16} /> 返回</Button>
        <div className="mx-2 hidden h-6 w-px bg-[var(--lp-border)] sm:block" />
        <div className="mr-auto min-w-[180px]">
          <div className="flex items-center gap-2 text-sm font-semibold"><span className="h-2.5 w-2.5 rounded-full" style={{ background: tool.accent }} />{tool.title}</div>
          <div className="font-mono text-[11px] text-[var(--lp-text-faint)]">{tool.acceptedExtensions.map((ext) => `.${ext}`).join(' ')} → {tool.outputExtensions.map((ext) => `.${ext}`).join(' ')}</div>
        </div>
        <Button onClick={browseFiles}><Plus size={16} /> 添加</Button>
        <Button variant="ghost" onClick={() => setFiles([])} disabled={files.length === 0}><Trash2 size={16} /> 删除</Button>
        {latestJob?.status === 'running' ? <Button variant="danger" onClick={cancelJob}><Square size={16} /> 标记取消</Button> : <Button variant="primary" onClick={startJob} disabled={!canStart}><Play size={16} /> 开始</Button>}
      </Toolbar>

      <SplitPane>
        <div className="min-h-0 min-w-0 space-y-3 overflow-auto pr-1">
          <div className={`rounded-2xl border p-3 text-sm ${missingEngines.length ? 'border-[var(--lp-warning)]/35 bg-[var(--lp-warning-soft)]/60 text-[var(--lp-warning)]' : 'border-[var(--lp-border)] bg-[var(--lp-surface-glass)] text-[var(--lp-text-muted)]'}`}>
            <div className="flex items-start gap-2"><AlertCircle size={16} className="mt-0.5 shrink-0" /> <span>{requirementText}</span></div>
            {status === 'partial' && <div className="mt-2 text-xs">该工具已接入基础转换，扫描件/OCR 或高度还原版式仍属于实验能力。</div>}
            {tool.limitations?.length ? <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">{tool.limitations.map((item) => <li key={item}>{item}</li>)}</ul> : null}
          </div>
          {fileWarning && <div className="rounded-2xl border border-[var(--lp-warning)]/35 bg-[var(--lp-warning-soft)]/50 p-3 text-sm text-[var(--lp-warning)]">{fileWarning}</div>}
          <FileDropZone tool={tool} onFiles={addFiles} onRejected={(names, reason) => setFileWarning(`已忽略：${names.slice(0, 3).join('、')}。${reason}`)} />
          <FileList files={files} onRemove={(id) => setFiles((current) => current.filter((file) => file.id !== id))} onClear={() => setFiles([])} />
          <OutputDirectoryPicker value={outputDirectory} onChange={setOutputDirectory} modeLabel={outputModeLabel} customDirectory={customOutputDirectory} />
          <ConversionOptionsPanel tool={tool} values={options} onChange={(key, value) => setOptions((current) => ({ ...current, [key]: value }))} />
          <JobProgressPanel job={latestJob} />
          <JobLogDrawer job={latestJob} />
        </div>
        <PreviewPanel tool={tool} files={files} />
      </SplitPane>
    </div>
  )
}
