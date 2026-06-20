import type { ToolCategoryId } from './categories'
import type { ToolOptionSchema } from './schemas'
import { commonPageRange, outputDirectoryOption } from './schemas'

export type EngineId = 'qpdf' | 'pdfcpu' | 'pdfium' | 'libreoffice' | 'image' | 'office-writer' | 'epub' | 'external-ghostscript' | 'tesseract'
export type ImplementationStatus = 'ready' | 'partial' | 'external-required' | 'coming-soon'
export type InputMode = 'single' | 'multiple-to-one' | 'batch'
export type PreviewMode = 'real' | 'placeholder' | 'none' | 'after-conversion'
export type FidelityMode = 'visual' | 'editable-text' | 'table-extract' | 'ocr' | 'native'

export type ToolDefinition = {
  id: string
  title: string
  description: string
  category: ToolCategoryId
  icon: string
  accent: string
  acceptedExtensions: string[]
  outputExtensions: string[]
  supportsBatch: boolean
  supportsPreview: boolean
  experimental?: boolean
  requiredEngines: EngineId[]
  builtInEngines?: EngineId[]
  optionalEngines?: EngineId[]
  implementationStatus?: ImplementationStatus
  inputMode?: InputMode
  previewMode?: PreviewMode
  fidelityModes?: FidelityMode[]
  sensitiveOptionKeys?: string[]
  limitations?: string[]
  options: ToolOptionSchema
}

const externalEngineSet = new Set<EngineId>(['qpdf', 'libreoffice', 'tesseract', 'external-ghostscript'])
const engineDisplayNames: Partial<Record<EngineId, string>> = {
  qpdf: 'qpdf',
  libreoffice: 'LibreOffice',
  tesseract: 'Tesseract OCR',
  'external-ghostscript': 'Ghostscript',
}

export function requiredExternalEngines(tool: Pick<ToolDefinition, 'requiredEngines'>) {
  return tool.requiredEngines.filter((engine) => externalEngineSet.has(engine))
}

export function externalEngineLabel(tool: Pick<ToolDefinition, 'requiredEngines'>) {
  const labels = requiredExternalEngines(tool).map((engine) => engineDisplayNames[engine] || engine)
  return labels.length ? `需要 ${labels.join(' + ')}` : ''
}

export function effectiveImplementationStatus(tool: ToolDefinition): ImplementationStatus {
  if (tool.implementationStatus) return tool.implementationStatus
  if (requiredExternalEngines(tool).length) return 'external-required'
  return tool.experimental ? 'partial' : 'ready'
}

export function effectiveInputMode(tool: ToolDefinition): InputMode {
  if (tool.inputMode) return tool.inputMode
  if (tool.id === 'merge-pdf' || tool.id === 'images-to-pdf') return 'multiple-to-one'
  return tool.supportsBatch ? 'batch' : 'single'
}

export function effectivePreviewMode(tool: ToolDefinition): PreviewMode {
  if (tool.previewMode) return tool.previewMode
  return tool.supportsPreview ? 'placeholder' : 'none'
}

const imageQuality = {
  key: 'quality',
  label: '输出质量',
  kind: 'select' as const,
  defaultValue: 'balanced',
  choices: [
    { label: '高质量', value: 'high' },
    { label: '平衡', value: 'balanced' },
    { label: '小体积', value: 'small' },
  ],
}

const pdfRenderEngine: EngineId[] = ['pdfium']
const pdfEditEngine: EngineId[] = ['pdfcpu']

