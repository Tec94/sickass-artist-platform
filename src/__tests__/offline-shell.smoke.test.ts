import '@testing-library/jest-dom/vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const offlineHtml = readFileSync(resolve(process.cwd(), 'public/offline.html'), 'utf8')
const serviceWorkerSource = readFileSync(resolve(process.cwd(), 'public/sw.js'), 'utf8')

describe('offline shell diagnostics', () => {
  it('defines the status board anchors and 5 second refresh cadence', () => {
    expect(offlineHtml).toContain('const CHECK_INTERVAL_MS = 5000')
    expect(offlineHtml).toContain('id="status-matrix"')
    expect(offlineHtml).toContain('id="last-checked-label"')
    expect(offlineHtml).toContain('id="countdown-label"')
    expect(offlineHtml).toContain('data-refresh-interval="5000"')
    expect(offlineHtml).toContain("dom.statusMatrix.style.setProperty('--status-row-count', rowCount)")
  })

  it('ships inline operational and unavailable icons with explicit target configs', () => {
    expect(offlineHtml).toContain('const PAGE_TARGETS = buildPageTargets(REQUESTED_PATH)')
    expect(offlineHtml).toContain('const SERVICE_TARGETS = [')
    expect(offlineHtml).toContain('const CHECK_ICON = `')
    expect(offlineHtml).toContain('const X_ICON = `')
  })
})

describe('service worker cache manifest', () => {
  it('caches the offline shell without the retired hero assets', () => {
    expect(serviceWorkerSource).toContain("const CACHE_NAME = 'sickass-v5'")
    expect(serviceWorkerSource).toContain('const URLS_TO_CACHE = [OFFLINE_URL]')
    expect(serviceWorkerSource).not.toContain('/dashboard/hero-bg-4k.webp')
    expect(serviceWorkerSource).not.toContain('/dashboard/hero-grain.webp')
    expect(serviceWorkerSource).not.toContain('/dashboard/hero-vignette.webp')
  })
})
