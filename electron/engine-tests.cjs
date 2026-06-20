const fs = require('node:fs/promises')
const fsSync = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { pathToFileURL } = require('node:url')
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib')
const { Document, Packer, Paragraph, TextRun } = require('docx')
const XLSX = require('xlsx')
const PptxGenJS = require('pptxgenjs')
const { runEngine, resolveEngine, versionOf } = require('./engines.cjs')

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true })
  return dir
}

async function nonEmpty(filePath) {
  const stat = await fs.stat(filePath).catch(() => null)
  if (!stat || stat.size === 0) throw new Error(`未生成有效输出：${filePath}`)
  return stat.size
}

async function makeSamplePdf(filePath, text = 'LocalPDF engine test') {
  const pdf = await PDFDocument.create()
  const page = pdf.addPage([320, 180])
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  page.drawText(text, { x: 32, y: 96, size: 18, font, color: rgb(0.1, 0.1, 0.1) })
  await fs.writeFile(filePath, await pdf.save())
  return filePath
}

async function assertPdfReadable(filePath) {
  const bytes = await fs.readFile(filePath)
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true })
  const pages = pdf.getPageCount()
  if (pages < 1) throw new Error(`PDF 页数异常：${filePath}`)
  return pages
}

async function testQpdf(settings) {
  const qpdf = resolveEngine('qpdf', settings)
  if (!qpdf) throw new Error('未找到 qpdf，请在设置中选择 qpdf.exe 或安装后重新检测。')
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'localpdf-qpdf-test-'))
  try {
    const input = await makeSamplePdf(path.join(dir, 'input.pdf'), 'qpdf test')
    const encrypted = path.join(dir, 'encrypted.pdf')
    const decrypted = path.join(dir, 'decrypted.pdf')
    const linearized = path.join(dir, 'linearized.pdf')
    runEngine('qpdf', ['--encrypt', 'localpdf', 'localpdf-owner', '256', '--', input, encrypted], { settings, timeout: 30000 })
    await nonEmpty(encrypted)
    runEngine('qpdf', ['--password=localpdf', '--decrypt', encrypted, decrypted], { settings, timeout: 30000 })
    await nonEmpty(decrypted)
    const pages = await assertPdfReadable(decrypted)
    runEngine('qpdf', ['--linearize', decrypted, linearized], { settings, timeout: 30000 })
    await nonEmpty(linearized)
    return { ok: true, engine: 'qpdf', path: qpdf, version: versionOf('qpdf', ['--version'], settings), message: `qpdf 加密、解密、线性化测试通过（${pages} 页）` }
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {})
  }
}

async function makeSampleDocx(filePath) {
  const doc = new Document({ sections: [{ children: [new Paragraph({ children: [new TextRun('LocalPDF LibreOffice conversion test')] })] }] })
  await fs.writeFile(filePath, await Packer.toBuffer(doc))
  return filePath
}

function makeSampleXlsx(filePath) {
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Name', 'Value'], ['LocalPDF', 42]]), 'Sheet1')
  XLSX.writeFile(wb, filePath)
  return filePath
}

async function makeSamplePptx(filePath) {
  const pptx = new PptxGenJS()
  pptx.layout = 'LAYOUT_WIDE'
  const slide = pptx.addSlide()
  slide.addText('LocalPDF LibreOffice PPTX test', { x: 0.8, y: 0.9, w: 9, h: 1, fontSize: 28, bold: true })
  await pptx.writeFile({ fileName: filePath })
  return filePath
}

async function convertOfficeFixture(settings, profile, input, dir) {
  const before = Date.now()
  runEngine('libreoffice', [`-env:UserInstallation=${pathToFileURL(profile).href}`, '--headless', '--nologo', '--nofirststartwizard', '--convert-to', 'pdf', '--outdir', dir, input], { settings, timeout: 120000 })
  const expected = path.join(dir, `${path.parse(input).name}.pdf`)
  if (fsSync.existsSync(expected)) return expected
  const candidates = fsSync.readdirSync(dir)
    .filter((name) => name.toLowerCase().endsWith('.pdf'))
    .map((name) => path.join(dir, name))
    .filter((candidate) => fsSync.statSync(candidate).mtimeMs >= before - 2000)
    .sort((a, b) => fsSync.statSync(b).mtimeMs - fsSync.statSync(a).mtimeMs)
  if (candidates[0]) return candidates[0]
  throw new Error(`LibreOffice 未生成 PDF 输出：${input}`)
}