export const toolRegistry: ToolDefinition[] = [
  {
    id: 'pdf-to-word',
    title: 'PDF转Word',
    description: '默认导出可编辑 DOCX；扫描件可 OCR，视觉保留模式会明确标注不可编辑。',
    category: 'pdf-convert',
    icon: 'FileText',
    accent: '#2087C5',
    acceptedExtensions: ['pdf'],
    outputExtensions: ['docx'],
    supportsBatch: false,
    supportsPreview: true,
    requiredEngines: [],
    builtInEngines: ['pdfium', 'office-writer'],
    optionalEngines: ['tesseract'],
    implementationStatus: 'ready',
    fidelityModes: ['visual', 'editable-text', 'ocr'],
    limitations: ['默认可编辑模式优先输出可修改文本；复杂版式不承诺像素级还原；视觉保留模式会把页面作为图片，文字不可编辑；OCR 需要 Tesseract。'],
    options: [commonPageRange, { key: 'mode', label: '转换模式', kind: 'select', defaultValue: 'editable-docx', choices: [{ label: '可编辑 Word：提取文本层', value: 'editable-docx' }, { label: 'OCR：扫描件识别为可编辑文本', value: 'ocr-docx' }, { label: '视觉保留：每页转图片（不可编辑）', value: 'visual-docx' }] }, { key: 'ocrLanguage', label: 'OCR 语言', kind: 'select', defaultValue: 'chi_sim+eng', choices: [{ label: '中文简体 + English', value: 'chi_sim+eng' }, { label: 'English', value: 'eng' }, { label: '中文简体', value: 'chi_sim' }] }, { key: 'mergeLines', label: '自动合并断行', kind: 'switch', defaultValue: true }, outputDirectoryOption],
  },
  {
    id: 'pdf-to-excel',
    title: 'PDF转Excel',
    description: '提取 PDF 表格或文本行列并导出 XLSX。',
    category: 'pdf-convert',
    icon: 'Table2',
    accent: '#88BF55',
    acceptedExtensions: ['pdf'],
    outputExtensions: ['xlsx', 'csv'],
    supportsBatch: false,
    supportsPreview: true,
    requiredEngines: [],
    builtInEngines: ['pdfium', 'office-writer'],
    optionalEngines: ['tesseract'],
    implementationStatus: 'ready',
    fidelityModes: ['table-extract', 'ocr'],
    limitations: ['复杂或无边框表格可能需要人工校对；扫描表格需要 OCR。'],
    options: [commonPageRange, { key: 'tableMode', label: '提取模式', kind: 'select', defaultValue: 'auto', choices: [{ label: '自动识别表格', value: 'auto' }, { label: '每页一个工作表', value: 'per-page' }, { label: '纯文本行列猜测', value: 'text-grid' }, { label: 'OCR 扫描表格', value: 'ocr-table' }] }, { key: 'ocrLanguage', label: 'OCR 语言', kind: 'select', defaultValue: 'chi_sim+eng', choices: [{ label: '中文简体 + English', value: 'chi_sim+eng' }, { label: 'English', value: 'eng' }, { label: '中文简体', value: 'chi_sim' }] }, outputDirectoryOption],
  },
  {
    id: 'pdf-to-pptx',
    title: 'PDF转PPTX',
    description: '默认重建为可编辑文本框幻灯片；视觉保留模式可按页转图片。',
    category: 'pdf-convert',
    icon: 'Presentation',
    accent: '#EA5545',
    acceptedExtensions: ['pdf'],
    outputExtensions: ['pptx'],
    supportsBatch: false,
    supportsPreview: true,
    requiredEngines: [],
    builtInEngines: pdfRenderEngine,
    fidelityModes: ['editable-text', 'visual', 'ocr'],
    limitations: ['可编辑模式会重建文本框，复杂图形和精确版式可能需要人工调整；视觉保留模式不可编辑文字。'],
    options: [commonPageRange, { key: 'mode', label: '转换模式', kind: 'select', defaultValue: 'editable-pptx', choices: [{ label: '可编辑 PPTX：文本框重建', value: 'editable-pptx' }, { label: '可编辑 + 背景参考', value: 'editable-pptx-with-background' }, { label: 'OCR：扫描件识别为文本框', value: 'ocr-pptx' }, { label: '视觉保留：每页转图片（不可编辑）', value: 'visual-pptx' }] }, { key: 'ratio', label: '幻灯片比例', kind: 'select', defaultValue: 'auto', choices: [{ label: '自动匹配 PDF', value: 'auto' }, { label: '16:9', value: '16-9' }, { label: '4:3', value: '4-3' }] }, { key: 'dpi', label: '渲染 DPI', kind: 'number', defaultValue: 200 }, { key: 'ocrLanguage', label: 'OCR 语言', kind: 'select', defaultValue: 'chi_sim+eng', choices: [{ label: '中文简体 + English', value: 'chi_sim+eng' }, { label: 'English', value: 'eng' }, { label: '中文简体', value: 'chi_sim' }] }, outputDirectoryOption],
  },
  {
    id: 'pdf-to-images',
    title: 'PDF转图片',
    description: '按页导出 PNG/JPG/WebP/TIFF，支持页码范围与 DPI。',
    category: 'pdf-convert',
    icon: 'Images',
    accent: '#F6B33F',
    acceptedExtensions: ['pdf'],
    outputExtensions: ['png', 'jpg', 'webp', 'tiff'],
    supportsBatch: false,
    supportsPreview: true,
    inputMode: 'single',
    requiredEngines: [],
    builtInEngines: pdfRenderEngine,
    options: [commonPageRange, { key: 'format', label: '图片格式', kind: 'select', defaultValue: 'png', choices: [{ label: 'PNG', value: 'png' }, { label: 'JPEG', value: 'jpg' }, { label: 'WebP', value: 'webp' }, { label: 'TIFF', value: 'tiff' }] }, { key: 'dpi', label: '渲染 DPI', kind: 'number', defaultValue: 200 }, outputDirectoryOption],
  },
  {
    id: 'pdf-to-pages',
    title: 'PDF转Pages',
    description: '导出 Pages 可打开的 DOCX 兼容文档。',
    category: 'experimental',
    icon: 'FileType',
    accent: '#1D789E',
    acceptedExtensions: ['pdf'],
    outputExtensions: ['docx'],
    supportsBatch: false,
    supportsPreview: true,
    experimental: true,
    requiredEngines: [],
    builtInEngines: ['pdfium', 'office-writer'],
    optionalEngines: ['tesseract'],
    fidelityModes: ['visual', 'editable-text'],
    limitations: ['输出为 Pages 可打开的 DOCX 兼容文档，不是原生 .pages；默认可编辑文本，视觉保留模式不可编辑文字。'],
    options: [commonPageRange, { key: 'mode', label: '兼容模式', kind: 'select', defaultValue: 'editable-docx', choices: [{ label: '可编辑 DOCX', value: 'editable-docx' }, { label: '视觉保留 DOCX（不可编辑）', value: 'visual-docx' }] }, outputDirectoryOption],
  },
  {
    id: 'pdf-to-numbers',
    title: 'PDF转Numbers',
    description: '生成 Numbers 可打开的 XLSX 兼容表格。',
    category: 'experimental',
    icon: 'BarChart3',
    accent: '#76A84B',
    acceptedExtensions: ['pdf'],
    outputExtensions: ['xlsx'],
    supportsBatch: false,
    supportsPreview: true,
    experimental: true,
    requiredEngines: [],
    builtInEngines: ['pdfium', 'office-writer'],
    fidelityModes: ['table-extract'],
    options: [commonPageRange, { key: 'tableMode', label: '提取模式', kind: 'select', defaultValue: 'auto', choices: [{ label: '自动识别表格', value: 'auto' }, { label: '每页一个工作表', value: 'per-page' }, { label: '纯文本行列猜测', value: 'text-grid' }] }, outputDirectoryOption],
  },
  {
    id: 'pdf-to-keynote',
    title: 'PDF转Keynote',
    description: '生成 Keynote 可打开的可编辑 PPTX 兼容演示稿。',
    category: 'experimental',
    icon: 'MonitorPlay',
    accent: '#C84B3C',
    acceptedExtensions: ['pdf'],
    outputExtensions: ['pptx'],
    supportsBatch: false,
    supportsPreview: true,
    experimental: true,
    requiredEngines: [],
    builtInEngines: pdfRenderEngine,
    fidelityModes: ['editable-text', 'visual', 'ocr'],
    limitations: ['可编辑模式会重建文本框，复杂图形和精确版式可能需要人工调整；视觉保留模式不可编辑文字。'],
    options: [commonPageRange, { key: 'mode', label: '转换模式', kind: 'select', defaultValue: 'editable-pptx', choices: [{ label: '可编辑 PPTX：文本框重建', value: 'editable-pptx' }, { label: '可编辑 + 背景参考', value: 'editable-pptx-with-background' }, { label: 'OCR：扫描件识别为文本框', value: 'ocr-pptx' }, { label: '视觉保留：每页转图片（不可编辑）', value: 'visual-pptx' }] }, { key: 'ratio', label: '幻灯片比例', kind: 'select', defaultValue: 'auto', choices: [{ label: '自动匹配 PDF', value: 'auto' }, { label: '16:9', value: '16-9' }, { label: '4:3', value: '4-3' }] }, { key: 'dpi', label: '渲染 DPI', kind: 'number', defaultValue: 200 }, { key: 'ocrLanguage', label: 'OCR 语言', kind: 'select', defaultValue: 'chi_sim+eng', choices: [{ label: '中文简体 + English', value: 'chi_sim+eng' }, { label: 'English', value: 'eng' }, { label: '中文简体', value: 'chi_sim' }] }, outputDirectoryOption],
  },
  {
    id: 'pdf-to-epub',
    title: 'PDF转EPUB',
    description: '导出文本型或固定布局图片型 EPUB。',
    category: 'pdf-convert',
    icon: 'BookOpen',
    accent: '#DFA33B',
    acceptedExtensions: ['pdf'],
    outputExtensions: ['epub'],
    supportsBatch: false,
    supportsPreview: true,
    requiredEngines: [],
    builtInEngines: ['pdfium', 'epub'],
    implementationStatus: 'ready',
    fidelityModes: ['editable-text', 'visual'],
    limitations: ['基础 EPUB 生成，不重建复杂目录、脚注或原 PDF 的语义结构。'],
    options: [commonPageRange, { key: 'title', label: '书名', kind: 'text', placeholder: '默认使用文件名' }, { key: 'mode', label: 'EPUB模式', kind: 'select', defaultValue: 'text', choices: [{ label: '文本型：可重排', value: 'text' }, { label: '固定布局：页面图片', value: 'image' }] }, outputDirectoryOption],
  },
  {
    id: 'word-to-pdf', title: 'Word转换成PDF', description: 'DOC/DOCX/RTF/ODT 批量转 PDF，需要 LibreOffice。', category: 'to-pdf', icon: 'FileText', accent: '#1E87C9', acceptedExtensions: ['doc', 'docx', 'rtf', 'odt'], outputExtensions: ['pdf'], supportsBatch: true, supportsPreview: false, requiredEngines: ['libreoffice'], options: [outputDirectoryOption],
  },
  {
    id: 'excel-to-pdf', title: 'Excel转换成PDF', description: 'XLS/XLSX/CSV/ODS 转 PDF，需要 LibreOffice。', category: 'to-pdf', icon: 'Table2', accent: '#86C45A', acceptedExtensions: ['xls', 'xlsx', 'csv', 'ods'], outputExtensions: ['pdf'], supportsBatch: true, supportsPreview: false, requiredEngines: ['libreoffice'], options: [outputDirectoryOption],
  },
  {
    id: 'pptx-to-pdf', title: 'PPTX转换成PDF', description: 'PPT/PPTX/ODP 转 PDF，需要 LibreOffice。', category: 'to-pdf', icon: 'Presentation', accent: '#EA5545', acceptedExtensions: ['ppt', 'pptx', 'odp'], outputExtensions: ['pdf'], supportsBatch: true, supportsPreview: false, requiredEngines: ['libreoffice'], options: [outputDirectoryOption],
  },
  {
    id: 'images-to-pdf', title: '图片转换成PDF', description: '多张图片排序合并为 PDF，支持页面尺寸和适配方式。', category: 'to-pdf', icon: 'ImagePlus', accent: '#F5AE41', acceptedExtensions: ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'tiff', 'webp'], outputExtensions: ['pdf'], supportsBatch: true, supportsPreview: true, requiredEngines: [], builtInEngines: ['image'], inputMode: 'multiple-to-one', limitations: ['GIF 动图按首帧处理；多页 TIFF 会按图片处理能力尽量导入。'], options: [{ key: 'merge', label: '合并为单个 PDF', kind: 'switch', defaultValue: true }, { key: 'pageSize', label: '页面大小', kind: 'select', defaultValue: 'auto', choices: [{ label: '按图片尺寸', value: 'auto' }, { label: 'A4', value: 'a4' }, { label: 'Letter', value: 'letter' }] }, { key: 'fit', label: '适配方式', kind: 'select', defaultValue: 'contain', choices: [{ label: '等比适应', value: 'contain' }, { label: '填充裁剪', value: 'cover' }] }, outputDirectoryOption],
  },
  {
    id: 'extract-pdf-images', title: '提取PDF图像', description: '导出 PDF 内嵌图片，可过滤尺寸、页码范围和去重。', category: 'image', icon: 'FileImage', accent: '#DD8328', acceptedExtensions: ['pdf'], outputExtensions: ['png', 'jpg'], supportsBatch: false, supportsPreview: true, inputMode: 'single', requiredEngines: [], builtInEngines: pdfRenderEngine, options: [commonPageRange, { key: 'dedupe', label: '去除重复图片', kind: 'switch', defaultValue: true }, { key: 'minSize', label: '最小边长', kind: 'number', defaultValue: 64 }, { key: 'format', label: '输出格式', kind: 'select', defaultValue: 'png', choices: [{ label: 'PNG', value: 'png' }, { label: 'JPEG', value: 'jpg' }] }, outputDirectoryOption],
  },
  {
    id: 'encrypt-pdf', title: '加密PDF', description: '设置打开密码、所有者密码和权限，需要 qpdf。', category: 'pdf-security', icon: 'LockKeyhole', accent: '#FF8D2D', acceptedExtensions: ['pdf'], outputExtensions: ['pdf'], supportsBatch: false, supportsPreview: false, requiredEngines: ['qpdf'], sensitiveOptionKeys: ['userPassword', 'ownerPassword'], options: [{ key: 'userPassword', label: '打开密码', kind: 'password' }, { key: 'ownerPassword', label: '所有者密码', kind: 'password' }, { key: 'strength', label: '加密强度', kind: 'select', defaultValue: '256', choices: [{ label: 'AES-256 推荐', value: '256' }, { label: 'AES-128 兼容', value: '128' }] }, outputDirectoryOption],
  },
  {
    id: 'decrypt-pdf', title: '解锁PDF', description: '输入密码并导出无加密副本，需要 qpdf。', category: 'pdf-security', icon: 'UnlockKeyhole', accent: '#D77B28', acceptedExtensions: ['pdf'], outputExtensions: ['pdf'], supportsBatch: false, supportsPreview: false, requiredEngines: ['qpdf'], sensitiveOptionKeys: ['password'], options: [{ key: 'password', label: 'PDF密码', kind: 'password' }, outputDirectoryOption],
  },
  {
    id: 'reorder-pdf', title: '重新排列页面', description: '按页码表达式重排 PDF 页面。', category: 'pdf-edit', icon: 'PanelTop', accent: '#A3456D', acceptedExtensions: ['pdf'], outputExtensions: ['pdf'], supportsBatch: false, supportsPreview: true, requiredEngines: [], builtInEngines: pdfEditEngine, options: [{ key: 'order', label: '页面顺序', kind: 'text', placeholder: '例如：3,1,2,4-end' }, outputDirectoryOption],
  },
  {
    id: 'merge-pdf', title: '合并PDF', description: '多个 PDF 按顺序合并为一个 PDF。', category: 'pdf-edit', icon: 'Merge', accent: '#B34B77', acceptedExtensions: ['pdf'], outputExtensions: ['pdf'], supportsBatch: false, supportsPreview: true, requiredEngines: [], builtInEngines: pdfEditEngine, inputMode: 'multiple-to-one', options: [outputDirectoryOption],
  },
  {
    id: 'split-pdf', title: '拆分PDF', description: '按页、范围或每 N 页拆分 PDF。', category: 'pdf-edit', icon: 'Split', accent: '#9E3F6A', acceptedExtensions: ['pdf'], outputExtensions: ['pdf'], supportsBatch: false, supportsPreview: true, requiredEngines: [], builtInEngines: pdfEditEngine, inputMode: 'single', options: [{ key: 'mode', label: '拆分方式', kind: 'select', defaultValue: 'every-page', choices: [{ label: '每页一个 PDF', value: 'every-page' }, { label: '按范围', value: 'ranges' }, { label: '每 N 页', value: 'chunk' }] }, { key: 'ranges', label: '范围', kind: 'text', placeholder: '范围：1-3,4-6；每 N 页：输入数字' }, outputDirectoryOption],
  },
  {
    id: 'delete-pdf-pages', title: '删除PDF页面', description: '删除指定页并导出新 PDF。', category: 'pdf-edit', icon: 'FileX2', accent: '#33965B', acceptedExtensions: ['pdf'], outputExtensions: ['pdf'], supportsBatch: false, supportsPreview: true, requiredEngines: [], builtInEngines: pdfEditEngine, options: [{ ...commonPageRange, key: 'deleteRange', label: '要删除的页面' }, outputDirectoryOption],
  },
  {
    id: 'watermark-pdf', title: '添加水印到PDF', description: '文本/图片水印，支持透明度、角度和页面范围。', category: 'pdf-edit', icon: 'Droplets', accent: '#37A961', acceptedExtensions: ['pdf'], outputExtensions: ['pdf'], supportsBatch: false, supportsPreview: true, requiredEngines: [], builtInEngines: pdfEditEngine, options: [{ key: 'watermarkType', label: '水印类型', kind: 'select', defaultValue: 'text', choices: [{ label: '文本水印', value: 'text' }, { label: '图片水印', value: 'image' }] }, { key: 'text', label: '水印文字', kind: 'text', defaultValue: 'CONFIDENTIAL' }, { key: 'imagePath', label: '图片水印路径', kind: 'text', placeholder: '选择/粘贴 PNG 或 JPG 路径' }, { key: 'opacity', label: '透明度', kind: 'number', defaultValue: 35 }, { key: 'angle', label: '旋转角度', kind: 'number', defaultValue: -35 }, commonPageRange, outputDirectoryOption],
  },
  {
    id: 'rotate-pdf', title: '旋转PDF', description: '全部或指定页旋转 90/180/270 度。', category: 'pdf-edit', icon: 'RotateCw', accent: '#309353', acceptedExtensions: ['pdf'], outputExtensions: ['pdf'], supportsBatch: false, supportsPreview: true, requiredEngines: [], builtInEngines: pdfEditEngine, inputMode: 'single', options: [commonPageRange, { key: 'angle', label: '旋转角度', kind: 'select', defaultValue: '90', choices: [{ label: '90°', value: '90' }, { label: '180°', value: '180' }, { label: '270°', value: '270' }] }, outputDirectoryOption],
  },
  {
    id: 'image-format-convert', title: '图片格式转换', description: '批量转换 JPG/PNG/WebP/BMP/TIFF。', category: 'image', icon: 'RefreshCcw', accent: '#2D5AA0', acceptedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff'], outputExtensions: ['jpg', 'png', 'webp', 'bmp', 'tiff'], supportsBatch: true, supportsPreview: true, requiredEngines: [], builtInEngines: ['image'], options: [{ key: 'format', label: '目标格式', kind: 'select', defaultValue: 'png', choices: [{ label: 'PNG', value: 'png' }, { label: 'JPEG', value: 'jpg' }, { label: 'WebP', value: 'webp' }, { label: 'BMP', value: 'bmp' }, { label: 'TIFF', value: 'tiff' }] }, imageQuality, { key: 'resize', label: '最大边尺寸', kind: 'number', placeholder: '留空为不调整' }, outputDirectoryOption],
  },
  {
    id: 'pdf-page-numbers', title: 'PDF页码', description: '添加页眉/页脚页码，支持第 1 页 / 1 of N。', category: 'pdf-edit', icon: 'ListOrdered', accent: '#2B57A0', acceptedExtensions: ['pdf'], outputExtensions: ['pdf'], supportsBatch: false, supportsPreview: true, requiredEngines: [], builtInEngines: pdfEditEngine, options: [commonPageRange, { key: 'format', label: '页码格式', kind: 'select', defaultValue: 'page-n-of-total', choices: [{ label: '1', value: 'n' }, { label: 'Page 1', value: 'page-n' }, { label: '第 1 页', value: 'cn-n' }, { label: '1 / N', value: 'page-n-of-total' }] }, { key: 'startAt', label: '起始页码', kind: 'number', defaultValue: 1 }, { key: 'position', label: '位置', kind: 'select', defaultValue: 'bottom-center', choices: [{ label: '页脚居中', value: 'bottom-center' }, { label: '页脚右侧', value: 'bottom-right' }, { label: '页眉右侧', value: 'top-right' }] }, outputDirectoryOption],
  },
  {
    id: 'compress-pdf', title: '压缩PDF', description: '内置安全重写；检测到 Ghostscript 可做高级压缩，qpdf 可线性化。', category: 'pdf-edit', icon: 'Archive', accent: '#294E92', acceptedExtensions: ['pdf'], outputExtensions: ['pdf'], supportsBatch: false, supportsPreview: false, requiredEngines: [], builtInEngines: pdfEditEngine, optionalEngines: ['qpdf', 'external-ghostscript'], limitations: ['强压缩会调用 Ghostscript 并可能轻微改变图片质量；未配置 Ghostscript 时会降级为内置重写或 qpdf 优化。'], options: [{ key: 'level', label: '压缩级别', kind: 'select', defaultValue: 'balanced', choices: [{ label: '保真优先', value: 'light' }, { label: '推荐：Ghostscript /ebook', value: 'balanced' }, { label: '体积优先：Ghostscript /screen', value: 'strong' }] }, { key: 'linearize', label: '优化网络浏览（有 qpdf 时）', kind: 'switch', defaultValue: true }, outputDirectoryOption],
  },
]

export const popularToolIds = ['pdf-to-word', 'pdf-to-images', 'word-to-pdf', 'images-to-pdf', 'merge-pdf', 'split-pdf', 'compress-pdf', 'watermark-pdf']

export function getToolById(id: string) {
  return toolRegistry.find((tool) => tool.id === id)
}

export function toolsForCategory(category: ToolCategoryId) {
  if (category === 'popular') return toolRegistry.filter((tool) => popularToolIds.includes(tool.id))
  return toolRegistry.filter((tool) => tool.category === category)
}
