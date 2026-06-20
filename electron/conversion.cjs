const fs = require('node:fs/promises')
const fsSync = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const crypto = require('node:crypto')
const { pathToFileURL } = require('node:url')
const { commandExists, resolveEngine, runEngine } = require('./engines.cjs')

let pdfLibModule
let fontkitModule
let pdfParseModule
let sharpModule
let docxModule
let xlsxModule
let pptxModule
let jszipModule

function getPdfLib() {
  if (!pdfLibModule) pdfLibModule = require('pdf-lib')
  return pdfLibModule
}

function getFontkit() {
  if (!fontkitModule) fontkitModule = require('@pdf-lib/fontkit')
  return fontkitModule
}

function getPDFParse() {
  if (!pdfParseModule) pdfParseModule = require('pdf-parse')
  return pdfParseModule.PDFParse
}

function getSharp() {
  if (!sharpModule) sharpModule = require('sharp')
  return sharpModule
}

function getDocx() {
  if (!docxModule) docxModule = require('docx')
  return docxModule
}

function getXlsx() {
  if (!xlsxModule) xlsxModule = require('xlsx')
  return xlsxModule
}

function getPptxGenJS() {
  if (!pptxModule) pptxModule = require('pptxgenjs')
  return pptxModule
}

function getJSZip() {
  if (!jszipModule) jszipModule = require('jszip')
  return jszipModule
}

const IMAGE_EXTS = new Set(['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff', 'tif'])
const OFFICE_EXTS = new Set(['doc', 'docx', 'rtf', 'odt', 'xls', 'xlsx', 'csv', 'ods', 'ppt', 'pptx', 'odp'])

function conversionSettings(request) {
  return request.settings || {}
}

function runConfiguredEngine(request, engineId, args, opts = {}) {
  return runEngine(engineId, args, { ...opts, settings: conversionSettings(request) })
}

function cleanName(value) {
  return String(value).replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').replace(/\s+/g, ' ').trim() || 'output'
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true })
  return dir
}

function baseInfo(inputPath) {
  const parsed = path.parse(inputPath)
  return { dir: parsed.dir, stem: cleanName(parsed.name), ext: parsed.ext.replace(/^\./, '').toLowerCase() }
}

async function uniqueOutput(outputDir, stem, ext) {
  await ensureDir(outputDir)
  let candidate = path.join(outputDir, `${stem}.${ext}`)
  for (let i = 1; fsSync.existsSync(candidate); i += 1) candidate = path.join(outputDir, `${stem}_${i}.${ext}`)
  return candidate
}

function outputDirFor(request, fallbackInput) {
  if (request.outputDirectory && String(request.outputDirectory).trim()) return String(request.outputDirectory).trim()
  return baseInfo(fallbackInput).dir
}

function parseRange(range, total, fallbackAll = true) {
  const value = String(range || '').trim()
  if (!value) return fallbackAll ? Array.from({ length: total }, (_, i) => i) : []
  const pages = new Set()
  for (const raw of value.split(',')) {
    const token = raw.trim().toLowerCase()
    if (!token) throw new Error('页码范围不能为空')
    const match = token.match(/^(\d+)-(\d+|end|z)$/)
    if (match) {
      const start = Number(match[1])
      const end = match[2] === 'end' || match[2] === 'z' ? total : Number(match[2])
      if (start < 1 || end < start || end > total) throw new Error(`页码范围无效：${raw}`)
      for (let page = start; page <= end; page += 1) pages.add(page - 1)
    } else {
      const page = token === 'end' || token === 'z' ? total : Number(token)
      if (!Number.isInteger(page) || page < 1 || page > total) throw new Error(`页码无效：${raw}`)
      pages.add(page - 1)
    }
  }
  return [...pages].sort((a, b) => a - b)
}

async function totalPages(inputPath) {
  const pdf = await loadPdf(inputPath)
  return pdf.getPageCount()
}

async function parsePageNumbers(inputPath, range) {
  const total = await totalPages(inputPath)
  return parseRange(range, total).map((index) => index + 1)
}

async function loadPdf(inputPath) {
  const bytes = await fs.readFile(inputPath)
  return getPdfLib().PDFDocument.load(bytes, { ignoreEncryption: true })
}

async function embedReadableFont(pdfDoc) {
  const candidates = ['C:/Windows/Fonts/msyh.ttf', 'C:/Windows/Fonts/simhei.ttf', 'C:/Windows/Fonts/arial.ttf']
  for (const candidate of candidates) {
    if (!fsSync.existsSync(candidate)) continue
    try {
      pdfDoc.registerFontkit(getFontkit())
      const bytes = await fs.readFile(candidate)
      return await pdfDoc.embedFont(bytes, { subset: true })
    } catch {}
  }
  return pdfDoc.embedFont(getPdfLib().StandardFonts.Helvetica)
}

async function savePdf(pdfDoc, outputPath) {
  const bytes = await pdfDoc.save({ useObjectStreams: true, addDefaultPage: false })
  await fs.writeFile(outputPath, bytes)
  return outputPath
}

