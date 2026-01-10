import { Product } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Midnight Frequency - LP',
    price: 35.00,
    category: 'Music',
    subCategory: 'Vinyl',
    images: [
      'https://picsum.photos/800/800?random=1',
      'https://picsum.photos/800/800?random=11'
    ],
    isNew: true,
    stock: 50,
    description: 'The sophomore album "Midnight Frequency" pressed on 180g translucent blue vinyl. Includes fold-out poster and lyric sheet.',
    formats: ['Vinyl', 'CD', 'Digital'],
    tracklist: ['1. Static Dawn', '2. Neon Veins', '3. Midnight Frequency', '4. Analog Heart'],
    color: 'Blue'
  },
  {
    id: '2',
    name: 'Echo Tour Hoodie',
    price: 85.00,
    category: 'Apparel',
    subCategory: 'Hoodies',
    images: [
      'https://picsum.photos/800/1000?random=2',
      'https://picsum.photos/800/1000?random=22'
    ],
    isNew: true,
    stock: 120,
    description: 'Heavyweight cotton fleece hoodie featuring the 2025 World Tour dates on the back and puff-print logo on the chest. Oversized fit.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    color: 'Black'
  },
  {
    id: '3',
    name: 'Distortion Tee',
    price: 45.00,
    originalPrice: 55.00,
    category: 'Apparel',
    subCategory: 'Shirts',
    images: [
      'https://picsum.photos/800/1000?random=3',
      'https://picsum.photos/800/1000?random=33'
    ],
    stock: 200,
    description: 'Vintage wash tee with distressed graphic print. 100% Cotton.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    color: 'Grey'
  },
  {
    id: '4',
    name: 'Sonic Cap',
    price: 30.00,
    category: 'Accessories',
    images: [
      'https://picsum.photos/800/800?random=4',
    ],
    stock: 15,
    description: 'Embroidered dad hat with metal buckle closure.',
    color: 'Navy'
  },
  {
    id: '5',
    name: 'Live at the Zenith - Cassette',
    price: 15.00,
    category: 'Music',
    subCategory: 'Cassette',
    images: [
      'https://picsum.photos/800/800?random=5',
    ],
    isNew: true,
    stock: 0, // Out of stock example
    description: 'Limited edition cassette tape of the legendary Zenith performance.',
    formats: ['Cassette'],
    color: 'Red'
  }
];

export const CATEGORIES = [
  { name: 'New Arrivals', id: 'new' },
  { name: 'Music', id: 'music' },
  { name: 'Apparel', id: 'apparel' },
  { name: 'Accessories', id: 'accessories' },
  { name: 'Tour Tickets', id: 'tour' }
];
