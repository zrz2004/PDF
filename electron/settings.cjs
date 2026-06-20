const fs = require('node:fs')
const path = require('node:path')

const defaultSettings = Object.freeze({
  defaultOutput: 'source',
  customOutputDirectory: '',
  theme: 'system',
  enginePaths: {},
})

const outputModes = new Set(['source', 'ask', 'custom'])
const themeModes = new Set(['system', 'light', 'dark'])
const engineIds = new Set(['qpdf', 'libreoffice', 'tesseract', 'external-ghostscript'])

function settingsFilePath(app) {
  return path.join(app.getPath('userData'), 'settings.json')
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeEnginePaths(value = {}) {
  const output = {}
  if (!value || typeof value !== 'object') return output
  for (const [key, rawPath] of Object.entries(value)) {
    if (!engineIds.has(key)) continue
    const nextPath = normalizeString(rawPath)
    if (nextPath) output[key] = nextPath
  }
  return output
}

function normalizeSettings(value = {}) {
  const source = value && typeof value === 'object' ? value : {}
  return {
    defaultOutput: outputModes.has(source.defaultOutput) ? source.defaultOutput : defaultSettings.defaultOutput,
    customOutputDirectory: normalizeString(source.customOutputDirectory),
    theme: themeModes.has(source.theme) ? source.theme : defaultSettings.theme,
    enginePaths: normalizeEnginePaths(source.enginePaths),
  }
}

function loadSettings(app) {
  const filePath = settingsFilePath(app)
  try {
    if (!fs.existsSync(filePath)) return { ...defaultSettings, enginePaths: {} }
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    return normalizeSettings(parsed)
  } catch (error) {
    console.warn(`Failed to read LocalPDF settings: ${error instanceof Error ? error.message : String(error)}`)
    return { ...defaultSettings, enginePaths: {} }
  }
}

function saveSettings(app, nextSettings) {
  const filePath = settingsFilePath(app)
  const current = loadSettings(app)
  const normalized = normalizeSettings({ ...current, ...(nextSettings || {}) })
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(normalized, null, 2), 'utf8')
  return normalized
}

module.exports = {
  defaultSettings,
  loadSettings,
  normalizeSettings,
  saveSettings,
  settingsFilePath,
}
