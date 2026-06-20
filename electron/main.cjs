const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron')
const path = require('node:path')
const fs = require('node:fs')
const { detectEngines } = require('./engines.cjs')
const { testEngine } = require('./engine-tests.cjs')
const { loadSettings, saveSettings } = require('./settings.cjs')

const isDev = process.env.LOCALPDF_DEV === '1'
const startupStartedAt = Date.now()
let conversionModule

function stamp(label) {
  const message = `[LocalPDF startup +${Date.now() - startupStartedAt}ms] ${label}`
  console.log(message)
  return message
}

function getConversionModule() {
  if (!conversionModule) {
    stamp('loading conversion module')
    conversionModule = require('./conversion.cjs')
    stamp('conversion module loaded')
  }
  return conversionModule
}

function createWindow() {
  stamp('creating BrowserWindow')
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 640,
    show: false,
    frame: false,
    title: 'LocalPDF Studio',
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    backgroundColor: '#f7f5ee',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  })

  stamp('BrowserWindow created')

  let shown = false
  function showOnce(reason) {
    if (shown) return
    shown = true
    stamp(`show window: ${reason}`)
    win.show()
  }

  win.once('ready-to-show', () => showOnce('ready-to-show'))
  setTimeout(() => showOnce('fallback-timeout'), 2400)

  win.webContents.on('did-fail-load', (_event, code, description, url) => {
    console.error(`Window failed to load ${url}: ${code} ${description}`)
    const fallback = encodeURIComponent(`<!doctype html><html><body style="margin:0;background:#f7f5ee;color:#141413;font-family:Segoe UI,Microsoft YaHei UI,sans-serif;display:grid;place-items:center;height:100vh"><main style="max-width:560px;padding:28px;border:1px solid #e4e0d4;border-radius:24px;background:#fffdf8;box-shadow:0 24px 80px rgba(20,20,19,.10)"><h1>LocalPDF Studio 加载失败</h1><p>页面未能加载：${description}</p><p style="font-family:Cascadia Code,monospace;color:#69665f">${url}</p></main></body></html>`)
    win.loadURL(`data:text/html;charset=utf-8,${fallback}`).catch(() => undefined)
    showOnce('load-failed')
  })

  win.webContents.on('did-finish-load', async () => {
    stamp('renderer loaded')
    const ranSmokeConversion = !!(process.env.LOCALPDF_SMOKE_CONVERSION_REQUEST && process.env.LOCALPDF_SMOKE_CONVERSION_RESULT)
    if (ranSmokeConversion) {
      try {
        const request = JSON.parse(fs.readFileSync(process.env.LOCALPDF_SMOKE_CONVERSION_REQUEST, 'utf8'))
        const settings = loadSettings(app)
        const outputFiles = await getConversionModule().convert({ ...request, settings })
        fs.writeFileSync(process.env.LOCALPDF_SMOKE_CONVERSION_RESULT, JSON.stringify({ ok: true, outputFiles }, null, 2))
      } catch (error) {
        fs.writeFileSync(process.env.LOCALPDF_SMOKE_CONVERSION_RESULT, JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }, null, 2))
      }
    }
    if (!process.env.LOCALPDF_SMOKE_CAPTURE) {
      if (ranSmokeConversion) app.exit(0)
      return
    }
    await new Promise((resolve) => setTimeout(resolve, 900))
    const image = await win.webContents.capturePage()
    fs.writeFileSync(process.env.LOCALPDF_SMOKE_CAPTURE, image.toPNG())
    app.exit(0)
  })

  if (isDev) {
    win.loadURL('http://127.0.0.1:5173')
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }
}

ipcMain.handle('window:minimize', (event) => BrowserWindow.fromWebContents(event.sender)?.minimize())
ipcMain.handle('window:toggleMaximize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (!win) return
  if (win.isMaximized()) win.unmaximize()
  else win.maximize()
})
ipcMain.handle('window:close', (event) => BrowserWindow.fromWebContents(event.sender)?.close())
ipcMain.handle('shell:openPath', async (_event, targetPath) => shell.openPath(targetPath))
ipcMain.handle('dialog:pickFiles', async (event, extensions = []) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  const result = await dialog.showOpenDialog(win, {
    title: '选择要转换的文件',
    properties: ['openFile', 'multiSelections'],
    filters: extensions.length ? [{ name: 'Supported files', extensions }, { name: 'All files', extensions: ['*'] }] : [{ name: 'All files', extensions: ['*'] }],
  })
  if (result.canceled) return []
  return result.filePaths.map((filePath) => {
    const stat = fs.statSync(filePath)
    return { path: filePath, name: path.basename(filePath), size: stat.size, extension: path.extname(filePath).slice(1).toLowerCase() }
  })
})
ipcMain.handle('dialog:pickDirectory', async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  const result = await dialog.showOpenDialog(win, { title: '选择输出文件夹', properties: ['openDirectory', 'createDirectory'] })
  return result.canceled ? null : result.filePaths[0]
})
ipcMain.handle('dialog:pickExecutable', async (event, engineId) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  const labels = {
    qpdf: '选择 qpdf 可执行文件',
    libreoffice: '选择 LibreOffice soffice 可执行文件',
    tesseract: '选择 Tesseract OCR 可执行文件',
    'external-ghostscript': '选择 Ghostscript 可执行文件',
  }
  const result = await dialog.showOpenDialog(win, {
    title: labels[engineId] || '选择本地引擎可执行文件',
    properties: ['openFile'],
    filters: process.platform === 'win32' ? [{ name: '可执行文件', extensions: ['exe'] }, { name: '所有文件', extensions: ['*'] }] : [{ name: '所有文件', extensions: ['*'] }],
  })
  return result.canceled ? null : result.filePaths[0]
})
ipcMain.handle('settings:get', () => loadSettings(app))
ipcMain.handle('settings:save', (_event, settings) => saveSettings(app, settings))
ipcMain.handle('conversion:start', async (_event, request) => {
  const started = Date.now()
  const settings = loadSettings(app)
  const outputFiles = await getConversionModule().convert({ ...request, settings })
  return {
    outputFiles,
    elapsedMs: Date.now() - started,
    logs: [`生成 ${outputFiles.length} 个输出文件`],
  }
})
ipcMain.handle('engines:detect', () => detectEngines(loadSettings(app)))
ipcMain.handle('engines:test', async (_event, engineId) => testEngine(engineId, loadSettings(app)))
ipcMain.handle('app:paths', () => ({ userData: app.getPath('userData'), temp: app.getPath('temp'), exists: fs.existsSync(app.getPath('userData')) }))

app.whenReady().then(() => {
  stamp('app ready')
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
