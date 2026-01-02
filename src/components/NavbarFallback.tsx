import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { UserHeader } from './Auth/UserHeader'
import { SignInButtons } from './Auth/SignInButtons'
import { GearDisplay } from './GearNavigation/GearDisplay'
import { SearchModal } from './Search/SearchModal'
import { SearchTrigger } from './Search/SearchTrigger'
import { useSearchModal } from '../hooks/useSearchModal'

export const NavbarFallback: React.FC = () => {
  const { isSignedIn } = useAuth()
  const { isSearchOpen, openSearch, closeSearch } = useSearchModal()

  return (
    <>
      <nav className="navbar-v2" role="navigation" aria-label="Main navigation">
        <div className="navbar-v2-container">
          <div className="navbar-v2-left">
            <GearDisplay variant="horizontal" />
          </div>

          <div className="navbar-v2-center">
            <SearchTrigger onClick={openSearch} />
          </div>

          <div className="navbar-v2-right">
            {isSignedIn ? <UserHeader /> : <SignInButtons />}
          </div>
        </div>

        <style>{`
          .navbar-v2 {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 64px;
            background: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid var(--color-card-border);
            z-index: 1000;
          }

          .navbar-v2-container {
            max-width: 1400px;
            height: 100%;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 40px;
          }

          .navbar-v2-left {
            display: flex;
            align-items: center;
          }

          .navbar-v2-center {
            display: flex;
            align-items: center;
            flex: 1;
            justify-content: center;
          }

          .navbar-v2-right {
            display: flex;
            align-items: center;
          }

          @media (max-width: 768px) {
            .navbar-v2-container {
              padding: 0 20px;
            }

            .navbar-v2-center {
              display: none;
            }
          }
        `}</style>
      </nav>

      <SearchModal isOpen={isSearchOpen} onClose={closeSearch} />
    </>
  )
}
