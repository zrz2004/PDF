export const extensionOf = (name: string) => {
  const idx = name.lastIndexOf('.')
  return idx >= 0 ? name.slice(idx + 1).toLowerCase() : ''
}

export function matchesExtensions(name: string, extensions: string[]) {
  const ext = extensionOf(name)
  return extensions.includes(ext)
}
