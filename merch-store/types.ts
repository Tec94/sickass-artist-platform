export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: 'Music' | 'Apparel' | 'Accessories' | 'Tour';
  subCategory?: string;
  images: string[];
  isNew?: boolean;
  stock: number;
  description: string;
  sizes?: string[]; // For apparel
  formats?: string[]; // For music (Vinyl, CD, Cassette)
  tracklist?: string[]; // For music
  color: string;
}

export interface CartItem extends Product {
  selectedSize?: string;
  selectedFormat?: string;
  quantity: number;
}

export interface FilterState {
  category: string[];
  priceRange: [number, number];
  availability: boolean; // In stock only
}