async function assertOutputFiles(outputs) {
  for (const output of outputs) {
    const stat = await fs.stat(output).catch(() => null)
    if (!stat || stat.size === 0) throw new Error(`输出文件生成失败或为空：${output}`)
  }
  return outputs
}

function qualityFor(value) {
  return value === 'small' ? 62 : value === 'high' ? 94 : 82
}

function normalizeImageFormat(format) {
  const value = String(format || 'png').toLowerCase()
  return value === 'jpeg' ? 'jpg' : value
}

async function writeImage(buffer, output, format, quality = 'balanced') {
  const target = normalizeImageFormat(format)
  if (target === 'png') {
    await fs.writeFile(output, buffer)
    return output
  }
  const sharpFormat = target === 'jpg' ? 'jpeg' : target
  let pipeline = getSharp()(buffer)
  if (sharpFormat === 'jpeg') pipeline = pipeline.jpeg({ quality: qualityFor(quality) })
  else if (sharpFormat === 'webp') pipeline = pipeline.webp({ quality: qualityFor(quality) })
  else pipeline = pipeline.toFormat(sharpFormat)
  await pipeline.toFile(output)
  return output
}

async function renderPdfPages(input, options = {}) {
  const partial = await parsePageNumbers(input, options.pageRange)
  const scale = Math.max(0.5, Math.min(5, Number(options.dpi || 200) / 144))
  const parser = new (getPDFParse())({ data: await fs.readFile(input) })
  try {
    const result = await parser.getScreenshot({ partial, scale, imageDataUrl: false, imageBuffer: true })
    return result.pages.map((page) => ({
      pageNumber: page.pageNumber,
      width: page.width,
      height: page.height,
      data: Buffer.from(page.data),
    }))
  } finally {
    await parser.destroy().catch(() => {})
  }
}

async function extractText(input, pageRange) {
  const partial = await parsePageNumbers(input, pageRange)
  const parser = new (getPDFParse())({ data: await fs.readFile(input) })
  try {
    const result = await parser.getText({ partial })
    return { text: (result.text || '').trim(), pages: result.pages || [] }
  } finally {
    await parser.destroy().catch(() => {})
  }
}

async function ocrPdfPages(request, input) {
  const rendered = await renderPdfPages(input, { pageRange: request.options?.pageRange, dpi: request.options?.dpi || 200 })
  if (!rendered.length) throw new Error('没有可供 OCR 的 PDF 页面')
  const language = String(request.options?.ocrLanguage || 'chi_sim+eng').trim() || 'chi_sim+eng'
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'localpdf-ocr-'))
  try {
    const pages = []
    for (const page of rendered) {
      const imagePath = path.join(tempDir, `page-${String(page.pageNumber).padStart(3, '0')}.png`)
      await fs.writeFile(imagePath, page.data)
      const result = runConfiguredEngine(request, 'tesseract', [imagePath, 'stdout', '-l', language, '--psm', '6'], { timeout: 180000 })
      pages.push({ pageNumber: page.pageNumber, text: String(result.stdout || '').trim() })
    }
    return pages
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (/Failed loading language|Error opening data file|TESSDATA_PREFIX/i.test(message)) {
      throw new Error(`Tesseract 语言包不可用：${language}。请安装对应 traineddata，或在转换选项中选择已安装语言。`)
    }
    throw error
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {})
  }
}

function rowsFromText(text) {
  return String(text || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(/\s{2,}|\t|,/).map((cell) => cell.trim()).filter(Boolean))
    .filter((row) => row.length)
}

async function mergePdf(request) {
  const outDir = outputDirFor(request, request.inputFiles[0].path)
  const output = await uniqueOutput(outDir, 'merged_pdf', 'pdf')
  const merged = await getPdfLib().PDFDocument.create()
  for (const file of request.inputFiles) {
    const src = await loadPdf(file.path)
    const pages = await merged.copyPages(src, src.getPageIndices())
    pages.forEach((page) => merged.addPage(page))
  }
  return [await savePdf(merged, output)]
}

async function splitPdf(request) {
  const input = request.inputFiles[0].path
  const source = await loadPdf(input)
  const { stem } = baseInfo(input)
  const outDir = outputDirFor(request, input)
  const mode = request.options?.mode || 'every-page'
  const total = source.getPageCount()
  const outputs = []

  if (mode === 'ranges' && request.options?.ranges) {
    const ranges = String(request.options.ranges).split(',').map((item) => item.trim()).filter(Boolean)
    for (const range of ranges) {
      const pdf = await getPdfLib().PDFDocument.create()
      const pages = await pdf.copyPages(source, parseRange(range, total))
      pages.forEach((page) => pdf.addPage(page))
      const output = await uniqueOutput(outDir, `${stem}_pages_${cleanName(range)}`, 'pdf')
      outputs.push(await savePdf(pdf, output))
    }
    return outputs
  }

  const chunk = mode === 'chunk' ? Math.max(1, Number(request.options?.ranges || 1)) : 1
  for (let start = 0; start < total; start += chunk) {
    const pdf = await getPdfLib().PDFDocument.create()
    const indices = Array.from({ length: Math.min(chunk, total - start) }, (_, i) => start + i)
    const pages = await pdf.copyPages(source, indices)
    pages.forEach((page) => pdf.addPage(page))
    const output = await uniqueOutput(outDir, `${stem}_part_${Math.floor(start / chunk) + 1}`, 'pdf')
    outputs.push(await savePdf(pdf, output))
  }
  return outputs
}

