'use node'

import { internalAction } from './_generated/server'
import { internal } from './_generated/api'

declare const process: { env: Record<string, string | undefined> }

type SyncResult = {
  success?: boolean
  error?: string
  newPosts: number
  updated: number
  total?: number
}

/**
 * Internal action called by cron job
 * Fetches latest posts from Instagram Business Account and stores them
 */
export const syncInstagramPostsInternal = internalAction({
  args: {},
  handler: async (ctx): Promise<SyncResult> => {
    try {
      const igAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID
      const igAccessToken = process.env.INSTAGRAM_ACCESS_TOKEN

      if (!igAccountId || !igAccessToken) {
        console.error('Missing Instagram credentials')
        return { error: 'Missing Instagram credentials', newPosts: 0, updated: 0 }
      }

      const response = await fetch(
        `https://graph.instagram.com/${igAccountId}/media?fields=id,media_type,media_url,thumbnail_url,caption,timestamp,like_count,comments_count&access_token=${igAccessToken}`
      )

      if (!response.ok) {
        console.error(`Instagram API error: ${response.statusText}`)
        return { error: `Instagram API: ${response.statusText}`, newPosts: 0, updated: 0 }
      }

      const data = (await response.json()) as {
        data?: Array<{
          id: string
          media_type?: string
          media_url?: string
          thumbnail_url?: string
          caption?: string
          timestamp: string
          like_count?: number
          comments_count?: number
          views?: number
        }>
      }

      const posts = data.data || []

      if (posts.length === 0) {
        return { success: true, newPosts: 0, updated: 0, total: 0 }
      }

      return await ctx.runMutation(internal.instagram.upsertInstagramPostsInternal, {
        igAccountId,
        posts,
      })
    } catch (error) {
      console.error('Instagram sync error:', error)
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        newPosts: 0,
        updated: 0,
      }
    }
  },
})
