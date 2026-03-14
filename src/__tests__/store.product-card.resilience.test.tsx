import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { useMutation, useQuery } from 'convex/react'
import { MerchProductCard } from '../components/Merch/MerchProductCard'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
}))

vi.mock('../contexts/UserContext', () => ({
  useUser: () => ({
    isSignedIn: false,
    userProfile: null,
  }),
}))

vi.mock('../utils/merchImages', () => ({
  getMerchPrimaryImages: vi.fn((product: { imageUrls: string[] }) => product.imageUrls || []),
}))

describe('MerchProductCard resilience', () => {
  const toggleWishlistMock = vi.fn()
  const addToCartMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    let callIndex = 0
    vi.mocked(useMutation).mockImplementation(() => {
      const fn = callIndex === 0 ? toggleWishlistMock : addToCartMock
      callIndex += 1
      return fn as never
    })
    vi.mocked(useQuery).mockReturnValue([] as never)
  })

  it('falls back to placeholder image when image loading fails', async () => {
    render(
      <MerchProductCard
        product={{
          _id: 'product-1',
          name: 'Broken Image Tee',
          price: 2500,
          imageUrls: ['/broken-image.jpg'],
          totalStock: 4,
          variants: [{ _id: 'variant-1', stock: 4 }],
          tags: [],
        }}
      />,
    )

    const image = screen.getByAltText('Broken Image Tee') as HTMLImageElement
    fireEvent.error(image)

    await waitFor(() => {
      expect(image.src).toContain('/images/placeholder.jpg')
    })
  })

  it('renders deterministic badges and sold-out action state', () => {
    render(
      <MerchProductCard
        product={{
          _id: 'product-2',
          name: 'Vault Jacket',
          price: 12900,
          imageUrls: ['/vault-jacket.jpg'],
          category: 'limited',
          isNew: true,
          totalStock: 0,
          variants: [{ _id: 'variant-1', stock: 0, size: 'M' }],
          tags: ['limited release'],
        }}
      />,
    )

    expect(screen.getByText('New')).toBeInTheDocument()
    expect(screen.getByText('Limited')).toBeInTheDocument()
    expect(screen.getAllByText('Sold Out')).toHaveLength(3)
    expect(screen.getByText((value) => value.includes('Sold out'))).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sold Out' })).toBeDisabled()
  })

  it('keeps quick actions available and adds to cart for single in-stock variant', async () => {
    render(
      <MerchProductCard
        product={{
          _id: 'product-3',
          name: 'Crimson Cap',
          price: 3900,
          imageUrls: ['/cap.jpg'],
          totalStock: 8,
          variants: [{ _id: 'variant-3', stock: 8 }],
          tags: [],
        }}
      />,
    )

    expect(screen.getByRole('button', { name: 'Quick View' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mobile Add to Cart' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Add to Cart' }))

    await waitFor(() => {
      expect(addToCartMock).toHaveBeenCalledWith({ variantId: 'variant-3', quantity: 1 })
    })
  })

  it('uses choose-options CTA for multi-variant products and routes to details', () => {
    const onOpenProduct = vi.fn()
    render(
      <MerchProductCard
        onOpenProduct={onOpenProduct}
        product={{
          _id: 'product-4',
          name: 'Tour Jeans',
          price: 7900,
          imageUrls: ['/jeans.jpg'],
          totalStock: 6,
          variants: [
            { _id: 'variant-4a', stock: 3, size: 'M' },
            { _id: 'variant-4b', stock: 3, size: 'L' },
          ],
          tags: [],
        }}
      />,
    )

    expect(screen.getByRole('button', { name: 'Choose Options' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mobile Choose Options' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Choose Options' }))
    expect(onOpenProduct).toHaveBeenCalledWith('product-4')
  })
})
