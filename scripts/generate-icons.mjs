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

const sizes = [16, 24, 32, 48, 64, 128, 256]
const pngs = []
for (const size of sizes) {
  const buffer = await sharp(svg).resize(size, size).png().toBuffer()
  pngs.push(buffer)
  if (size === 256) {
    await fs.writeFile(path.join(buildDir, 'icon.png'), buffer)
    await fs.writeFile(path.join(publicDir, 'icon.png'), buffer)
  }
}
const ico = await toIco(pngs)
await fs.writeFile(path.join(buildDir, 'icon.ico'), ico)
await fs.writeFile(path.join(publicDir, 'favicon.ico'), ico)
console.log('Generated build/icon.ico, build/icon.png, public/icon.png, public/favicon.svg, public/favicon.ico')