async function testLibreOffice(settings) {
  const soffice = resolveEngine('libreoffice', settings)
  if (!soffice) throw new Error('未找到 LibreOffice，请在设置中选择 soffice.exe 或安装后重新检测。')
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'localpdf-lo-test-'))
  const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'localpdf-lo-profile-'))
  try {
    const fixtures = [
      ['DOCX', await makeSampleDocx(path.join(dir, 'sample.docx'))],
      ['XLSX', makeSampleXlsx(path.join(dir, 'sample.xlsx'))],
      ['PPTX', await makeSamplePptx(path.join(dir, 'sample.pptx'))],
    ]
    const pageSummaries = []
    for (const [label, input] of fixtures) {
      const output = await convertOfficeFixture(settings, profile, input, dir)
      await nonEmpty(output)
      pageSummaries.push(`${label}:${await assertPdfReadable(output)}页`)
    }
    return { ok: true, engine: 'libreoffice', path: soffice, version: versionOf('libreoffice', ['--version'], settings), message: `LibreOffice 转 PDF 测试通过（${pageSummaries.join('，')}）` }
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {})
    await fs.rm(profile, { recursive: true, force: true }).catch(() => {})
  }
}

function listTesseractLanguages(settings) {
  const result = runEngine('tesseract', ['--list-langs'], { settings, timeout: 15000 })
  return String(result.stdout || result.stderr || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !/^List of available languages/i.test(line))
}

async function makeOcrPng(filePath) {
  const sharp = require('sharp')
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="220"><rect width="100%" height="100%" fill="white"/><text x="44" y="132" font-family="Arial" font-size="64" fill="black">LOCALPDF OCR TEST</text></svg>`)
  await sharp(svg).png().toFile(filePath)
  return filePath
}

async function testTesseract(settings) {
  const tesseract = resolveEngine('tesseract', settings)
  if (!tesseract) throw new Error('未找到 Tesseract OCR，请在设置中选择 tesseract.exe 或安装后重新检测。')
  const languages = listTesseractLanguages(settings)
  if (!languages.includes('eng')) throw new Error(`Tesseract 缺少 eng 语言包。已安装：${languages.join(', ') || '无'}`)
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'localpdf-ocr-test-'))
  try {
    const image = await makeOcrPng(path.join(dir, 'ocr.png'))
    const result = runEngine('tesseract', [image, 'stdout', '-l', 'eng', '--psm', '6'], { settings, timeout: 60000 })
    const text = String(result.stdout || '').replace(/\s+/g, ' ').trim()
    if (!/LOCALPDF|OCR|TEST/i.test(text)) throw new Error(`OCR 输出未识别到预期文本：${text || '空'}`)
    const cn = languages.includes('chi_sim') ? '，已安装 chi_sim' : '，未检测到 chi_sim（中文 OCR 需安装）'
    return { ok: true, engine: 'tesseract', path: tesseract, version: versionOf('tesseract', ['--version'], settings), languages, message: `Tesseract OCR 英文测试通过${cn}` }
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {})
  }
}

async function testGhostscript(settings) {
  const gs = resolveEngine('external-ghostscript', settings)
  if (!gs) throw new Error('未找到 Ghostscript，请在设置中选择 gswin64c.exe 或安装后重新检测。')
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'localpdf-gs-test-'))
  try {
    const input = await makeSamplePdf(path.join(dir, 'input.pdf'), 'Ghostscript compression test')
    const output = path.join(dir, 'compressed.pdf')
    runEngine('external-ghostscript', ['-sDEVICE=pdfwrite', '-dCompatibilityLevel=1.4', '-dPDFSETTINGS=/ebook', '-dNOPAUSE', '-dQUIET', '-dBATCH', `-sOutputFile=${output}`, input], { settings, timeout: 120000 })
    await nonEmpty(output)
    const pages = await assertPdfReadable(output)
    return { ok: true, engine: 'external-ghostscript', path: gs, version: versionOf('external-ghostscript', ['--version'], settings), message: `Ghostscript 压缩测试通过（${pages} 页）` }
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {})
  }
}

async function testEngine(engineId, settings = {}) {
  if (engineId === 'qpdf') return testQpdf(settings)
  if (engineId === 'libreoffice') return testLibreOffice(settings)
  if (engineId === 'tesseract') return testTesseract(settings)
  if (engineId === 'external-ghostscript') return testGhostscript(settings)
  throw new Error(`不支持测试的引擎：${engineId}`)
}

module.exports = { listTesseractLanguages, testEngine }