async function keepOrReorderPdf(request, kind) {
  const input = request.inputFiles[0].path
  const source = await loadPdf(input)
  const total = source.getPageCount()
  const { stem } = baseInfo(input)
  const outDir = outputDirFor(request, input)
  let indices
  if (kind === 'delete') {
    const deleteSet = new Set(parseRange(request.options?.deleteRange || request.options?.pageRange, total, false))
    if (deleteSet.size >= total) throw new Error('不能删除全部页面')
    indices = source.getPageIndices().filter((idx) => !deleteSet.has(idx))
  } else {
    indices = parseRange(request.options?.order || request.options?.pageRange, total)
  }
  const pdf = await getPdfLib().PDFDocument.create()
  const pages = await pdf.copyPages(source, indices)
  pages.forEach((page) => pdf.addPage(page))
  const suffix = kind === 'delete' ? 'deleted_pages' : 'reordered'
  const output = await uniqueOutput(outDir, `${stem}_${suffix}`, 'pdf')
  return [await savePdf(pdf, output)]
}

async function rotatePdf(request) {
  const input = request.inputFiles[0].path
  const source = await loadPdf(input)
  const indices = new Set(parseRange(request.options?.pageRange, source.getPageCount()))
  const angle = Number(request.options?.angle || 90)
  source.getPages().forEach((page, idx) => {
    if (indices.has(idx)) page.setRotation(getPdfLib().degrees(angle))
  })
  const outDir = outputDirFor(request, input)
  const { stem } = baseInfo(input)
  const output = await uniqueOutput(outDir, `${stem}_rotated`, 'pdf')
  return [await savePdf(source, output)]
}

async function watermarkPdf(request) {
  const input = request.inputFiles[0].path
  const pdf = await loadPdf(input)
  const pages = pdf.getPages()
  const target = new Set(parseRange(request.options?.pageRange, pages.length))
  const opacity = Math.max(0.05, Math.min(1, Number(request.options?.opacity || 35) / 100))
  const angle = Number(request.options?.angle ?? -35)
  const isImage = request.options?.watermarkType === 'image'
  let font
  let image
  let imageMeta

  if (isImage) {
    const imagePath = String(request.options?.imagePath || '').trim()
    if (!imagePath || !fsSync.existsSync(imagePath)) throw new Error('请提供有效的图片水印路径')
    const ext = baseInfo(imagePath).ext
    let buffer = await fs.readFile(imagePath)
    if (!['png', 'jpg', 'jpeg'].includes(ext)) buffer = await getSharp()(buffer).png().toBuffer()
    image = ext === 'jpg' || ext === 'jpeg' ? await pdf.embedJpg(buffer) : await pdf.embedPng(buffer)
    imageMeta = await getSharp()(buffer).metadata().catch(() => ({ width: image.width, height: image.height }))
  } else {
    font = await embedReadableFont(pdf)
  }

  for (let idx = 0; idx < pages.length; idx += 1) {
    if (!target.has(idx)) continue
    const page = pages[idx]
    const { width, height } = page.getSize()
    if (isImage && image) {
      const sourceW = imageMeta?.width || image.width
      const sourceH = imageMeta?.height || image.height
      const scale = Math.min(width / sourceW, height / sourceH) * 0.36
      const w = sourceW * scale
      const h = sourceH * scale
      page.drawImage(image, { x: (width - w) / 2, y: (height - h) / 2, width: w, height: h, opacity, rotate: getPdfLib().degrees(angle) })
    } else {
      const text = String(request.options?.text || 'CONFIDENTIAL')
      page.drawText(text, { x: width * 0.18, y: height * 0.49, size: Math.max(18, Math.min(width, height) / 12), font, color: getPdfLib().rgb(0.85, 0.32, 0.20), opacity, rotate: getPdfLib().degrees(angle) })
    }
  }

  const outDir = outputDirFor(request, input)
  const { stem } = baseInfo(input)
  const output = await uniqueOutput(outDir, `${stem}_watermarked`, 'pdf')
  return [await savePdf(pdf, output)]
}

async function pageNumbersPdf(request) {
  const input = request.inputFiles[0].path
  const pdf = await loadPdf(input)
  const font = await embedReadableFont(pdf)
  const pages = pdf.getPages()
  const target = new Set(parseRange(request.options?.pageRange, pages.length))
  const startAt = Number(request.options?.startAt || 1)
  const format = request.options?.format || 'page-n-of-total'
  const position = request.options?.position || 'bottom-center'
  pages.forEach((page, idx) => {
    if (!target.has(idx)) return
    const n = idx + startAt
    const text = format === 'n' ? `${n}` : format === 'page-n' ? `Page ${n}` : format === 'cn-n' ? `第 ${n} 页` : `${n} / ${pages.length}`
    const { width, height } = page.getSize()
    const size = 10
    const textWidth = font.widthOfTextAtSize(text, size)
    const x = position.includes('right') ? width - textWidth - 36 : position.includes('center') ? (width - textWidth) / 2 : 36
    const y = position.startsWith('top') ? height - 28 : 24
    page.drawText(text, { x, y, size, font, color: getPdfLib().rgb(0.25, 0.25, 0.25) })
  })
  const outDir = outputDirFor(request, input)
  const { stem } = baseInfo(input)
  const output = await uniqueOutput(outDir, `${stem}_page_numbers`, 'pdf')
  return [await savePdf(pdf, output)]
}

