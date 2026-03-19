import { Link } from 'react-router-dom'

type StoreSectionNavId = 'browse' | 'drops' | 'cart' | 'orders'

interface StoreSectionNavProps {
  activeId: StoreSectionNavId
  className?: string
}

const STORE_SECTION_LINKS: Array<{ id: StoreSectionNavId; label: string; to: string }> = [
  { id: 'browse', label: 'Products', to: '/store/browse' },
  { id: 'drops', label: 'Drops / Queue', to: '/store/drops' },
  { id: 'cart', label: 'Cart', to: '/store/cart' },
  { id: 'orders', label: 'Orders', to: '/store/orders' },
]

export function StoreSectionNav({ activeId, className }: StoreSectionNavProps) {
  return (
    <nav
      aria-label="Store sections"
      className={['store-v2-local-nav', className].filter(Boolean).join(' ')}
    >
      {STORE_SECTION_LINKS.map((link) => (
        <Link
          key={link.id}
          to={link.to}
          aria-current={activeId === link.id ? 'page' : undefined}
          className={`store-v2-local-link ${activeId === link.id ? 'store-v2-local-link--active' : ''}`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
