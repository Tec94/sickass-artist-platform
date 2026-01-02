import { useState, useCallback } from 'react'

export function useSearchModal() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const openSearch = useCallback(() => {
    setIsSearchOpen(true)
  }, [])

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false)
  }, [])

  const toggleSearch = useCallback(() => {
    setIsSearchOpen((prev) => !prev)
  }, [])

  return {
    isSearchOpen,
    openSearch,
    closeSearch,
    toggleSearch,
  }
}
