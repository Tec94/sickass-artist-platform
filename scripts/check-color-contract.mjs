import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const HEX_RE = /#[0-9A-Fa-f]{3,8}/g
// Allow tokenized arbitrary values like bg-[var(--color-...)] and non-color size utilities (text-[11px]).
const ARBITRARY_COLOR_RE =
  /(?:bg|text|border|from|to)-\[(?!var\(--)(?!\d*\.?\d+(?:px|rem|em|%)\b)[^\]]+\]/g
const BASELINE_PATH = resolve(process.cwd(), 'scripts', 'color-contract-baseline.json')

const loadBaseline = () => {
  const raw = readFileSync(BASELINE_PATH, 'utf8')
  return JSON.parse(raw)
}

const countMatches = (filePath) => {
  const source = readFileSync(resolve(process.cwd(), filePath), 'utf8')
  return {
    hex: (source.match(HEX_RE) ?? []).length,
    arbitrary: (source.match(ARBITRARY_COLOR_RE) ?? []).length,
  }
}

const writeBaseline = (baseline) => {
  writeFileSync(BASELINE_PATH, `${JSON.stringify(baseline, null, 2)}\n`, 'utf8')
}

const updateBaseline = (baseline) => {
  const next = { ...baseline, limits: {} }
  for (const filePath of baseline.trackedFiles) {
    next.limits[filePath] = countMatches(filePath)
  }
  writeBaseline(next)
  console.log(`[color-contract] baseline updated for ${baseline.trackedFiles.length} files`)
}

const verifyBaseline = (baseline) => {
  const violations = []

  for (const filePath of baseline.trackedFiles) {
    const current = countMatches(filePath)
    const limit = baseline.limits[filePath]

    if (!limit) {
      violations.push(`${filePath}: missing baseline limits`)
      continue
    }

    if (current.hex > limit.hex) {
      violations.push(`${filePath}: hex colors ${current.hex} > ${limit.hex}`)
    }

    if (current.arbitrary > limit.arbitrary) {
      violations.push(`${filePath}: arbitrary color classes ${current.arbitrary} > ${limit.arbitrary}`)
    }
  }

  if (violations.length > 0) {
    console.error('[color-contract] violations detected:')
    for (const violation of violations) {
      console.error(`  - ${violation}`)
    }
    process.exit(1)
  }

  console.log(`[color-contract] OK for ${baseline.trackedFiles.length} files`)
}

const baseline = loadBaseline()

if (process.argv.includes('--update-baseline')) {
  updateBaseline(baseline)
} else {
  verifyBaseline(baseline)
}
