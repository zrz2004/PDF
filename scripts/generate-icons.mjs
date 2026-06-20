import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import toIco from 'to-ico'

const root = path.resolve(import.meta.dirname, '..')
const svgPath = path.join(root, 'src', 'assets', 'localpdf-logo.svg')
const buildDir = path.join(root, 'build')
const publicDir = path.join(root, 'public')
await fs.mkdir(buildDir, { recursive: true })
await fs.mkdir(publicDir, { recursive: true })

const svg = await fs.readFile(svgPath)
await fs.writeFile(path.join(publicDir, 'favicon.svg'), svg)

const icoSizes = [16, 24, 32, 48, 64, 128, 256]
const pngs = []
for (const size of icoSizes) {
  const buffer = await sharp(svg).resize(size, size).png().toBuffer()
  pngs.push(buffer)
}
// macOS .icns requires ≥512px; generate 1024×1024 PNG for icon.png (not included in ICO)
const iconPng = await sharp(svg).resize(1024, 1024).png().toBuffer()
await fs.writeFile(path.join(buildDir, 'icon.png'), iconPng)
await fs.writeFile(path.join(publicDir, 'icon.png'), iconPng)
const ico = await toIco(pngs)
await fs.writeFile(path.join(buildDir, 'icon.ico'), ico)
await fs.writeFile(path.join(publicDir, 'favicon.ico'), ico)
console.log('Generated build/icon.ico, build/icon.png, public/icon.png, public/favicon.svg, public/favicon.ico')
