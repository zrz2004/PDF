const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const engineCommands = {
  qpdf: ['qpdf'],
  libreoffice: ['soffice', 'libreoffice'],
  tesseract: ['tesseract'],
  'external-ghostscript': process.platform === 'win32' ? ['gswin64c', 'gswin32c', 'gs'] : ['gs'],
}

const engineLabels = {
  qpdf: 'qpdf',
  libreoffice: 'LibreOffice',
  tesseract: 'Tesseract OCR',
  'external-ghostscript': 'Ghostscript',
}

const engineExecutables = {
  qpdf: ['qpdf.exe', 'qpdf'],
  libreoffice: ['soffice.exe', 'libreoffice.exe', 'soffice', 'libreoffice'],
  tesseract: ['tesseract.exe', 'tesseract'],
  'external-ghostscript': ['gswin64c.exe', 'gswin32c.exe', 'gs.exe', 'gswin64c', 'gswin32c', 'gs'],
}

function unique(values) {
  return [...new Set(values.filter(Boolean))]
}

function isPathLike(command) {
  return command.includes('\\') || command.includes('/') || /^[A-Za-z]:/.test(command)
}

function localToolRoots() {
  const roots = []
  if (process.env.LOCALPDF_TOOL_ROOT) roots.push(process.env.LOCALPDF_TOOL_ROOT)
  // Portable, cross-platform defaults (no developer-machine paths).
  if (process.platform === 'win32' && process.env.LOCALAPPDATA) {
    roots.push(path.join(process.env.LOCALAPPDATA, 'LocalPDF', 'tools'))
  }
  if (process.env.HOME) {
    roots.push(path.join(process.env.HOME, '.localpdf', 'tools'))
  }
  return unique(roots)
}

function executableNamesFor(engineIdOrCommand) {
  if (engineExecutables[engineIdOrCommand]) return engineExecutables[engineIdOrCommand]
  const commands = engineCommands[engineIdOrCommand] || [engineIdOrCommand]
  const names = []
  for (const command of commands) {
    names.push(command)
    if (process.platform === 'win32' && !command.toLowerCase().endsWith('.exe')) names.push(`${command}.exe`)
  }
  return unique(names)
}

function collectExecutablePaths(root, executableNames, maxDepth = 5) {
  if (!root || !fs.existsSync(root)) return []
  const matches = []
  const wanted = new Set(executableNames.map((name) => name.toLowerCase()))
  const stack = [{ dir: root, depth: 0 }]
  while (stack.length) {
    const { dir, depth } = stack.pop()
    let entries = []
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      continue
    }
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isFile() && wanted.has(entry.name.toLowerCase())) matches.push(fullPath)
      else if (entry.isDirectory() && depth < maxDepth && !['node_modules', '$recycle.bin'].includes(entry.name.toLowerCase())) stack.push({ dir: fullPath, depth: depth + 1 })
    }
  }
  return matches
}

function localToolExecutablePaths(command) {
  const names = executableNamesFor(command)
  const roots = localToolRoots().filter((root) => fs.existsSync(root))
  const preferred = []
  for (const root of roots) {
    if (command === 'qpdf') preferred.push(path.join(root, 'qpdf', 'bin', 'qpdf.exe'), path.join(root, 'qpdf', 'qpdf.exe'))
    if (command === 'soffice' || command === 'libreoffice') preferred.push(
      path.join(root, 'libreoffice', 'App', 'libreoffice', 'program', 'soffice.exe'),
      path.join(root, 'libreoffice', 'program', 'soffice.exe'),
      path.join(root, 'LibreOfficePortable', 'App', 'libreoffice', 'program', 'soffice.exe'),
    )
    if (command === 'tesseract') preferred.push(path.join(root, 'tesseract', 'tesseract.exe'), path.join(root, 'Tesseract-OCR', 'tesseract.exe'))
    if (command === 'gswin64c' || command === 'gswin32c' || command === 'gs') preferred.push(path.join(root, 'ghostscript', 'bin', 'gswin64c.exe'), path.join(root, 'gs', 'bin', 'gswin64c.exe'))
  }
  return unique([...preferred, ...roots.flatMap((root) => collectExecutablePaths(root, names))])
}

function commonExecutablePaths(command) {
  if (process.platform !== 'win32') return []
  const programFiles = [process.env.ProgramFiles, process.env['ProgramFiles(x86)']].filter(Boolean)
  if (command === 'soffice' || command === 'libreoffice') return unique([...localToolExecutablePaths(command), ...programFiles.map((root) => path.join(root, 'LibreOffice', 'program', 'soffice.exe'))])
  if (command === 'qpdf') return unique([...localToolExecutablePaths(command), ...programFiles.map((root) => path.join(root, 'qpdf', 'bin', 'qpdf.exe'))])
  if (command === 'tesseract') return unique([...localToolExecutablePaths(command), ...programFiles.map((root) => path.join(root, 'Tesseract-OCR', 'tesseract.exe'))])
  if (command === 'gswin64c' || command === 'gswin32c' || command === 'gs') return unique([...localToolExecutablePaths(command), ...programFiles.flatMap((root) => [
    path.join(root, 'gs', 'gs10.08.0', 'bin', 'gswin64c.exe'),
    path.join(root, 'gs', 'gs10.07.0', 'bin', 'gswin64c.exe'),
    path.join(root, 'gs', 'gs10.06.0', 'bin', 'gswin64c.exe'),
    path.join(root, 'gs', 'gs10.05.0', 'bin', 'gswin64c.exe'),
    path.join(root, 'gs', 'gs10.04.0', 'bin', 'gswin64c.exe'),
    path.join(root, 'gs', 'gs10.03.1', 'bin', 'gswin64c.exe'),
    path.join(root, 'gs', 'gs10.02.1', 'bin', 'gswin64c.exe'),
  ])])
  return []
}