async function compressPdf(request) {
  const input = request.inputFiles[0].path
  const outDir = outputDirFor(request, input)
  const { stem } = baseInfo(input)
  const output = await uniqueOutput(outDir, `${stem}_compressed`, 'pdf')
  const settings = conversionSettings(request)
  const level = request.options?.level || 'balanced'
  const hasGhostscript = resolveEngine('external-ghostscript', settings)
  const hasQpdf = resolveEngine('qpdf', settings)

  if ((level === 'balanced' || level === 'strong') && hasGhostscript) {
    const gsSetting = level === 'strong' ? '/screen' : '/ebook'
    if (request.options?.linearize && hasQpdf) {
      const gsOutput = await uniqueOutput(outDir, `${stem}_ghostscript`, 'pdf')
      runConfiguredEngine(request, 'external-ghostscript', ['-sDEVICE=pdfwrite', '-dCompatibilityLevel=1.4', `-dPDFSETTINGS=${gsSetting}`, '-dNOPAUSE', '-dQUIET', '-dBATCH', `-sOutputFile=${gsOutput}`, input], { timeout: 180000 })
      runConfiguredEngine(request, 'qpdf', ['--object-streams=generate', '--stream-data=compress', '--recompress-flate', '--linearize', gsOutput, output])
      await fs.rm(gsOutput, { force: true }).catch(() => {})
      return [output]
    }
    runConfiguredEngine(request, 'external-ghostscript', ['-sDEVICE=pdfwrite', '-dCompatibilityLevel=1.4', `-dPDFSETTINGS=${gsSetting}`, '-dNOPAUSE', '-dQUIET', '-dBATCH', `-sOutputFile=${output}`, input], { timeout: 180000 })
    return [output]
  }

  if (request.options?.linearize && hasQpdf) {
    runConfiguredEngine(request, 'qpdf', ['--object-streams=generate', '--stream-data=compress', '--recompress-flate', '--linearize', input, output])
    return [output]
  }
  const pdf = await loadPdf(input)
  pdf.setProducer('LocalPDF Studio')
  pdf.setCreator('LocalPDF Studio')
  return [await savePdf(pdf, output)]
}

async function qpdfPasswordTool(request, mode) {
  const input = request.inputFiles[0].path
  const outDir = outputDirFor(request, input)
  const { stem } = baseInfo(input)
  const output = await uniqueOutput(outDir, `${stem}_${mode === 'encrypt' ? 'encrypted' : 'decrypted'}`, 'pdf')
  if (mode === 'encrypt') {
    const user = String(request.options?.userPassword || '')
    const owner = String(request.options?.ownerPassword || user || '')
    if (!user && !owner) throw new Error('请设置至少一个密码')
    runConfiguredEngine(request, 'qpdf', ['--encrypt', user, owner, String(request.options?.strength || '256'), '--', input, output])
  } else {
    const password = String(request.options?.password || '')
    runConfiguredEngine(request, 'qpdf', [`--password=${password}`, '--decrypt', input, output])
  }
  return [output]
}

async function addImagePage(pdf, input, options = {}) {
  let buffer = await fs.readFile(input)
  const ext = baseInfo(input).ext
  if (!['jpg', 'jpeg', 'png'].includes(ext)) buffer = await getSharp()(buffer).png().toBuffer()
  const image = ext === 'jpg' || ext === 'jpeg' ? await pdf.embedJpg(buffer) : await pdf.embedPng(buffer)
  const metadata = await getSharp()(buffer).metadata().catch(() => ({ width: image.width, height: image.height }))
  const sourceW = metadata.width || image.width
  const sourceH = metadata.height || image.height
  const pageSize = options.pageSize || 'auto'
  const pageDims = pageSize === 'a4' ? [595.28, 841.89] : pageSize === 'letter' ? [612, 792] : [sourceW * 0.75, sourceH * 0.75]
  const page = pdf.addPage(pageDims)
  const { width, height } = page.getSize()
  const scale = options.fit === 'cover' ? Math.max(width / image.width, height / image.height) : Math.min(width / image.width, height / image.height)
  const w = image.width * scale
  const h = image.height * scale
  page.drawImage(image, { x: (width - w) / 2, y: (height - h) / 2, width: w, height: h })
}

