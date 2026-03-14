import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router-dom'
import { useMutation, useQuery } from 'convex/react'
import { Forum } from '../pages/Forum'

vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
}))

vi.mock('../hooks/useAnalytics', () => ({
  useAnalytics: vi.fn(),
}))

vi.mock('../hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

vi.mock('../hooks/useReducedMotionPreference', () => ({
  useReducedMotionPreference: () => ({ prefersReducedMotion: true, motionClassName: 'motion-reduce' }),
}))

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { _id: 'user-1', role: 'fan' },
  }),
}))

vi.mock('../hooks/useForumCategories', () => ({
  useForumCategories: () => ({
    categories: [
      {
        _id: 'cat-1',
        name: 'General',
        slug: 'general',
        description: 'General discussion',
        icon: 'solar:chat-round-linear',
        color: '#fff',
        order: 1,
        requiredRole: null,
        requiredFanTier: null,
        threadCount: 1,
        lastThreadAt: Date.now(),
        createdAt: Date.now(),
      },
    ],
  }),
}))

vi.mock('../hooks/useForumThreads', () => ({
  useForumThreads: () => ({
    threads: [
      {
        _id: 'thread-1',
        title: 'Forum redesign checkpoint',
        content: 'Need feedback on the redesigned feed composition.',
        authorId: 'user-2',
        authorDisplayName: 'Design Captain',
        authorAvatar: '',
        authorTier: 'gold',
        authorRole: null,
        categoryId: 'cat-1',
        tags: ['layout', 'forum'],
        upVoteCount: 8,
        downVoteCount: 1,
        netVoteCount: 7,
        userVote: null,
        replyCount: 12,
        viewCount: 321,
        lastReplyAt: Date.now(),
        createdAt: Date.now() - 1000,
        updatedAt: Date.now(),
        isDeleted: false,
        deletedAt: null,
      },
    ],
    isLoading: false,
    hasMore: false,
    fetchMore: vi.fn(),
    refresh: vi.fn(),
  }),
}))

vi.mock('../hooks/useForumThreadDetail', () => ({
  useForumThreadDetail: () => ({
    thread: null,
    replies: [],
    isLoading: false,
  }),
}))

vi.mock('../hooks/useCreateReply', () => ({
  useCreateReply: () => ({
    handleCreateReply: vi.fn(),
  }),
}))

describe('forum redesign composition', () => {
  const toggleBookmarkMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    const mutationFns = [vi.fn(), vi.fn(), vi.fn(), toggleBookmarkMock]
    let mutationIndex = 0

    vi.mocked(useMutation).mockImplementation(() => {
      const fn = mutationFns[mutationIndex % mutationFns.length]
      mutationIndex += 1
      return fn as never
    })

    vi.mocked(useQuery).mockImplementation((...params) => {
      const args = params[1]
      if (args === 'skip') return undefined as never
      if (typeof args === 'object' && args && 'range' in (args as Record<string, unknown>)) {
        return {
          range: '7d',
          topUsers: [
            {
              userId: 'user-11',
              displayName: 'Signal Rider',
              avatar: '',
              threadCount: 4,
              replyCount: 10,
              score: 88,
            },
          ],
          activeTopics: [
            {
              categoryId: 'topic-1',
              name: 'feedback',
              threadCount: 14,
            },
          ],
          hotThreads: [
            {
              _id: 'thread-1',
              title: 'Forum redesign checkpoint',
              authorDisplayName: 'Design Captain',
              categoryId: 'cat-1',
              categoryName: 'General',
              replyCount: 12,
              viewCount: 321,
              netVoteCount: 7,
              createdAt: Date.now(),
            },
          ],
          stats: {
            totalThreads: 1,
            totalReplies: 12,
            uniqueAuthors: 1,
          },
          generatedAt: Date.now(),
        } as never
      }

      return [] as never
    })
  })

  it('renders feed + insights rail and toggles bookmarks through mutation', async () => {
    render(
      <MemoryRouter>
        <Forum />
      </MemoryRouter>,
    )

    expect(screen.getByText('forum.title')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('forum.searchThreads')).toBeInTheDocument()
    expect(screen.getByText('Signal Rider')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /forum.replyAction/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'forum.addBookmark' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'forum.addBookmark' }))

    await waitFor(() => {
      expect(toggleBookmarkMock).toHaveBeenCalledWith({ threadId: 'thread-1' })
    })
  })
})
