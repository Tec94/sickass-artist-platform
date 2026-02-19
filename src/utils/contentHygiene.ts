const ZERO_WIDTH_RE = /[\u200B-\u200D\uFEFF]/g
const WHITESPACE_RE = /\s+/g
const REPEATED_SYMBOL_RE = /^([^\w]*)$/

export const normalizeDisplayText = (value: string | null | undefined): string => {
  if (!value) return ''
  return value.replace(ZERO_WIDTH_RE, '').replace(WHITESPACE_RE, ' ').trim()
}

export const isLowQualityDisplayText = (value: string): boolean => {
  if (value.length < 3) return true
  if (REPEATED_SYMBOL_RE.test(value)) return true

  const alphaNumeric = value.replace(/[^a-z0-9]/gi, '')
  if (alphaNumeric.length < 3) return true

  const uniqueChars = new Set(alphaNumeric.toLowerCase()).size
  return uniqueChars < 2
}

export type SanitizedDisplayText = {
  value: string
  usedFallback: boolean
}

export const sanitizeDisplayText = (
  input: string | null | undefined,
  fallback: string,
): SanitizedDisplayText => {
  const normalized = normalizeDisplayText(input)
  if (!normalized || isLowQualityDisplayText(normalized)) {
    return { value: fallback, usedFallback: true }
  }
  return { value: normalized, usedFallback: false }
}