async function imagesToPdf(request) {
  const merge = request.options?.merge !== false
  const outputs = []
  if (merge) {
    const first = request.inputFiles[0].path
    const outDir = outputDirFor(request, first)
    const output = await uniqueOutput(outDir, `${baseInfo(first).stem}_images`, 'pdf')
    const pdf = await getPdfLib().PDFDocument.create()
    for (const file of request.inputFiles) await addImagePage(pdf, file.path, request.options || {})
    outputs.push(await savePdf(pdf, output))
    return outputs
  }
  for (const file of request.inputFiles) {
    const outDir = outputDirFor(request, file.path)
    const output = await uniqueOutput(outDir, `${baseInfo(file.path).stem}_image`, 'pdf')
    const pdf = await getPdfLib().PDFDocument.create()
    await addImagePage(pdf, file.path, request.options || {})
    outputs.push(await savePdf(pdf, output))
  }
  return outputs
}

async function convertImages(request) {
  const outputs = []
  const format = normalizeImageFormat(request.options?.format || 'png')
  for (const file of request.inputFiles) {
    const outDir = outputDirFor(request, file.path)
    const { stem } = baseInfo(file.path)
    const output = await uniqueOutput(outDir, `${stem}_converted`, format === 'jpg' ? 'jpg' : format)
    let pipeline = getSharp()(file.path)
    const resize = Number(request.options?.resize || 0)
    if (resize > 0) pipeline = pipeline.resize({ width: resize, height: resize, fit: 'inside', withoutEnlargement: true })
    const sharpFormat = format === 'jpg' ? 'jpeg' : format
    if (sharpFormat === 'jpeg') await pipeline.jpeg({ quality: qualityFor(request.options?.quality) }).toFile(output)
    else if (sharpFormat === 'webp') await pipeline.webp({ quality: qualityFor(request.options?.quality) }).toFile(output)
    else await pipeline.toFormat(sharpFormat).toFile(output)
    outputs.push(output)
  }
  return outputs
}

async function pdfToWord(request) {
  const { Document, Packer, Paragraph, TextRun, ImageRun, PageBreak } = getDocx()
  const input = request.inputFiles[0].path
  const mode = request.options?.mode || 'editable-docx'
  const outDir = outputDirFor(request, input)
  const output = await uniqueOutput(outDir, `${baseInfo(input).stem}_converted`, 'docx')

  if (mode === 'ocr-docx') {
    const pages = await ocrPdfPages(request, input)
    const children = []
    pages.forEach((page, index) => {
      children.push(new Paragraph({ children: [new TextRun({ text: `OCR 第 ${page.pageNumber} 页`, bold: true })] }))
      const lines = (page.text || '未识别到文本').split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
      for (const line of lines) children.push(new Paragraph({ children: [new TextRun(line)] }))
      if (index < pages.length - 1) children.push(new Paragraph({ children: [new PageBreak()] }))
    })
    const doc = new Document({ sections: [{ children }] })
    await fs.writeFile(output, await Packer.toBuffer(doc))
    return [output]
  }

  if (mode === 'image-docx' || mode === 'visual-docx' || mode === 'docx-compatible') {
    const rendered = await renderPdfPages(input, { pageRange: request.options?.pageRange, dpi: request.options?.dpi || 180 })
    const children = []
    rendered.forEach((page, index) => {
      const width = 650
      const height = Math.round(width * (page.height / page.width))
      children.push(new Paragraph({ children: [new ImageRun({ type: 'png', data: page.data, transformation: { width, height } })] }))
      if (index < rendered.length - 1) children.push(new Paragraph({ children: [new PageBreak()] }))
    })
    const doc = new Document({ sections: [{ children }] })
    await fs.writeFile(output, await Packer.toBuffer(doc))
    return [output]
  }

  const { text } = await extractText(input, request.options?.pageRange)
  const source = text || 'No extractable text was found in this PDF.'
  const lines = source.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  const mergeLines = request.options?.mergeLines !== false
  const paragraphs = mergeLines ? source.split(/\n{2,}/).map((item) => item.replace(/\s*\n\s*/g, ' ').trim()).filter(Boolean) : lines
  const doc = new Document({ sections: [{ children: paragraphs.slice(0, 1200).map((line) => new Paragraph({ children: [new TextRun(line)] })) }] })
  await fs.writeFile(output, await Packer.toBuffer(doc))
  return [output]
}

