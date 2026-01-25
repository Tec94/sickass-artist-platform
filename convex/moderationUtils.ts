import type { QueryCtx } from './_generated/server'
import type { Doc } from './_generated/dataModel'

export interface ModerationPolicyConfig {
  warningWindowDays: number
  warningThreshold: number
  timeoutDurationsMs: number[]
  banThreshold: number
  denylist: string[]
  allowlist: string[]
}

export const DEFAULT_MODERATION_POLICY: ModerationPolicyConfig = {
  warningWindowDays: 30,
  warningThreshold: 3,
  timeoutDurationsMs: [10 * 60 * 1000, 60 * 60 * 1000, 24 * 60 * 60 * 1000, 7 * 24 * 60 * 60 * 1000],
  banThreshold: 2,
  denylist: [],
  allowlist: ['damn', 'hell', 'crap', 'shit'],
}

const normalizeTerm = (value: string) => value.toLowerCase().trim()

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export const getModerationPolicy = async (ctx: QueryCtx): Promise<ModerationPolicyConfig> => {
  const policy = await ctx.db.query('moderationPolicy').first()
  if (!policy) {
    return DEFAULT_MODERATION_POLICY
  }

  return {
    warningWindowDays: policy.warningWindowDays,
    warningThreshold: policy.warningThreshold,
    timeoutDurationsMs: policy.timeoutDurationsMs,
    banThreshold: policy.banThreshold,
    denylist: policy.denylist,
    allowlist: policy.allowlist,
  }
}

export const findBlockedTerm = (
  text: string,
  policy: ModerationPolicyConfig
): string | null => {
  const normalized = text.toLowerCase()
  const allowlist = new Set(policy.allowlist.map(normalizeTerm))
  const denylist = policy.denylist.map(normalizeTerm).filter(Boolean)
  const tokens = new Set(normalized.split(/[^a-z0-9]+/).filter(Boolean))

  for (const term of denylist) {
    if (!term || allowlist.has(term)) {
      continue
    }

    if (term.includes(' ')) {
      const pattern = new RegExp(`\\b${escapeRegExp(term)}\\b`, 'i')
      if (pattern.test(normalized)) {
        return term
      }
      continue
    }

    if (tokens.has(term)) {
      return term
    }
  }

  return null
}

export const isUserTimedOut = (status: Doc<'userModerationStatus'> | null): boolean => {
  if (!status?.timeoutUntil) return false
  return status.timeoutUntil > Date.now()
}

export const isUserBanned = (status: Doc<'userModerationStatus'> | null): boolean => {
  return status?.isBanned ?? false
}
