import type { MutationCtx, QueryCtx } from '../_generated/server'
import type { Doc } from '../_generated/dataModel'

type AnyCtx = QueryCtx | MutationCtx

export const AUTH_PROVIDER_AUTH0 = 'auth0'

export type IdentityClaims = {
  subject: string
  email: string
  name: string
  nickname: string
  picture: string
}

export const normalizeAuthSubject = (subject: string): string => subject.trim()

export const buildUserSearchText = (input: {
  email?: string | null
  username?: string | null
  displayName?: string | null
}) =>
  [input.username, input.displayName, input.email]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .join(' ')
    .toLowerCase()

export const getIdentityClaims = async (ctx: AnyCtx): Promise<IdentityClaims | null> => {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) return null

  const unsafeIdentity = identity as Record<string, unknown>
  return {
    subject: normalizeAuthSubject(identity.subject),
    email: typeof unsafeIdentity.email === 'string' ? unsafeIdentity.email : '',
    name: typeof unsafeIdentity.name === 'string' ? unsafeIdentity.name : '',
    nickname: typeof unsafeIdentity.nickname === 'string' ? unsafeIdentity.nickname : '',
    picture: typeof unsafeIdentity.picture === 'string' ? unsafeIdentity.picture : '',
  }
}

export const findUserByAuthSubject = async (
  ctx: AnyCtx,
  authSubject: string,
): Promise<Doc<'users'> | null> => {
  const normalizedSubject = normalizeAuthSubject(authSubject)

  return await ctx.db
    .query('users')
    .withIndex('by_authSubject', (q) => q.eq('authSubject', normalizedSubject))
    .first()
}

export const findUserByCurrentIdentity = async (ctx: AnyCtx): Promise<Doc<'users'> | null> => {
  const claims = await getIdentityClaims(ctx)
  if (!claims) return null
  return await findUserByAuthSubject(ctx, claims.subject)
}
