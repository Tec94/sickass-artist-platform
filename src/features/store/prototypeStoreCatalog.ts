export type PrototypeStoreCategory =
  | 'all'
  | 'apparel'
  | 'music'
  | 'collectibles'
  | 'accessories'

export type PrototypeStoreAvailability = 'available' | 'sold-out'
export type PrototypeStoreSort = 'latest' | 'price-low' | 'price-high'
export type PrototypeStoreSelection = Record<string, string>

export interface PrototypeStoreOption {
  id: string
  label: string
  priceDeltaCents?: number
}

export interface PrototypeStoreOptionGroup {
  id: string
  label: string
  options: PrototypeStoreOption[]
}

export interface PrototypeStoreQuickDetail {
  label: string
  value: string
}

export interface PrototypeStoreResolvedSelection {
  groupId: string
  groupLabel: string
  optionId: string
  optionLabel: string
  priceDeltaCents: number
}

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
  releaseNote: string
  alt: string
  featuredOrder: number
  optionGroups: PrototypeStoreOptionGroup[]
  quickDetails: PrototypeStoreQuickDetail[]
}

const sizeOptions = (values: string[]): PrototypeStoreOptionGroup => ({
  id: 'size',
  label: 'Size',
  options: values.map((value) => ({ id: value.toLowerCase(), label: value })),
})

const finishOptions = (
  label: string,
  values: Array<{ id: string; label: string; priceDeltaCents?: number }>,
): PrototypeStoreOptionGroup => ({
  id: 'finish',
  label,
  options: values,
})

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
    releaseNote: 'Latest capsule',
    alt: 'White Private Suite tee displayed against a light studio backdrop',
    featuredOrder: 10,
    optionGroups: [
      sizeOptions(['M', 'L', 'XL']),
      finishOptions('Colorway', [
        { id: 'core-white', label: 'Core White' },
        { id: 'archive-black', label: 'Archive Black', priceDeltaCents: 300 },
      ]),
    ],
    quickDetails: [
      { label: 'Material', value: 'Heavy cotton jersey' },
      { label: 'Fit', value: 'Classic straight fit' },
      { label: 'Finish', value: 'Soft hand with structured neck rib' },
    ],
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
    releaseNote: 'Capsule staple',
    alt: 'Black oversized hoodie photographed on a neutral background',
    featuredOrder: 9,
    optionGroups: [
      sizeOptions(['M', 'L', 'XL']),
      finishOptions('Wash', [
        { id: 'washed-black', label: 'Washed Black' },
        { id: 'bone-fog', label: 'Bone Fog', priceDeltaCents: 500 },
      ]),
    ],
    quickDetails: [
      { label: 'Material', value: 'Heavy fleece' },
      { label: 'Fit', value: 'Oversized with dropped shoulder' },
      { label: 'Finish', value: 'Tonal chest embroidery' },
    ],
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
    releaseNote: 'Accessory edit',
    alt: 'Bone colored cap against a dark studio background',
    featuredOrder: 8,
    optionGroups: [
      {
        id: 'size',
        label: 'Size',
        options: [{ id: 'one-size', label: 'One size' }],
      },
      finishOptions('Colorway', [
        { id: 'bone', label: 'Bone' },
        { id: 'midnight', label: 'Midnight', priceDeltaCents: 200 },
      ]),
    ],
    quickDetails: [
      { label: 'Material', value: 'Cotton twill' },
      { label: 'Profile', value: 'Low-profile crown' },
      { label: 'Closure', value: 'Adjustable back strap' },
    ],
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
    releaseNote: 'Field issue',
    alt: 'Olive overshirt front view on a pale background',
    featuredOrder: 7,
    optionGroups: [
      sizeOptions(['M', 'L', 'XL']),
      finishOptions('Colorway', [
        { id: 'olive-field', label: 'Olive Field' },
        { id: 'ash-stone', label: 'Ash Stone', priceDeltaCents: 400 },
      ]),
    ],
    quickDetails: [
      { label: 'Material', value: 'Brushed cotton' },
      { label: 'Fit', value: 'Easy overshirt layer' },
      { label: 'Closure', value: 'Tonal button front' },
    ],
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
    releaseNote: 'Sold out',
    alt: 'Faded white long sleeve shirt with softened contrast',
    featuredOrder: 6,
    optionGroups: [
      sizeOptions(['M', 'L', 'XL']),
      finishOptions('Wash', [
        { id: 'faded-white', label: 'Faded White' },
        { id: 'carbon-wash', label: 'Carbon Wash', priceDeltaCents: 300 },
      ]),
    ],
    quickDetails: [
      { label: 'Material', value: 'Mid-weight jersey' },
      { label: 'Fit', value: 'Relaxed cuffed sleeve' },
      { label: 'Graphic', value: 'Washed front and back print' },
    ],
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
    releaseNote: 'Footwear capsule',
    alt: 'Black leather sneaker photographed from the side',
    featuredOrder: 5,
    optionGroups: [
      {
        id: 'size',
        label: 'Size',
        options: ['41', '42', '43', '44'].map((value) => ({
          id: `eu-${value}`,
          label: `EU ${value}`,
        })),
      },
      finishOptions('Finish', [
        { id: 'obsidian-black', label: 'Obsidian Black' },
        { id: 'bone-trim', label: 'Bone Trim', priceDeltaCents: 900 },
      ]),
    ],
    quickDetails: [
      { label: 'Upper', value: 'Smooth leather' },
      { label: 'Sole', value: 'Matte rubber cupsole' },
      { label: 'Profile', value: 'Low-top with padded collar' },
    ],
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
    releaseNote: 'Current era audio',
    alt: 'Vinyl record sleeve photographed in a merch product shot',
    featuredOrder: 4,
    optionGroups: [
      {
        id: 'edition',
        label: 'Edition',
        options: [
          { id: 'standard-press', label: 'Standard Press' },
          { id: 'marble-press', label: 'Marble Press', priceDeltaCents: 800 },
        ],
      },
    ],
    quickDetails: [
      { label: 'Format', value: '180g vinyl' },
      { label: 'Packaging', value: 'Printed inner sleeve' },
      { label: 'Edition', value: 'Numbered obi strip' },
    ],
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
    releaseNote: 'Signal archive',
    alt: 'Physical music product shot for the estate signal cassette',
    featuredOrder: 3,
    optionGroups: [
      {
        id: 'shell',
        label: 'Shell',
        options: [
          { id: 'smoke-shell', label: 'Smoke Shell' },
          { id: 'crimson-shell', label: 'Crimson Shell', priceDeltaCents: 200 },
        ],
      },
      {
        id: 'sleeve',
        label: 'Sleeve',
        options: [
          { id: 'matte-slip', label: 'Matte Slip' },
          { id: 'archive-sleeve', label: 'Archive Sleeve', priceDeltaCents: 300 },
        ],
      },
    ],
    quickDetails: [
      { label: 'Format', value: 'Smoke shell cassette' },
      { label: 'Insert', value: 'Printed J-card' },
      { label: 'Sleeve', value: 'Matte slip case' },
    ],
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
    releaseNote: 'Map study',
    alt: 'Poster product shot featuring the estate wayfinder art',
    featuredOrder: 2,
    optionGroups: [
      {
        id: 'size',
        label: 'Size',
        options: [
          { id: '24x36', label: '24 × 36' },
          { id: '30x40', label: '30 × 40', priceDeltaCents: 700 },
        ],
      },
      finishOptions('Finish', [
        { id: 'matte-stock', label: 'Matte Stock' },
        { id: 'foil-accent', label: 'Foil Accent', priceDeltaCents: 500 },
      ]),
    ],
    quickDetails: [
      { label: 'Material', value: 'Matte art stock' },
      { label: 'Packaging', value: 'Archive tube shipper' },
      { label: 'Print', value: 'Oversized bleed artwork' },
    ],
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
    releaseNote: 'Collector issue',
    alt: 'Collectible token set arranged in a clean studio merch shot',
    featuredOrder: 1,
    optionGroups: [
      {
        id: 'edition',
        label: 'Edition',
        options: [
          { id: 'standard-set', label: 'Standard Set' },
          { id: 'numbered-sleeve', label: 'Numbered Sleeve', priceDeltaCents: 600 },
        ],
      },
      finishOptions('Finish', [
        { id: 'matte-insert', label: 'Matte Insert' },
        { id: 'foil-edge', label: 'Foil Edge', priceDeltaCents: 400 },
      ]),
    ],
    quickDetails: [
      { label: 'Material', value: 'Foil stamped card set' },
      { label: 'Pack', value: 'Numbered sleeve' },
      { label: 'Display', value: 'Matte presentation insert' },
    ],
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