function commandExists(command) {
  if (!command) return null
  if (isPathLike(command)) return fs.existsSync(command) ? command : null
  const preferred = commonExecutablePaths(command).find((candidate) => fs.existsSync(candidate))
  if (preferred) return preferred
  const finder = process.platform === 'win32' ? 'where' : 'which'
  const result = spawnSync(finder, [command], { encoding: 'utf8', timeout: 5000, windowsHide: true })
  if (result.status === 0) return result.stdout.split(/\r?\n/).find(Boolean) || null
  return null
}

function configuredPath(engineId, settings = {}) {
  const value = settings?.enginePaths?.[engineId]
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function resolveConfiguredPath(engineIdOrCommand, custom) {
  if (!custom || !fs.existsSync(custom)) return null
  const stat = fs.statSync(custom)
  if (stat.isFile()) return custom
  if (!stat.isDirectory()) return null
  const names = executableNamesFor(engineIdOrCommand)
  return collectExecutablePaths(custom, names, 5)[0] || null
}

function resolveEngine(engineIdOrCommand, settings = {}) {
  const custom = configuredPath(engineIdOrCommand, settings)
  const configured = resolveConfiguredPath(engineIdOrCommand, custom)
  if (configured) return configured

  const commands = engineCommands[engineIdOrCommand] || [engineIdOrCommand]
  for (const command of commands) {
    const resolved = commandExists(command)
    if (resolved) return resolved
  }
  return null
}

function firstLine(value) {
  return String(value || '').split(/\r?\n/).map((line) => line.trim()).find(Boolean) || undefined
}

function versionOf(engineIdOrCommand, args = ['--version'], settings = {}) {
  const resolved = resolveEngine(engineIdOrCommand, settings)
  if (!resolved) return undefined
  const result = spawnSync(resolved, args, { encoding: 'utf8', timeout: 5000, windowsHide: true })
  return firstLine(result.stdout) || firstLine(result.stderr)
}

function engineLabel(engineIdOrCommand) {
  return engineLabels[engineIdOrCommand] || path.basename(engineIdOrCommand)
}

function shortOutput(result) {
  const text = firstLine(result.stderr) || firstLine(result.stdout) || `exit ${result.status}`
  return String(text).slice(0, 900)
}

function runEngine(engineIdOrCommand, args, opts = {}) {
  const settings = opts.settings || {}
  const label = opts.label || engineLabel(engineIdOrCommand)
  const resolved = resolveEngine(engineIdOrCommand, settings)
  if (!resolved) throw new Error(`缺少本地引擎：${label}。请在设置中选择可执行文件，或安装后重新检测。`)

  const result = spawnSync(resolved, args, {
    encoding: 'utf8',
    timeout: opts.timeout ?? 120000,
    windowsHide: true,
    ...opts.spawnOptions,
  })

  if (result.error) {
    if (result.error.code === 'ETIMEDOUT') throw new Error(`${label} 执行超时：${resolved}`)
    throw new Error(`${label} 启动失败：${result.error.message}`)
  }
  if (result.status !== 0) throw new Error(`${label} 执行失败（${resolved}）：${shortOutput(result)}`)
  return result
}

function engineStatus(engineId, settings, note, versionArgs = ['--version']) {
  const custom = configuredPath(engineId, settings)
  const resolved = resolveEngine(engineId, settings)
  const available = !!resolved
  const customMissing = custom && !fs.existsSync(custom)
  return {
    id: engineId,
    label: engineLabel(engineId),
    available,
    path: resolved || custom || undefined,
    version: available ? versionOf(engineId, versionArgs, settings) : undefined,
    note: customMissing ? `配置路径不可用：${custom}` : note,
    configuredPath: custom || undefined,
  }
}

function detectEngines(settings = {}) {
  return [
    engineStatus('qpdf', settings, '外部配置：PDF 加密、解密、线性化与结构优化'),
    engineStatus('libreoffice', settings, '外部配置：Word/Excel/PPT 转 PDF'),
    { id: 'pdfcpu', label: 'PDF 页面编辑内核', available: true, version: 'pdf-lib', note: '内置 pdf-lib：合并、拆分、旋转、删页、页码、水印' },
    { id: 'pdfium', label: 'PDF 渲染/提取内核', available: true, version: 'pdf-parse/PDF.js', note: '内置 PDF.js/pdf-parse：页面渲染、文本、表格、图片提取' },
    { id: 'image', label: '图片处理内核', available: true, version: 'sharp', note: '内置 sharp：图片格式转换与图片转 PDF' },
    { id: 'office-writer', label: 'Office 生成内核', available: true, version: 'docx/xlsx/pptx', note: '内置 docx/xlsx/pptx：生成兼容 Office 文件' },
    { id: 'epub', label: 'EPUB 生成内核', available: true, version: 'jszip', note: '内置 jszip：EPUB 生成器' },
    engineStatus('tesseract', settings, '外部配置：扫描件 OCR 识别'),
    engineStatus('external-ghostscript', settings, '可选外部配置：高级 PDF 压缩'),
  ]
}

module.exports = {
  commandExists,
  commonExecutablePaths,
  detectEngines,
  engineLabel,
  resolveEngine,
  runEngine,
  versionOf,
}
