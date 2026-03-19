export type AuthEntryMode = 'signin' | 'signup'

export const AUTH_ENTRY_PATH = '/auth'
export const DEFAULT_AUTH_RETURN_PATH = '/community'

export const sanitizeReturnTo = (returnToRaw: string | null | undefined): string => {
  if (!returnToRaw) return DEFAULT_AUTH_RETURN_PATH

  let value = returnToRaw
  try {
    value = decodeURIComponent(returnToRaw)
  } catch {
    value = returnToRaw
  }

  const trimmed = value.trim()
  if (!trimmed.startsWith('/')) return DEFAULT_AUTH_RETURN_PATH
  if (trimmed.startsWith('//')) return DEFAULT_AUTH_RETURN_PATH
  if (trimmed.includes('://')) return DEFAULT_AUTH_RETURN_PATH
  if (/[\r\n]/.test(trimmed)) return DEFAULT_AUTH_RETURN_PATH

  return trimmed
}

export const sanitizeAuthMode = (modeRaw: string | null | undefined): AuthEntryMode =>
  modeRaw === 'signup' ? 'signup' : 'signin'

export const buildAuthEntryHref = (
  mode: AuthEntryMode,
  returnToRaw?: string | null,
) => {
  const params = new URLSearchParams({
    mode,
    returnTo: sanitizeReturnTo(returnToRaw),
  })

  return `${AUTH_ENTRY_PATH}?${params.toString()}`
}