async function pdfToExcel(request) {
  const XLSX = getXlsx()
  const input = request.inputFiles[0].path
  const outDir = outputDirFor(request, input)
  const output = await uniqueOutput(outDir, `${baseInfo(input).stem}_tables`, 'xlsx')
  const mode = request.options?.tableMode || 'auto'

  const wb = XLSX.utils.book_new()
  if (mode === 'ocr-table') {
    const pages = await ocrPdfPages(request, input)
    for (const page of pages) {
      const rows = rowsFromText(page.text)
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows.length ? rows : [['未识别到文本']]), `OCR ${page.pageNumber}`.slice(0, 31))
    }
    XLSX.writeFile(wb, output)
    return [output]
  }

  const partial = await parsePageNumbers(input, request.options?.pageRange)
  let sheetCount = 0

  if (mode === 'auto') {
    const parser = new (getPDFParse())({ data: await fs.readFile(input) })
    try {
      const tableResult = await parser.getTable({ partial })
      for (const page of tableResult.pages || []) {
        for (let i = 0; i < (page.tables || []).length; i += 1) {
          const table = page.tables[i]
          if (!table?.length) continue
          XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(table), `P${page.num}_Table${i + 1}`.slice(0, 31))
          sheetCount += 1
        }
      }
    } finally {
      await parser.destroy().catch(() => {})
    }
  }

  if (sheetCount === 0) {
    const { pages, text } = await extractText(input, request.options?.pageRange)
    if (mode === 'per-page' && pages.length) {
      for (const page of pages) {
        const rows = String(page.text || '').split(/\r?\n/).map((line) => line.split(/\s{2,}|\t|,/).map((cell) => cell.trim()).filter(Boolean)).filter((row) => row.length)
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows.length ? rows : [['No extractable text']]), `Page ${page.num}`.slice(0, 31))
      }
    } else {
      const rows = (text || 'No extractable text').split(/\r?\n/).map((line) => line.split(/\s{2,}|\t|,/).map((cell) => cell.trim()).filter(Boolean)).filter((row) => row.length)
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows.length ? rows : [['No extractable text']]), 'PDF Text')
    }
  }

  XLSX.writeFile(wb, output)
  return [output]
}

function dataUriPng(buffer) {
  return `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`
}

async function pdfPageMetrics(input, pageRange) {
  const pdf = await loadPdf(input)
  const indices = parseRange(pageRange, pdf.getPageCount())
  return indices.map((index) => {
    const page = pdf.getPage(index)
    const { width, height } = page.getSize()
    return { pageNumber: index + 1, width, height }
  })
}

