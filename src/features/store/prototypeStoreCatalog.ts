export type PrototypeStoreCategory =
  | 'all'
  | 'apparel'
  | 'music'
  | 'collectibles'
  | 'accessories'

export type PrototypeStoreAvailability = 'available' | 'sold-out'
export type PrototypeStoreSort = 'latest' | 'price-low' | 'price-high'

export interface PrototypeStoreProduct {
  slug: string
  name: string
  category: Exclude<PrototypeStoreCategory, 'all'>
  priceCents: number
  primaryImage: string
  gallery: string[]
  availability: PrototypeStoreAvailability
  badge?: string
  shortDescription: string
  detailDescription: string
  materials: string
  releaseNote: string
  alt: string
  featuredOrder: number
}

export const PROTOTYPE_STORE_CATEGORY_LABELS: Record<PrototypeStoreCategory, string> = {
  all: 'All Products',
  apparel: 'Apparel',
  music: 'Music',
  collectibles: 'Collectibles',
  accessories: 'Accessories',
}

export const PROTOTYPE_STORE_SORT_LABELS: Record<PrototypeStoreSort, string> = {
  latest: 'Latest',
  'price-low': 'Price: Low - High',
  'price-high': 'Price: High - Low',
}

export const PROTOTYPE_STORE_PRODUCTS: PrototypeStoreProduct[] = [
  {
    slug: 'private-suite-tee',
    name: 'Private Suite Tee',
    category: 'apparel',
    priceCents: 4500,
    primaryImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDSKDzlRjFImnV-UfzxaF0-Q-flI9yLrlnTa0JVsCY3hdDA4-LDzpwvxjNrPc24CjNJY9_fNec7boAzrML7yL2_J9LXlooNOnujpssGINo8omlpS9WBjJHa759zujeex3SGz1ZA8Est5Kmvx-baj157bibrqvpp07Z-DOj4GEoCKngvXqPWcdRVC2TIGFzgji0LoA_a8EhijJ-2DBiX_rXEUcPrCeWzQGggjumKZUN9rJeeH4d6k6WrkhkeJsypirllffe7Y9jYS1OM',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDSKDzlRjFImnV-UfzxaF0-Q-flI9yLrlnTa0JVsCY3hdDA4-LDzpwvxjNrPc24CjNJY9_fNec7boAzrML7yL2_J9LXlooNOnujpssGINo8omlpS9WBjJHa759zujeex3SGz1ZA8Est5Kmvx-baj157bibrqvpp07Z-DOj4GEoCKngvXqPWcdRVC2TIGFzgji0LoA_a8EhijJ-2DBiX_rXEUcPrCeWzQGggjumKZUN9rJeeH4d6k6WrkhkeJsypirllffe7Y9jYS1OM',
      '/merch/shirts/shirt1/shirt1-1-1.jpeg',
      '/merch/shirts/shirt1/shirt1-2-1.jpeg',
    ],
    availability: 'available',
    badge: 'New',
    shortDescription: 'Core uniform weight with a small crest hit and a crisp editorial drape.',
    detailDescription:
      'A clean front-loaded staple cut for the current campaign cycle. The Private Suite tee keeps the silhouette easy and the branding quiet so it layers inside the rest of the estate wardrobe.',
    materials: 'Heavy cotton jersey with a soft hand feel and structured neck rib.',
    releaseNote: 'Latest capsule',
    alt: 'White Private Suite tee displayed against a light studio backdrop',
    featuredOrder: 10,
  },
  {
    slug: 'el-lobo-hoodie',
    name: 'El Lobo Hoodie',
    category: 'apparel',
    priceCents: 12000,
    primaryImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC5uguBbRQ_xy2XdYYrNQCFI2mqEM3EXSBlAasBcgiaoZuB4-e0vt4K7GJIcSFekVGoXc9daRhjfk5vYLb48V3Rj2ZgqGcdgW4XO7enKG_wWXOShz3NUMSfEC8VQJv3f7rjcQMvgYFeOk9g6jBzOxM9el5nFhd2xYf2a0kcOpwh6qz8_pEZez1B40lb5UeiyldTFc6BwvIh1-VoTCd_Jtwk2ThrdQat0HWZ54HOa6TQme8x5eJ8UJQhuJSFTW8KSh9Koxk49Xwh8ryG',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC5uguBbRQ_xy2XdYYrNQCFI2mqEM3EXSBlAasBcgiaoZuB4-e0vt4K7GJIcSFekVGoXc9daRhjfk5vYLb48V3Rj2ZgqGcdgW4XO7enKG_wWXOShz3NUMSfEC8VQJv3f7rjcQMvgYFeOk9g6jBzOxM9el5nFhd2xYf2a0kcOpwh6qz8_pEZez1B40lb5UeiyldTFc6BwvIh1-VoTCd_Jtwk2ThrdQat0HWZ54HOa6TQme8x5eJ8UJQhuJSFTW8KSh9Koxk49Xwh8ryG',
      '/merch/jackets/jacket1/jacket1-1-1.png',
      '/merch/jackets/jacket1/jacket1-2-1.png',
    ],
    availability: 'available',
    shortDescription: 'Oversized campaign hoodie with tonal embroidery and a washed black finish.',
    detailDescription:
      'Built as the heavier outer layer in the prototype capsule. The El Lobo hoodie keeps a wide body, deep hood, and restrained logo treatment that reads closest to the journey moodboard.',
    materials: 'Heavy fleece with brushed interior, dropped shoulder, tonal chest embroidery.',
    releaseNote: 'Capsule staple',
    alt: 'Black oversized hoodie photographed on a neutral background',
    featuredOrder: 9,
  },
  {
    slug: 'la-manada-cap',
    name: 'La Manada Cap',
    category: 'accessories',
    priceCents: 3500,
    primaryImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBGY91OWq9bJ9-d0st2AXFNHZtCmQPu22dwwGMfJ6yCHsc-X4TPe5Ldk1QwJDhjToqkgrPgMOlWXA7PCQ9ZbJBDQNs9GnQoXT-8XSdMfRzHnph3AwTXs7NqIbZ5-rSdEBXIxMMXBVBP0AwtFYjdzhpYinElnt9dE1xCBugJecLRbeM42eryzAf60se_fYew5Z3KzT_PaGfoChTqb-ZxUXqckjTPckw0hgxU-rhWw1bzHdTCKOYMl6GO0CfyPV6iBEdg4343YYLH9R5w',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBGY91OWq9bJ9-d0st2AXFNHZtCmQPu22dwwGMfJ6yCHsc-X4TPe5Ldk1QwJDhjToqkgrPgMOlWXA7PCQ9ZbJBDQNs9GnQoXT-8XSdMfRzHnph3AwTXs7NqIbZ5-rSdEBXIxMMXBVBP0AwtFYjdzhpYinElnt9dE1xCBugJecLRbeM42eryzAf60se_fYew5Z3KzT_PaGfoChTqb-ZxUXqckjTPckw0hgxU-rhWw1bzHdTCKOYMl6GO0CfyPV6iBEdg4343YYLH9R5w',
      '/merch/shirts/shirt2/shirt2-1-1.jpeg',
    ],
    availability: 'available',
    shortDescription: 'Soft crown cap in bone with a restrained crest mark on the front panel.',
    detailDescription:
      'The cleanest accessory in the prototype drop. It is meant to soften the darker apparel pieces and keep the store grid from feeling too uniform in silhouette.',
    materials: 'Cotton twill with a curved brim and low-profile crown.',
    releaseNote: 'Accessory edit',
    alt: 'Bone colored cap against a dark studio background',
    featuredOrder: 8,
  },
  {
    slug: 'naranjito-overshirt',
    name: 'Naranjito Overshirt',
    category: 'apparel',
    priceCents: 18500,
    primaryImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAhZsIzPBlB-WDNyJhHB5SZYKEjShn_Tlafuus7sNqI4ouApe94yj1A5rMQZY2aZC1uBW1hL6fEqLxBza7qrF_po-6LCHupjHtCl-ItcH2XON3iSdz_7wj42K1Y-H1Ahx14X3gJJqKg066Q4PQ5irCNFMq9zi4eqq277qqe23AHDrJ5VZZusJ6Dj0eHcdHWuGPLjhPdt62Y2qeNHfDBXDexoGFihop2YYerxgWjAqKY-XZHk89xCNdzJykfjgcelHEatsZjbpwK-7Ci',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAhZsIzPBlB-WDNyJhHB5SZYKEjShn_Tlafuus7sNqI4ouApe94yj1A5rMQZY2aZC1uBW1hL6fEqLxBza7qrF_po-6LCHupjHtCl-ItcH2XON3iSdz_7wj42K1Y-H1Ahx14X3gJJqKg066Q4PQ5irCNFMq9zi4eqq277qqe23AHDrJ5VZZusJ6Dj0eHcdHWuGPLjhPdt62Y2qeNHfDBXDexoGFihop2YYerxgWjAqKY-XZHk89xCNdzJykfjgcelHEatsZjbpwK-7Ci',
      '/merch/jackets/jacket2/jacket2-1-1.png',
      '/merch/jackets/jacket2/jacket2-2-1.png',
    ],
    availability: 'available',
    shortDescription: 'Structured overshirt in olive with a crisp front pocket and easy layering width.',
    detailDescription:
      'This is the tailoring-adjacent piece in the collection. It brings the store page out of plain fleece basics and supports the more editorial direction the user asked to preserve.',
    materials: 'Mid-weight brushed cotton with tonal button closure and reinforced pocket seam.',
    releaseNote: 'Field issue',
    alt: 'Olive overshirt front view on a pale background',
    featuredOrder: 7,
  },
  {
    slug: 'tour-longsleeve',
    name: 'Tour Longsleeve',
    category: 'apparel',
    priceCents: 5500,
    primaryImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBZYachcBpvP2OixxrH8LN3Z9Rrgp6OqiW4Sg4T9RSD1jA7gn9fLPJvxUaO3GSfl2XwSFfaiBU-bCxNjIxINniQ13UccFsjoD64UtLdJ2GWpgR_JfkKt-NrKp4RSwWjxdJPv3LooCwu7EDhO_WE9pKTcxln1frBmlBCvit2qQc2wRd-K1sPD-WzxiW80Vf_MrsGb4f9IhrdBp294sUo8pu-3Hd0X0JEPz8dfjcDalATF0BGMUljQ_FE-lNjDqzCBMu7Am2qmgg1sI_u',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBZYachcBpvP2OixxrH8LN3Z9Rrgp6OqiW4Sg4T9RSD1jA7gn9fLPJvxUaO3GSfl2XwSFfaiBU-bCxNjIxINniQ13UccFsjoD64UtLdJ2GWpgR_JfkKt-NrKp4RSwWjxdJPv3LooCwu7EDhO_WE9pKTcxln1frBmlBCvit2qQc2wRd-K1sPD-WzxiW80Vf_MrsGb4f9IhrdBp294sUo8pu-3Hd0X0JEPz8dfjcDalATF0BGMUljQ_FE-lNjDqzCBMu7Am2qmgg1sI_u',
      '/merch/shirts/shirt2/shirt2-2-1.jpeg',
    ],
    availability: 'sold-out',
    shortDescription: 'Archive long sleeve held in the grid for reference while the restock window stays closed.',
    detailDescription:
      'The detail page remains live so users can read the story of the piece, but the prototype cart does not allow additions while it is marked sold out.',
    materials: 'Mid-weight jersey with washed graphic application and a relaxed cuff.',
    releaseNote: 'Sold out',
    alt: 'Faded white long sleeve shirt with softened contrast',
    featuredOrder: 6,
  },
  {
    slug: 'midnight-sneaker',
    name: 'Midnight Sneaker',
    category: 'accessories',
    priceCents: 22000,
    primaryImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB04Te93bWhgjl5FliglDYwlpb3OJaodbpS2R5-gFxpS9fRTqKCnuKKlQAihWPI_iT6V4Fi8ed0-lBynPMbnZdyuShmqScxn517aeQpNar5S6NDze9FD0LKtkZRK2ufqkymymgG3XtzQIZ5-AeUUbe0jTFbBkMb584wOXveRrWNhmG9SHd7O9lNL2n5KSvULHahwfiyg5DZFn5F6MTEkE8eg9pNeH9jfzcrfgo5selmNEWZh5HSB6-5dQgfy8g-xLDWnQyQxtZRcLEs',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB04Te93bWhgjl5FliglDYwlpb3OJaodbpS2R5-gFxpS9fRTqKCnuKKlQAihWPI_iT6V4Fi8ed0-lBynPMbnZdyuShmqScxn517aeQpNar5S6NDze9FD0LKtkZRK2ufqkymymgG3XtzQIZ5-AeUUbe0jTFbBkMb584wOXveRrWNhmG9SHd7O9lNL2n5KSvULHahwfiyg5DZFn5F6MTEkE8eg9pNeH9jfzcrfgo5selmNEWZh5HSB6-5dQgfy8g-xLDWnQyQxtZRcLEs',
      '/merch/jeans/jeans1/jeans1-1-1.jpeg',
    ],
    availability: 'available',
    shortDescription: 'Low profile leather sneaker that keeps the palette anchored in black.',
    detailDescription:
      'A clean finishing piece for the store capsule. The Midnight sneaker adds a harder edge and gives the accessory filter real weight beside the cap.',
    materials: 'Smooth leather upper with tonal stitching, padded collar, and matte rubber sole.',
    releaseNote: 'Footwear capsule',
    alt: 'Black leather sneaker photographed from the side',
    featuredOrder: 5,
  },
  {
    slug: 'midnight-sessions-vinyl',
    name: 'Midnight Sessions Vinyl',
    category: 'music',
    priceCents: 6500,
    primaryImage: '/merch/music/disk1/disk1-1-1.jpeg',
    gallery: ['/merch/music/disk1/disk1-1-1.jpeg', '/merch/music/disk2/disk2-1-1.jpeg'],
    availability: 'available',
    badge: 'Drop',
    shortDescription: 'Limited run vinyl cut of the campaign-era live arrangement set.',
    detailDescription:
      'The music lane anchors the rest of the collection in actual release material. This pressing is treated like a story object as much as a playback format.',
    materials: '180g black vinyl with printed inner sleeve and numbered obi strip.',
    releaseNote: 'Current era audio',
    alt: 'Vinyl record sleeve photographed in a merch product shot',
    featuredOrder: 4,
  },
  {
    slug: 'estate-signal-cassette',
    name: 'Estate Signal Cassette',
    category: 'music',
    priceCents: 2400,
    primaryImage: '/merch/music/disk2/disk2-1-1.jpeg',
    gallery: ['/merch/music/disk2/disk2-1-1.jpeg', '/merch/music/disk1/disk1-1-1.jpeg'],
    availability: 'available',
    shortDescription: 'Compact analogue edition for the field-notes version of the soundtrack.',
    detailDescription:
      'A lighter entry point into the music category that still carries the same visual language as the rest of the prototype store. It is intentionally small, inexpensive, and collectible.',
    materials: 'Smoke shell cassette with printed j-card and matte slip sleeve.',
    releaseNote: 'Signal archive',
    alt: 'Physical music product shot for the estate signal cassette',
    featuredOrder: 3,
  },
  {
    slug: 'obsidian-wayfinder-poster',
    name: 'Obsidian Wayfinder Poster',
    category: 'collectibles',
    priceCents: 3800,
    primaryImage: '/merch/posters/poster1/poster1-1-1.jpeg',
    gallery: ['/merch/posters/poster1/poster1-1-1.jpeg', '/merch/posters/poster2/poster2-1-1.jpeg'],
    availability: 'available',
    shortDescription: 'Large-format campaign poster built from the estate map and release markups.',
    detailDescription:
      'This is the clearest collectible expression of the Journey system. It turns the navigation language into an object without dragging the store into full prop territory.',
    materials: 'Matte art stock with oversized bleed and archive tube packaging.',
    releaseNote: 'Map study',
    alt: 'Poster product shot featuring the estate wayfinder art',
    featuredOrder: 2,
  },
  {
    slug: 'coordinate-token-set',
    name: 'Coordinate Token Set',
    category: 'collectibles',
    priceCents: 5200,
    primaryImage: '/merch/posters/poster2/poster2-1-1.jpeg',
    gallery: ['/merch/posters/poster2/poster2-1-1.jpeg', '/merch/posters/poster1/poster1-1-1.jpeg'],
    availability: 'available',
    shortDescription: 'Numbered keepsake set built around the campaign coordinate motif.',
    detailDescription:
      'A display-first collectible created to round out the prototype catalog. It reads like merch with story weight instead of a simple souvenir.',
    materials: 'Foil stamped card set with numbered sleeve and matte display insert.',
    releaseNote: 'Collector issue',
    alt: 'Collectible token set arranged in a clean studio merch shot',
    featuredOrder: 1,
  },
]

export const getPrototypeStoreProduct = (productSlug: string) =>
  PROTOTYPE_STORE_PRODUCTS.find((product) => product.slug === productSlug) ?? null

export const getPrototypeStoreCategoryCounts = () =>
  PROTOTYPE_STORE_PRODUCTS.reduce<Record<PrototypeStoreCategory, number>>(
    (counts, product) => {
      counts.all += 1
      counts[product.category] += 1
      return counts
    },
    {
      all: 0,
      apparel: 0,
      music: 0,
      collectibles: 0,
      accessories: 0,
    },
  )

export const getPrototypeStoreProducts = (
  category: PrototypeStoreCategory,
  sort: PrototypeStoreSort,
) => {
  const filteredProducts =
    category === 'all'
      ? PROTOTYPE_STORE_PRODUCTS
      : PROTOTYPE_STORE_PRODUCTS.filter((product) => product.category === category)

  return [...filteredProducts].sort((left, right) => {
    if (sort === 'price-low') return left.priceCents - right.priceCents
    if (sort === 'price-high') return right.priceCents - left.priceCents
    return right.featuredOrder - left.featuredOrder
  })
}

export const formatPrototypePrice = (priceCents: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(priceCents / 100)
