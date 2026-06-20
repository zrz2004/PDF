export type ToolCategoryId = 'popular' | 'pdf-convert' | 'to-pdf' | 'pdf-edit' | 'pdf-security' | 'image' | 'experimental'

export const toolCategories: Array<{ id: ToolCategoryId; label: string; description: string }> = [
  { id: 'popular', label: '常用', description: '最高频的转换和 PDF 操作' },
  { id: 'pdf-convert', label: 'PDF 转换', description: 'PDF 输出为 Office、图片、EPUB' },
  { id: 'to-pdf', label: '转为 PDF', description: 'Office、图片转 PDF' },
  { id: 'pdf-edit', label: 'PDF 编辑', description: '页面、合并、拆分、水印、页码' },
  { id: 'pdf-security', label: 'PDF 安全', description: '加密、解密和权限控制' },
  { id: 'image', label: '图片工具', description: '图片格式转换和 PDF 图像处理' },
  { id: 'experimental', label: '实验功能', description: '高保真转换与兼容格式输出' },
]