function textLinesForSlide(text) {
  return String(text || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function slideTextForPage(page, fallbackText = '') {
  return textLinesForSlide(page?.text || fallbackText).slice(0, 80).join('\n')
}

async function textPagesForPptx(request, input) {
  if (request.options?.mode === 'ocr-pptx') {
    const pages = await ocrPdfPages(request, input)
    return pages.map((page) => ({ num: page.pageNumber, text: page.text }))
  }
  const extracted = await extractText(input, request.options?.pageRange)
  if (extracted.pages?.length) return extracted.pages
  return [{ num: 1, text: extracted.text }]
}

async function pdfToPptx(request) {
  const PptxGenJS = getPptxGenJS()
  const input = request.inputFiles[0].path
  const mode = request.options?.mode || 'editable-pptx'
  const metrics = await pdfPageMetrics(input, request.options?.pageRange)
  if (!metrics.length) throw new Error('没有可转换的 PDF 页面')

  const pptx = new PptxGenJS()
  const ratio = request.options?.ratio || 'auto'
  let slideW = 13.333
  let slideH = 7.5
  if (ratio === '4-3') slideW = 10
  else if (ratio === 'auto') {
    slideH = 7.5
    slideW = Math.max(5, Math.min(14.2, slideH * (metrics[0].width / metrics[0].height)))
    pptx.defineLayout({ name: 'PDF_AUTO', width: slideW, height: slideH })
    pptx.layout = 'PDF_AUTO'
  } else pptx.layout = 'LAYOUT_WIDE'
  if (ratio === '4-3') pptx.layout = 'LAYOUT_4X3'

  if (mode === 'visual-pptx') {
    const rendered = await renderPdfPages(input, { pageRange: request.options?.pageRange, dpi: request.options?.dpi || 200 })
    for (const page of rendered) {
      const slide = pptx.addSlide()
      slide.background = { color: 'FFFFFF' }
      const imageRatio = page.width / page.height
      const slideRatio = slideW / slideH
      let w = slideW
      let h = slideH
      if (imageRatio > slideRatio) h = slideW / imageRatio
      else w = slideH * imageRatio
      slide.addImage({ data: dataUriPng(page.data), x: (slideW - w) / 2, y: (slideH - h) / 2, w, h })
    }
  } else {
    const pages = await textPagesForPptx(request, input)
    const pageText = new Map(pages.map((page, index) => [Number(page.num || page.pageNumber || index + 1), page.text || '']))
    const backgroundPages = mode === 'editable-pptx-with-background' ? await renderPdfPages(input, { pageRange: request.options?.pageRange, dpi: request.options?.dpi || 140 }) : []
    const backgroundByPage = new Map(backgroundPages.map((page) => [page.pageNumber, page]))

    for (const page of metrics) {
      const slide = pptx.addSlide()
      slide.background = { color: 'FFFFFF' }
      const bg = backgroundByPage.get(page.pageNumber)
      if (bg) slide.addImage({ data: dataUriPng(bg.data), x: 0, y: 0, w: slideW, h: slideH, transparency: 72 })
      const text = slideTextForPage({ text: pageText.get(page.pageNumber) })
      const title = textLinesForSlide(text)[0] || `第 ${page.pageNumber} 页`
      slide.addText(title.slice(0, 90), { x: 0.45, y: 0.35, w: slideW - 0.9, h: 0.55, fontFace: 'Microsoft YaHei UI', fontSize: 22, bold: true, color: '1F2933', margin: 0.04, breakLine: false, fit: 'shrink' })
      const body = textLinesForSlide(text).slice(1).join('\n') || text || '未提取到可编辑文本；可尝试 OCR 模式或视觉保留模式。'
      slide.addText(body.slice(0, 5000), { x: 0.55, y: 1.05, w: slideW - 1.1, h: Math.max(1, slideH - 1.55), fontFace: 'Microsoft YaHei UI', fontSize: 13.5, color: '333333', margin: 0.05, valign: 'top', fit: 'shrink', breakLine: false })
    }
  }

  const outDir = outputDirFor(request, input)
  const output = await uniqueOutput(outDir, `${baseInfo(input).stem}_slides`, 'pptx')
  await pptx.writeFile({ fileName: output })
  return [output]
}

async function pdfToEpub(request) {
  const JSZip = getJSZip()
  const input = request.inputFiles[0].path
  const title = cleanName(String(request.options?.title || baseInfo(input).stem))
  const outDir = outputDirFor(request, input)
  const output = await uniqueOutput(outDir, `${baseInfo(input).stem}`, 'epub')
  const zip = new JSZip()
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' })
  zip.file('META-INF/container.xml', '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>')

  if (request.options?.mode === 'image') {
    const rendered = await renderPdfPages(input, { pageRange: request.options?.pageRange, dpi: request.options?.dpi || 150 })
    const manifestImages = []
    const imgTags = []
    for (let i = 0; i < rendered.length; i += 1) {
      const name = `images/page-${String(i + 1).padStart(3, '0')}.png`
      zip.file(`OEBPS/${name}`, rendered[i].data)
      manifestImages.push(`<item id="img${i + 1}" href="${name}" media-type="image/png"/>`)
      imgTags.push(`<figure><img src="${name}" alt="Page ${i + 1}"/></figure>`)
    }
    zip.file('OEBPS/chapter.xhtml', `<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>${escapeXml(title)}</title><style>body{margin:0;padding:0;}figure{margin:0 0 1em;}img{max-width:100%;height:auto;display:block;}</style></head><body>${imgTags.join('')}</body></html>`)
    zip.file('OEBPS/nav.xhtml', `<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>${escapeXml(title)}</title></head><body><nav epub:type="toc"><ol><li><a href="chapter.xhtml">${escapeXml(title)}</a></li></ol></nav></body></html>`)
    zip.file('OEBPS/content.opf', `<?xml version="1.0" encoding="utf-8"?><package version="3.0" unique-identifier="bookid" xmlns="http://www.idpf.org/2007/opf"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="bookid">localpdf-${Date.now()}</dc:identifier><dc:title>${escapeXml(title)}</dc:title><dc:language>zh-CN</dc:language></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="chapter" href="chapter.xhtml" media-type="application/xhtml+xml"/>${manifestImages.join('')}</manifest><spine><itemref idref="chapter"/></spine></package>`)
  } else {
    const { text } = await extractText(input, request.options?.pageRange)
    zip.file('OEBPS/content.opf', `<?xml version="1.0" encoding="utf-8"?><package version="3.0" unique-identifier="bookid" xmlns="http://www.idpf.org/2007/opf"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="bookid">localpdf-${Date.now()}</dc:identifier><dc:title>${escapeXml(title)}</dc:title><dc:language>zh-CN</dc:language></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="chapter" href="chapter.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="chapter"/></spine></package>`)
    zip.file('OEBPS/nav.xhtml', `<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>${escapeXml(title)}</title></head><body><nav epub:type="toc"><ol><li><a href="chapter.xhtml">${escapeXml(title)}</a></li></ol></nav></body></html>`)
    zip.file('OEBPS/chapter.xhtml', `<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>${escapeXml(title)}</title><style>body{font-family:serif;line-height:1.7;padding:2em;} p{margin:0 0 1em;}</style></head><body><h1>${escapeXml(title)}</h1>${(text || 'No extractable text was found in this PDF.').split(/\n{2,}|\r?\n/).filter(Boolean).map((p) => `<p>${escapeXml(p)}</p>`).join('')}</body></html>`)
  }

  await fs.writeFile(output, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }))
  return [output]
}

