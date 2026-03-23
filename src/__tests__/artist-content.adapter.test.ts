import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { adaptArtistContentPayload } from '../features/artistContent'

const payload = JSON.parse(
  readFileSync('public/data/artist-scraped-data.json', 'utf8'),
) as unknown

describe('artist content adapter', () => {
  it('normalizes the ROA payload into shared content selectors', () => {
    const content = adaptArtistContentPayload(payload, {
      source: '/data/artist-scraped-data.json',
      now: Date.parse('2026-03-01T00:00:00.000Z'),
    })

    expect(content.artistName).toBe('ROA')
    expect(content.instagram.posts).toHaveLength(5)
    expect(content.spotify.popularTracks).toHaveLength(5)
    expect(content.spotify.latestRelease?.name).toBe('WO OH OH')
    expect(content.spotify.relatedArtists[0]?.name).toBe('Luar La L')
    expect(content.freshness.ageDays).toBeGreaterThanOrEqual(0)
    expect(content.source).toBe('/data/artist-scraped-data.json')
  })

  it('returns a safe fallback when payload is missing', () => {
    const content = adaptArtistContentPayload(null)

    expect(content.isFallback).toBe(true)
    expect(content.artistName).toBe('ROA')
    expect(content.spotify.popularTracks).toHaveLength(0)
    expect(content.instagram.posts).toHaveLength(0)
    expect(content.freshness.isStale).toBe(true)
  })
})
