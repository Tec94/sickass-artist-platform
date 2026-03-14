import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const INPUT_ROOT = path.resolve('public', 'merch')
const OUTPUT_ROOT = path.resolve('public', 'merch-normalized')
const TARGET_WIDTH = 1200
const TARGET_HEIGHT = 1500
const MATTE_HEX = '#10151d'
const SUPPORTED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif'])

const shouldClean = process.argv.includes('--clean')

if (!fs.existsSync(INPUT_ROOT)) {
  console.error(`Input directory not found: ${INPUT_ROOT}`)
  process.exit(1)
}

if (shouldClean && fs.existsSync(OUTPUT_ROOT)) {
  fs.rmSync(OUTPUT_ROOT, { recursive: true, force: true })
}

const files = []

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      walk(fullPath)
      continue
    }

    const extension = path.extname(entry.name).toLowerCase()
    if (SUPPORTED_EXTENSIONS.has(extension)) {
      files.push(fullPath)
    }
  }
}

walk(INPUT_ROOT)

if (files.length === 0) {
  console.warn('No merch images found to normalize.')
  process.exit(0)
}

let processed = 0

for (const sourcePath of files) {
  const relativePath = path.relative(INPUT_ROOT, sourcePath)
  const outputRelativePath = relativePath.replace(/\.[^.]+$/, '.webp')
  const outputPath = path.join(OUTPUT_ROOT, outputRelativePath)
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })

  await sharp(sourcePath)
    .rotate()
    .resize(TARGET_WIDTH, TARGET_HEIGHT, {
      fit: 'contain',
      background: MATTE_HEX,
      position: 'centre',
    })
    .webp({ quality: 90 })
    .toFile(outputPath)

  processed += 1
}

console.log(`Normalized ${processed} merch images to ${OUTPUT_ROOT}`)
