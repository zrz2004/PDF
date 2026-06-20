export function parsePageRange(input: string, totalPages?: number): number[] | null {
  const value = input.trim()
  if (!value) return []
  const pages = new Set<number>()
  for (const part of value.split(',')) {
    const token = part.trim()
    if (!token) return null
    const range = token.match(/^(\d+)-(\d+|end)$/i)
    if (range) {
      const start = Number(range[1])
      const end = range[2].toLowerCase() === 'end' ? totalPages : Number(range[2])
      if (!end || start < 1 || end < start) return null
      for (let page = start; page <= end; page++) pages.add(page)
      continue
    }
    const single = Number(token)
    if (!Number.isInteger(single) || single < 1) return null
    pages.add(single)
  }
  return [...pages].sort((a, b) => a - b)
}
