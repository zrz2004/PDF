$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Push-Location $root
try {
  $nodeScript = @'
const { resolveEngine, versionOf } = require('./electron/engines.cjs');
const path = require('node:path');
const tools = [
  { name: 'Node', command: 'node', args: ['--version'], required: true, builtin: true },
  { name: 'npm', command: 'npm', args: ['--version'], required: true, builtin: true },
  { name: 'Rust cargo (Tauri only)', command: 'cargo', args: ['--version'], required: false, builtin: true },
  { name: 'qpdf (PDF security/linearize)', engine: 'qpdf', args: ['--version'], required: false },
  { name: 'LibreOffice soffice (Office to PDF)', engine: 'libreoffice', args: ['--version'], required: false },
  { name: 'Tesseract OCR (scan OCR)', engine: 'tesseract', args: ['--version'], required: false },
  { name: 'Ghostscript (advanced compression)', engine: 'external-ghostscript', args: ['--version'], required: false },
  { name: 'pdfcpu (legacy/Tauri scaffold only)', command: 'pdfcpu', args: ['version'], required: false, builtin: true },
];

const { spawnSync } = require('node:child_process');
function firstLine(value) {
  return String(value || '').split(/\r?\n/).map((line) => line.trim()).find(Boolean) || '';
}
for (const tool of tools) {
  const scope = tool.required ? 'required' : 'optional';
  const resolved = tool.engine ? resolveEngine(tool.engine) : resolveEngine(tool.command);
  if (!resolved) {
    console.log(`[missing][${scope}] ${tool.name}`);
    continue;
  }
  const result = spawnSync(resolved, tool.args || ['--version'], { encoding: 'utf8', timeout: 15000, windowsHide: true });
  const version = firstLine(result.stdout) || firstLine(result.stderr) || `exit ${result.status}`;
  console.log(`[ok][${scope}] ${tool.name}: ${version}`);
  console.log(`  path: ${resolved}`);
}
console.log('Local tool root: ' + (process.env.LOCALPDF_TOOL_ROOT || (process.platform === 'win32' ? path.join(process.env.LOCALAPPDATA || '', 'LocalPDF', 'tools') : path.join(process.env.HOME || '', '.localpdf', 'tools'))));
'@
  $nodeScript | node -
} finally {
  Pop-Location
}

exit 0