function escapeXml(value) {
  return String(value).replace(/[<>&"']/g, (ch) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[ch]))
}

async function pdfToImages(request) {
  const input = request.inputFiles[0].path
  const outDir = outputDirFor(request, input)
  const format = normalizeImageFormat(request.options?.format || 'png')
  const rendered = await renderPdfPages(input, request.options || {})
  const outputs = []
  for (const page of rendered) {
    const ext = format === 'jpg' ? 'jpg' : format
    const output = await uniqueOutput(outDir, `${baseInfo(input).stem}_page_${String(page.pageNumber).padStart(3, '0')}`, ext)
    await writeImage(page.data, output, format, request.options?.quality)
    outputs.push(output)
  }
  return outputs
}

async function extractPdfImages(request) {
  const input = request.inputFiles[0].path
  const outDir = outputDirFor(request, input)
  const partial = await parsePageNumbers(input, request.options?.pageRange)
  const parser = new (getPDFParse())({ data: await fs.readFile(input) })
  try {
    const result = await parser.getImage({ partial, imageThreshold: Number(request.options?.minSize || 64), imageDataUrl: false, imageBuffer: true })
    const outputs = []
    const seen = new Set()
    const format = normalizeImageFormat(request.options?.format || 'png')
    for (const page of result.pages || []) {
      const images = page.images || []
      for (let i = 0; i < images.length; i += 1) {
        const buffer = Buffer.from(images[i].data)
        const hash = crypto.createHash('sha256').update(buffer).digest('hex')
        if (request.options?.dedupe !== false && seen.has(hash)) continue
        seen.add(hash)
        const output = await uniqueOutput(outDir, `${baseInfo(input).stem}_p${page.num}_img${i + 1}`, format === 'jpg' ? 'jpg' : format)
        await writeImage(buffer, output, format)
        outputs.push(output)
      }
    }
    if (!outputs.length) throw new Error('未在 PDF 中找到可提取图片')
    return outputs
  } finally {
    await parser.destroy().catch(() => {})
  }
}

function discoverLibreOfficeOutput(outDir, inputPath, startedAt) {
  const expected = path.join(outDir, `${baseInfo(inputPath).stem}.pdf`)
  if (fsSync.existsSync(expected)) return expected
  const stem = baseInfo(inputPath).stem.toLowerCase()
  const candidates = fsSync.readdirSync(outDir)
    .filter((name) => name.toLowerCase().endsWith('.pdf'))
    .map((name) => path.join(outDir, name))
    .filter((candidate) => {
      const stat = fsSync.statSync(candidate)
      const candidateStem = baseInfo(candidate).stem.toLowerCase()
      return stat.size > 0 && stat.mtimeMs >= startedAt - 2000 && (candidateStem === stem || candidateStem.startsWith(stem))
    })
    .sort((a, b) => fsSync.statSync(b).mtimeMs - fsSync.statSync(a).mtimeMs)
  return candidates[0] || null
}

async function officeToPdf(request) {
  const outputs = []
  const soffice = resolveEngine('libreoffice', conversionSettings(request))
  if (!soffice) throw new Error('缺少 LibreOffice：请安装 LibreOffice，或在设置中配置 soffice.exe 后再执行 Office 转 PDF')
  const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'localpdf-lo-'))
  try {
    for (const file of request.inputFiles) {
      const outDir = outputDirFor(request, file.path)
      await ensureDir(outDir)
      const startedAt = Date.now()
      runConfiguredEngine(request, 'libreoffice', [`-env:UserInstallation=${pathToFileURL(profile).href}`, '--headless', '--nologo', '--nofirststartwizard', '--convert-to', 'pdf', '--outdir', outDir, file.path], { timeout: 120000 })
      const output = discoverLibreOfficeOutput(outDir, file.path, startedAt)
      if (!output) throw new Error(`LibreOffice 未生成 PDF 输出：${file.path}`)
      outputs.push(output)
    }
  } finally {
    await fs.rm(profile, { recursive: true, force: true }).catch(() => {})
  }
  return outputs
}

async function convert(request) {
  for (const file of request.inputFiles || []) {
    if (!file.path || !fsSync.existsSync(file.path)) throw new Error(`输入文件不存在：${file.path || file.name}`)
  }

  let outputs
  switch (request.toolId) {
    case 'merge-pdf': outputs = await mergePdf(request); break
    case 'split-pdf': outputs = await splitPdf(request); break
    case 'delete-pdf-pages': outputs = await keepOrReorderPdf(request, 'delete'); break
    case 'reorder-pdf': outputs = await keepOrReorderPdf(request, 'reorder'); break
    case 'rotate-pdf': outputs = await rotatePdf(request); break
    case 'watermark-pdf': outputs = await watermarkPdf(request); break
    case 'pdf-page-numbers': outputs = await pageNumbersPdf(request); break
    case 'compress-pdf': outputs = await compressPdf(request); break
    case 'encrypt-pdf': outputs = await qpdfPasswordTool(request, 'encrypt'); break
    case 'decrypt-pdf': outputs = await qpdfPasswordTool(request, 'decrypt'); break
    case 'images-to-pdf': outputs = await imagesToPdf(request); break
    case 'image-format-convert': outputs = await convertImages(request); break
    case 'pdf-to-word':
    case 'pdf-to-pages': outputs = await pdfToWord(request); break
    case 'pdf-to-excel':
    case 'pdf-to-numbers': outputs = await pdfToExcel(request); break
    case 'pdf-to-pptx':
    case 'pdf-to-keynote': outputs = await pdfToPptx(request); break
    case 'pdf-to-epub': outputs = await pdfToEpub(request); break
    case 'pdf-to-images': outputs = await pdfToImages(request); break
    case 'extract-pdf-images': outputs = await extractPdfImages(request); break
    case 'word-to-pdf':
    case 'excel-to-pdf':
    case 'pptx-to-pdf': outputs = await officeToPdf(request); break
    default: throw new Error(`暂不支持的工具：${request.toolId}`)
  }
  return assertOutputFiles(outputs)
}

module.exports = { convert, commandExists, IMAGE_EXTS, OFFICE_EXTS }