export const resolvePrototypeStoreSelection = (
  product: PrototypeStoreProduct,
  selection: PrototypeStoreSelection = {},
): PrototypeStoreResolvedSelection[] =>
  product.optionGroups.flatMap((group) => {
    const fallbackOption = group.options[0]
    if (!fallbackOption) return []

    const selectedOption =
      group.options.find((option) => option.id === selection[group.id]) ?? fallbackOption

    return [
      {
        groupId: group.id,
        groupLabel: group.label,
        optionId: selectedOption.id,
        optionLabel: selectedOption.label,
        priceDeltaCents: selectedOption.priceDeltaCents ?? 0,
      },
    ]
  })

export const getPrototypeDefaultSelection = (
  product: PrototypeStoreProduct,
): PrototypeStoreSelection =>
  Object.fromEntries(
    resolvePrototypeStoreSelection(product).map((item) => [item.groupId, item.optionId]),
  )

export const normalizePrototypeStoreSelection = (
  product: PrototypeStoreProduct,
  selection: PrototypeStoreSelection = {},
): PrototypeStoreSelection =>
  Object.fromEntries(
    resolvePrototypeStoreSelection(product, selection).map((item) => [item.groupId, item.optionId]),
  )

export const getPrototypeSelectionUnitPrice = (
  product: PrototypeStoreProduct,
  selection: PrototypeStoreSelection = {},
) =>
  product.priceCents +
  resolvePrototypeStoreSelection(product, selection).reduce(
    (total, item) => total + item.priceDeltaCents,
    0,
  )

export const formatPrototypePrice = (priceCents: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(priceCents / 100)
