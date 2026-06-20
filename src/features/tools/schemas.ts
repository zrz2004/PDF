export type OptionKind = 'text' | 'password' | 'number' | 'select' | 'switch' | 'page-range' | 'directory' | 'color'

export type ToolOption = {
  key: string
  label: string
  kind: OptionKind
  placeholder?: string
  help?: string
  defaultValue?: string | number | boolean
  choices?: Array<{ label: string; value: string }>
}

export type ToolOptionSchema = ToolOption[]

export const commonPageRange: ToolOption = {
  key: 'pageRange',
  label: '页面范围',
  kind: 'page-range',
  placeholder: '例如：1,3,5-8；留空为全部页面',
}

export const outputDirectoryOption: ToolOption = {
  key: 'outputDirectory',
  label: '输出文件夹',
  kind: 'directory',
  placeholder: '默认输出到原文件所在文件夹',
}
