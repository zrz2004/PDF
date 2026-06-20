export function basename(path: string) {
  return path.split(/[\\/]/).pop() ?? path
}

export function dirname(path: string) {
  const idx = Math.max(path.lastIndexOf('\\'), path.lastIndexOf('/'))
  return idx >= 0 ? path.slice(0, idx) : ''
}
