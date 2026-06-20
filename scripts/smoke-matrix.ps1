$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$work = Join-Path $root "tmp-smoke\matrix"
$requests = Join-Path $work "requests"
$results = Join-Path $work "results"
$out = Join-Path $work "out"
New-Item -ItemType Directory -Force $requests, $results, $out | Out-Null

Push-Location $root
try {
  $fixtureScript = @'
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const { Document, Packer, Paragraph, TextRun } = require('docx');
const XLSX = require('xlsx');
const pptxgen = require('pptxgenjs');
const sharp = require('sharp');
const { resolveEngine } = require('./electron/engines.cjs');

const root = process.cwd();
const work = path.join(root, 'tmp-smoke', 'matrix');
const fixtures = path.join(work, 'fixtures');
const requests = path.join(work, 'requests');
const out = path.join(work, 'out');
fs.rmSync(requests, { recursive: true, force: true });
fs.mkdirSync(fixtures, { recursive: true });
fs.mkdirSync(requests, { recursive: true });
fs.mkdirSync(out, { recursive: true });

async function makeImage(name = 'sample.png', label = 'LocalPDF Image') {
  const p = path.join(fixtures, name);
  await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="720" height="420"><rect width="100%" height="100%" fill="#fff8ef"/><rect x="36" y="36" width="648" height="348" rx="30" fill="#ffffff" stroke="#d9d1bf"/><text x="72" y="215" font-size="52" font-family="Arial" fill="#222">${label}</text><circle cx="620" cy="92" r="32" fill="#d97742"/></svg>`)).png().toFile(p);
  return p;
}

async function makeJpg() {
  const p = path.join(fixtures, 'sample.jpg');
  await sharp(await fs.promises.readFile(path.join(fixtures, 'sample.png'))).jpeg({ quality: 88 }).toFile(p);
  return p;
}

async function makePdf(name, text, withImage = false) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  let embedded;
  if (withImage) embedded = await doc.embedPng(await fs.promises.readFile(path.join(fixtures, 'sample.png')));
  for (let i = 0; i < 2; i++) {
    const page = doc.addPage([460, 300]);
    page.drawText(`${text} page ${i + 1}`, { x: 38, y: 230, size: 22, font, color: rgb(0.10, 0.10, 0.09) });
    page.drawText('Name        Count       Amount', { x: 42, y: 170, size: 12, font });
    page.drawText('Alpha       12          100', { x: 42, y: 148, size: 12, font });
    page.drawText('Beta        27          350', { x: 42, y: 126, size: 12, font });
    page.drawText('Gamma       31          480', { x: 42, y: 104, size: 12, font });
    if (embedded && i === 0) page.drawImage(embedded, { x: 300, y: 36, width: 110, height: 64 });
  }
  const p = path.join(fixtures, name);
  fs.writeFileSync(p, await doc.save());
  return p;
}

async function makeScannedPdf() {
  const image = await makeImage('ocr-page.png', 'LOCALPDF OCR TEST');
  const doc = await PDFDocument.create();
  const png = await doc.embedPng(await fs.promises.readFile(image));
  const page = doc.addPage([520, 320]);
  page.drawImage(png, { x: 36, y: 54, width: 448, height: 220 });
  const p = path.join(fixtures, 'scanned.pdf');
  fs.writeFileSync(p, await doc.save());
  return p;
}

async function makeDocx() {
  const p = path.join(fixtures, 'sample.docx');
  const doc = new Document({ sections: [{ children: [
    new Paragraph({ children: [new TextRun({ text: 'LocalPDF LibreOffice smoke document', bold: true })] }),
    new Paragraph({ children: [new TextRun('Editable Office fixture for DOCX to PDF.')] }),
  ] }] });
  fs.writeFileSync(p, await Packer.toBuffer(doc));
  return p;
}

function makeXlsx() {
  const p = path.join(fixtures, 'sample.xlsx');
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Name', 'Value'], ['LocalPDF', 42], ['Matrix', 7]]), 'Sheet1');
  XLSX.writeFile(wb, p);
  return p;
}

async function makePptx() {
  const p = path.join(fixtures, 'sample.pptx');
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE';
  const slide = pptx.addSlide();
  slide.addText('LocalPDF PPTX smoke', { x: 0.8, y: 0.8, w: 8, h: 1, fontSize: 28, bold: true });
  slide.addText('Editable PowerPoint fixture', { x: 0.8, y: 1.8, w: 6, h: 0.6, fontSize: 18 });
  await pptx.writeFile({ fileName: p });
  return p;
}

function fileObj(p) {
  const stat = fs.statSync(p);
  return { name: path.basename(p), path: p, size: stat.size, extension: path.extname(p).slice(1).toLowerCase() };
}

function writeReq(name, req, requires) {
  fs.writeFileSync(path.join(requests, `${name}.json`), JSON.stringify({ ...req, requires }, null, 2));
}

(async () => {
  const image = await makeImage();
  const jpg = await makeJpg();
  const pdfA = await makePdf('a.pdf', 'LocalPDF A', true);
  const pdfB = await makePdf('b.pdf', 'LocalPDF B', false);
  const scanned = await makeScannedPdf();
  const docx = await makeDocx();
  const xlsx = makeXlsx();
  const pptx = await makePptx();
  const qpdf = resolveEngine('qpdf');
  const encrypted = path.join(fixtures, 'encrypted.pdf');
  if (qpdf) spawnSync(qpdf, ['--encrypt', 'localpdf', 'localpdf-owner', '256', '--', pdfA, encrypted], { windowsHide: true });

  writeReq('01-merge-pdf', { toolId: 'merge-pdf', inputFiles: [fileObj(pdfA), fileObj(pdfB)], outputDirectory: out, options: {} });
  writeReq('02-split-pdf-every-page', { toolId: 'split-pdf', inputFiles: [fileObj(pdfA)], outputDirectory: out, options: { mode: 'every-page' } });
  writeReq('03-split-pdf-ranges', { toolId: 'split-pdf', inputFiles: [fileObj(pdfA)], outputDirectory: out, options: { mode: 'ranges', ranges: '1,2' } });
  writeReq('04-delete-pdf-pages', { toolId: 'delete-pdf-pages', inputFiles: [fileObj(pdfA)], outputDirectory: out, options: { deleteRange: '2' } });
  writeReq('05-reorder-pdf', { toolId: 'reorder-pdf', inputFiles: [fileObj(pdfA)], outputDirectory: out, options: { order: '2,1' } });
  writeReq('06-rotate-pdf', { toolId: 'rotate-pdf', inputFiles: [fileObj(pdfA)], outputDirectory: out, options: { angle: '90', pageRange: '1' } });
  writeReq('07-watermark-pdf-text', { toolId: 'watermark-pdf', inputFiles: [fileObj(pdfA)], outputDirectory: out, options: { watermarkType: 'text', text: 'LOCALPDF', opacity: 28, angle: -30 } });
  writeReq('08-pdf-page-numbers', { toolId: 'pdf-page-numbers', inputFiles: [fileObj(pdfA)], outputDirectory: out, options: { format: 'cn-n', position: 'bottom-center', startAt: 1 } });
  writeReq('09-compress-pdf-light', { toolId: 'compress-pdf', inputFiles: [fileObj(pdfA)], outputDirectory: out, options: { level: 'light', linearize: false } });
  writeReq('10-compress-pdf-balanced-ghostscript', { toolId: 'compress-pdf', inputFiles: [fileObj(pdfA)], outputDirectory: out, options: { level: 'balanced', linearize: false } }, 'external-ghostscript');
  writeReq('11-images-to-pdf', { toolId: 'images-to-pdf', inputFiles: [fileObj(image), fileObj(jpg)], outputDirectory: out, options: { merge: true, pageSize: 'auto', fit: 'contain' } });
  writeReq('12-image-format-convert-webp', { toolId: 'image-format-convert', inputFiles: [fileObj(image)], outputDirectory: out, options: { format: 'webp', quality: 'balanced' } });
  writeReq('13-pdf-to-images-png', { toolId: 'pdf-to-images', inputFiles: [fileObj(pdfA)], outputDirectory: out, options: { format: 'png', dpi: 120 } });
  writeReq('14-pdf-to-images-jpg', { toolId: 'pdf-to-images', inputFiles: [fileObj(pdfA)], outputDirectory: out, options: { format: 'jpg', dpi: 120, quality: 'balanced' } });
  writeReq('15-extract-pdf-images', { toolId: 'extract-pdf-images', inputFiles: [fileObj(pdfA)], outputDirectory: out, options: { minSize: 24, dedupe: true, format: 'png' } });
  writeReq('16-pdf-to-word-editable', { toolId: 'pdf-to-word', inputFiles: [fileObj(pdfA)], outputDirectory: out, options: { mode: 'editable-docx', mergeLines: true } });
  writeReq('17-pdf-to-word-visual', { toolId: 'pdf-to-word', inputFiles: [fileObj(pdfA)], outputDirectory: out, options: { mode: 'visual-docx', dpi: 120 } });
  writeReq('18-pdf-to-word-ocr', { toolId: 'pdf-to-word', inputFiles: [fileObj(scanned)], outputDirectory: out, options: { mode: 'ocr-docx', ocrLanguage: 'eng', dpi: 180 } }, 'tesseract');
  writeReq('19-pdf-to-excel-auto', { toolId: 'pdf-to-excel', inputFiles: [fileObj(pdfA)], outputDirectory: out, options: { tableMode: 'auto' } });
  writeReq('20-pdf-to-excel-per-page', { toolId: 'pdf-to-excel', inputFiles: [fileObj(pdfA)], outputDirectory: out, options: { tableMode: 'per-page' } });
  writeReq('21-pdf-to-excel-ocr', { toolId: 'pdf-to-excel', inputFiles: [fileObj(scanned)], outputDirectory: out, options: { tableMode: 'ocr-table', ocrLanguage: 'eng', dpi: 180 } }, 'tesseract');
  writeReq('22-pdf-to-pptx-editable', { toolId: 'pdf-to-pptx', inputFiles: [fileObj(pdfA)], outputDirectory: out, options: { mode: 'editable-pptx', ratio: 'auto' } });
  writeReq('23-pdf-to-pptx-visual', { toolId: 'pdf-to-pptx', inputFiles: [fileObj(pdfA)], outputDirectory: out, options: { mode: 'visual-pptx', ratio: 'auto', dpi: 120 } });
  writeReq('24-pdf-to-pptx-ocr', { toolId: 'pdf-to-pptx', inputFiles: [fileObj(scanned)], outputDirectory: out, options: { mode: 'ocr-pptx', ratio: 'auto', ocrLanguage: 'eng', dpi: 180 } }, 'tesseract');
  writeReq('25-pdf-to-pages-editable', { toolId: 'pdf-to-pages', inputFiles: [fileObj(pdfA)], outputDirectory: out, options: { mode: 'editable-docx' } });
  writeReq('26-pdf-to-numbers', { toolId: 'pdf-to-numbers', inputFiles: [fileObj(pdfA)], outputDirectory: out, options: { tableMode: 'per-page' } });
  writeReq('27-pdf-to-keynote', { toolId: 'pdf-to-keynote', inputFiles: [fileObj(pdfA)], outputDirectory: out, options: { mode: 'editable-pptx', ratio: 'auto' } });
  writeReq('28-pdf-to-epub-text', { toolId: 'pdf-to-epub', inputFiles: [fileObj(pdfA)], outputDirectory: out, options: { mode: 'text', title: 'LocalPDF Smoke' } });
  writeReq('29-pdf-to-epub-image', { toolId: 'pdf-to-epub', inputFiles: [fileObj(pdfA)], outputDirectory: out, options: { mode: 'image', title: 'LocalPDF Smoke Image', dpi: 100 } });
  writeReq('30-encrypt-pdf-qpdf', { toolId: 'encrypt-pdf', inputFiles: [fileObj(pdfA)], outputDirectory: out, options: { userPassword: 'localpdf', ownerPassword: 'localpdf-owner', strength: '256' } }, 'qpdf');
  writeReq('31-decrypt-pdf-qpdf', { toolId: 'decrypt-pdf', inputFiles: [fileObj(fs.existsSync(encrypted) ? encrypted : pdfA)], outputDirectory: out, options: { password: 'localpdf' } }, 'qpdf');
  writeReq('32-word-to-pdf-libreoffice', { toolId: 'word-to-pdf', inputFiles: [fileObj(docx)], outputDirectory: out, options: {} }, 'libreoffice');
  writeReq('33-excel-to-pdf-libreoffice', { toolId: 'excel-to-pdf', inputFiles: [fileObj(xlsx)], outputDirectory: out, options: {} }, 'libreoffice');
  writeReq('34-pptx-to-pdf-libreoffice', { toolId: 'pptx-to-pdf', inputFiles: [fileObj(pptx)], outputDirectory: out, options: {} }, 'libreoffice');
})();
'@
  $fixtureScript | node -

  $validateScript = @'
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { PDFDocument } = require('pdf-lib');
const JSZip = require('jszip');
const XLSX = require('xlsx');
const sharp = require('sharp');
const { resolveEngine } = require('./electron/engines.cjs');

const caseName = process.env.LOCALPDF_VALIDATE_CASE;
const resultPath = process.env.LOCALPDF_VALIDATE_RESULT;
const result = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
if (!result.ok) throw new Error(result.error || 'conversion failed');
const outputs = result.outputFiles || [];
if (!outputs.length) throw new Error('no output files');

async function validatePdf(file) {
  if (/encrypt/.test(caseName)) {
    const qpdf = resolveEngine('qpdf');
    if (!qpdf) throw new Error('qpdf unavailable for encrypted PDF validation');
    const result = spawnSync(qpdf, ['--show-encryption', file], { encoding: 'utf8', timeout: 15000, windowsHide: true });
    const combined = `${result.stdout || ''}\n${result.stderr || ''}`;
    if (result.status !== 0 || !/encrypted|R =|P =|AES|stream encryption method/i.test(combined)) throw new Error(`encrypted PDF validation failed: ${combined.split(/\r?\n/)[0] || result.status}`);
    return;
  }
  const bytes = fs.readFileSync(file);
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
  if (pdf.getPageCount() < 1) throw new Error(`invalid PDF page count: ${file}`);
}
async function validateDocx(file) {
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  const documentXml = await zip.file('word/document.xml')?.async('string');
  if (!documentXml) throw new Error(`missing DOCX document.xml: ${file}`);
  const media = Object.keys(zip.files).filter((name) => name.startsWith('word/media/'));
  if (/visual/.test(caseName) && media.length === 0) throw new Error(`visual DOCX has no page images: ${file}`);
  if (!/visual/.test(caseName) && !documentXml.includes('<w:t')) throw new Error(`editable DOCX has no text runs: ${file}`);
}
function validateXlsx(file) {
  const wb = XLSX.readFile(file);
  if (!wb.SheetNames.length) throw new Error(`XLSX has no sheets: ${file}`);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (!sheet || !sheet['!ref']) throw new Error(`XLSX first sheet is empty: ${file}`);
}
async function validatePptx(file) {
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  const slideXmlNames = Object.keys(zip.files).filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name));
  if (!slideXmlNames.length) throw new Error(`PPTX has no slides: ${file}`);
  const slideXml = (await Promise.all(slideXmlNames.map((name) => zip.file(name).async('string')))).join('\n');
  const media = Object.keys(zip.files).filter((name) => name.startsWith('ppt/media/'));
  if (/visual/.test(caseName) && media.length === 0) throw new Error(`visual PPTX has no page images: ${file}`);
  if (!/visual/.test(caseName) && !slideXml.includes('<a:t')) throw new Error(`editable PPTX has no text boxes: ${file}`);
}
async function validateEpub(file) {
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  const mimetype = await zip.file('mimetype')?.async('string');
  if (mimetype !== 'application/epub+zip') throw new Error(`invalid EPUB mimetype: ${file}`);
  if (!zip.file('OEBPS/content.opf')) throw new Error(`missing EPUB content.opf: ${file}`);
}
async function validateImage(file) {
  const meta = await sharp(file).metadata();
  if (!meta.width || !meta.height) throw new Error(`invalid image metadata: ${file}`);
}

(async () => {
  for (const file of outputs) {
    const stat = fs.statSync(file);
    if (!stat.size) throw new Error(`empty output: ${file}`);
    const ext = path.extname(file).toLowerCase();
    if (ext === '.pdf') await validatePdf(file);
    else if (ext === '.docx') await validateDocx(file);
    else if (ext === '.xlsx') validateXlsx(file);
    else if (ext === '.pptx') await validatePptx(file);
    else if (ext === '.epub') await validateEpub(file);
    else if (['.png', '.jpg', '.jpeg', '.webp', '.tiff', '.tif', '.bmp'].includes(ext)) await validateImage(file);
    else throw new Error(`unsupported output extension for validation: ${file}`);
  }
  console.log(`validated ${outputs.length} output(s)`);
})().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
'@

  function Resolve-LocalPDFEngine($engineId) {
    $script = "const { resolveEngine } = require('./electron/engines.cjs'); const p = resolveEngine(process.argv[1]); if (p) { console.log(p); process.exit(0) } process.exit(1);"
    $resolved = & node -e $script $engineId 2>$null
    if ($LASTEXITCODE -eq 0 -and $resolved) { return [string]$resolved }
    return $null
  }

  $runnerScript = @'
const fs = require('fs');
const { convert } = require('./electron/conversion.cjs');
(async () => {
  const requestPath = process.env.LOCALPDF_SMOKE_CONVERSION_REQUEST;
  const resultPath = process.env.LOCALPDF_SMOKE_CONVERSION_RESULT;
  try {
    const request = JSON.parse(fs.readFileSync(requestPath, 'utf8'));
    const outputFiles = await convert(request);
    fs.writeFileSync(resultPath, JSON.stringify({ ok: true, outputFiles }, null, 2));
  } catch (error) {
    fs.writeFileSync(resultPath, JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }, null, 2));
    process.exitCode = 1;
  }
})();
'@

  $cases = Get-ChildItem $requests -Filter "*.json" | Sort-Object Name
  $summary = @()
  foreach ($case in $cases) {
    $json = Get-Content $case.FullName -Raw | ConvertFrom-Json
    $requires = @()
    if ($json.PSObject.Properties.Name -contains 'requires' -and $null -ne $json.requires) {
      if ($json.requires -is [System.Array]) { $requires = $json.requires } else { $requires = @($json.requires) }
    }
    $missing = @()
    foreach ($engine in $requires) {
      $resolved = Resolve-LocalPDFEngine $engine
      if (-not $resolved) { $missing += $engine }
    }
    if ($missing.Count -gt 0) {
      Write-Host "[skip] $($case.BaseName) requires $($missing -join ', ')"
      $summary += [pscustomobject]@{ Case = $case.BaseName; Status = "skipped"; Reason = "missing $($missing -join ', ')" }
      continue
    }

    $resultPath = Join-Path $results "$($case.BaseName).result.json"
    $env:LOCALPDF_SMOKE_CONVERSION_REQUEST = $case.FullName
    $env:LOCALPDF_SMOKE_CONVERSION_RESULT = $resultPath
    try {
      Write-Host "[run] $($case.BaseName)"
      $runnerScript | node -
      $result = Get-Content $resultPath -Raw | ConvertFrom-Json
      if ($result.ok) {
        $env:LOCALPDF_VALIDATE_CASE = $case.BaseName
        $env:LOCALPDF_VALIDATE_RESULT = $resultPath
        $validateScript | node -
        if ($LASTEXITCODE -ne 0) { throw "semantic validation failed" }
        Write-Host "[ok] $($case.BaseName)"
        $summary += [pscustomobject]@{ Case = $case.BaseName; Status = "ok"; Reason = ($result.outputFiles -join ";") }
      } else {
        Write-Host "[fail] $($case.BaseName): $($result.error)"
        $summary += [pscustomobject]@{ Case = $case.BaseName; Status = "failed"; Reason = $result.error }
      }
    } catch {
      $summary += [pscustomobject]@{ Case = $case.BaseName; Status = "failed"; Reason = [string]$_ }
    } finally {
      Remove-Item Env:\LOCALPDF_SMOKE_CONVERSION_REQUEST -ErrorAction SilentlyContinue
      Remove-Item Env:\LOCALPDF_SMOKE_CONVERSION_RESULT -ErrorAction SilentlyContinue
      Remove-Item Env:\LOCALPDF_VALIDATE_CASE -ErrorAction SilentlyContinue
      Remove-Item Env:\LOCALPDF_VALIDATE_RESULT -ErrorAction SilentlyContinue
    }
  }

  $summary | Format-Table -AutoSize
  $failed = $summary | Where-Object { $_.Status -eq "failed" }
  if ($failed.Count -gt 0) { exit 1 }
  exit 0
} finally {
  Pop-Location
}
