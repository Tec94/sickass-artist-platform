import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const SRC_ROOT = 'src'
const LEGACY_DIR = join('src', 'components', 'Dashboard', 'legacy')

const collectSourceFiles = (dir: string): string[] => {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry)
    const stats = statSync(fullPath)
    if (stats.isDirectory()) {
      if (fullPath === LEGACY_DIR) return []
      return collectSourceFiles(fullPath)
    }
    if (!/\.(ts|tsx|css)$/.test(fullPath)) return []
    return [fullPath]
  })
}

describe('dashboard legacy import guard', () => {
  it('does not import deprecated dashboard hero assets in active source files', () => {
    const files = collectSourceFiles(SRC_ROOT).filter((file) => !file.endsWith('dashboard.legacy.guard.test.ts'))
    const offenders: string[] = []

    for (const file of files) {
      const source = readFileSync(file, 'utf8')
      if (
        source.includes('/Dashboard/legacy/') ||
        source.includes('/Dashboard/HeroSection') ||
        source.includes('/Dashboard/dashboard.css') ||
        source.includes('Dashboard\\legacy\\')
      ) {
        offenders.push(relative(process.cwd(), file))
      }
    }

    expect(offenders).toEqual([])
  })
})
