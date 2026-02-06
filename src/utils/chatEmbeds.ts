export type ChatEmbedType = 'youtube' | 'vimeo' | 'gif' | 'image' | 'video' | 'link'

export type ChatEmbed = {
  url: string
  type: ChatEmbedType
  embedUrl: string
  provider?: string
  displayUrl?: string
}

export const URL_REGEX = /https?:\/\/[^\s]+/gi

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp']
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov']

const normalizeUrl = (value: string) => value.trim().toLowerCase()

const extractYoutubeId = (url: URL) => {
  if (url.hostname.includes('youtu.be')) {
    return url.pathname.split('/').filter(Boolean)[0]
  }
  if (url.hostname.includes('youtube.com')) {
    const v = url.searchParams.get('v')
    if (v) return v
    const parts = url.pathname.split('/').filter(Boolean)
    if (parts[0] === 'shorts' && parts[1]) return parts[1]
  }
  return null
}

const extractVimeoId = (url: URL) => {
  if (!url.hostname.includes('vimeo.com')) return null
  const parts = url.pathname.split('/').filter(Boolean)
  return parts[0] ?? null
}

const extractGiphyId = (url: URL) => {
  if (!url.hostname.includes('giphy.com')) return null
  const parts = url.pathname.split('/').filter(Boolean)
  const last = parts[parts.length - 1]
  if (!last) return null
  const id = last.split('-').pop()
  return id || null
}

const isFileExtension = (path: string, extensions: string[]) =>
  extensions.some((ext) => path.endsWith(ext))

export function extractUrls(text: string): string[] {
  const matches = text.match(URL_REGEX)
  if (!matches) return []
  return matches
}

export function splitTextByUrls(text: string): Array<{ type: 'text' | 'url'; value: string }> {
  const parts: Array<{ type: 'text' | 'url'; value: string }> = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  const regex = new RegExp(URL_REGEX.source, 'gi')
  while ((match = regex.exec(text)) !== null) {
    const start = match.index
    const end = start + match[0].length
    if (start > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, start) })
    }
    parts.push({ type: 'url', value: match[0] })
    lastIndex = end
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) })
  }

  return parts
}

export function buildChatEmbeds(text: string, maxEmbeds = 3): ChatEmbed[] {
  const urls = extractUrls(text)
  if (urls.length === 0) return []

  const embeds: ChatEmbed[] = []
  const seen = new Set<string>()

  for (const rawUrl of urls) {
    if (embeds.length >= maxEmbeds) break
    const normalized = normalizeUrl(rawUrl)
    if (seen.has(normalized)) continue
    seen.add(normalized)

    let parsed: URL
    try {
      parsed = new URL(rawUrl)
    } catch {
      continue
    }

    const host = parsed.hostname.replace('www.', '')
    const path = parsed.pathname.toLowerCase()

    const youtubeId = extractYoutubeId(parsed)
    if (youtubeId) {
      embeds.push({
        url: rawUrl,
        type: 'youtube',
        embedUrl: `https://www.youtube-nocookie.com/embed/${youtubeId}`,
        provider: 'YouTube',
        displayUrl: host,
      })
      continue
    }

    const vimeoId = extractVimeoId(parsed)
    if (vimeoId) {
      embeds.push({
        url: rawUrl,
        type: 'vimeo',
        embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
        provider: 'Vimeo',
        displayUrl: host,
      })
      continue
    }

    const giphyId = extractGiphyId(parsed)
    if (giphyId) {
      embeds.push({
        url: rawUrl,
        type: 'gif',
        embedUrl: `https://media.giphy.com/media/${giphyId}/giphy.gif`,
        provider: 'Giphy',
        displayUrl: host,
      })
      continue
    }

    if (path.endsWith('.gif')) {
      embeds.push({
        url: rawUrl,
        type: 'gif',
        embedUrl: rawUrl,
        provider: 'GIF',
        displayUrl: host,
      })
      continue
    }

    if (path.endsWith('.gifv')) {
      embeds.push({
        url: rawUrl,
        type: 'video',
        embedUrl: rawUrl.replace(/\.gifv$/i, '.mp4'),
        provider: 'Video',
        displayUrl: host,
      })
      continue
    }

    if (isFileExtension(path, VIDEO_EXTENSIONS)) {
      embeds.push({
        url: rawUrl,
        type: 'video',
        embedUrl: rawUrl,
        provider: 'Video',
        displayUrl: host,
      })
      continue
    }

    if (isFileExtension(path, IMAGE_EXTENSIONS)) {
      embeds.push({
        url: rawUrl,
        type: 'image',
        embedUrl: rawUrl,
        provider: 'Image',
        displayUrl: host,
      })
      continue
    }

    embeds.push({
      url: rawUrl,
      type: 'link',
      embedUrl: rawUrl,
      provider: host,
      displayUrl: host + parsed.pathname,
    })
  }

  return embeds
}

