import { Product } from './types';

export const STORE_NAME = "MobileMaster Pro";
export const CURRENCY = "₹";

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Titanium Pro Max 15',
    brand: 'Apple',
    price: 159900,
    specs: ['A17 Pro Chip', '48MP Camera', 'Titanium Design'],
    image: 'https://picsum.photos/id/1/400/400',
    category: 'phone',
    featured: true
  },
  {
    id: 'p2',
    name: 'Galaxy Ultra S24',
    brand: 'Samsung',
    price: 129999,
    originalPrice: 134999,
    specs: ['Snapdragon 8 Gen 3', '200MP Camera', 'AI Integration'],
    image: 'https://picsum.photos/id/2/400/400',
    category: 'phone',
    featured: true
  },
  {
    id: 'p3',
    name: 'Pixel 8 Pro',
    brand: 'Google',
    price: 106999,
    specs: ['Tensor G3', 'Best-in-class Camera', '7 Years Updates'],
    image: 'https://picsum.photos/id/3/400/400',
    category: 'phone',
    featured: true
  },
  {
    id: 'p4',
    name: 'Fold Z5',
    brand: 'Samsung',
    price: 154999,
    specs: ['Foldable OLED', 'Multitasking Powerhouse'],
    image: 'https://picsum.photos/id/4/400/400',
    category: 'phone'
  },
  {
    id: 'p5',
    name: 'NoiseCancel Buds Pro',
    brand: 'AudioTech',
    price: 19990,
    specs: ['Active Noise Cancel', '30h Battery'],
    image: 'https://picsum.photos/id/5/400/400',
    category: 'accessory'
  },
  {
    id: 'p6',
    name: 'Fast Charger 65W',
    brand: 'PowerUp',
    price: 1999,
    specs: ['GaN Technology', 'Universal USB-C'],
    image: 'https://picsum.photos/id/6/400/400',
    category: 'accessory'
  }
];
