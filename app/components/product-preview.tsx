'use client';

import { useEffect, useState } from 'react';
import ProductCardNew from './product-card-new';
import { Product } from '@/lib/types';

// Mock data fallback for local development
const mockProducts: (Product & { category: string })[] = [
  { id: '1', name: 'Classic Applesauce', description: 'Our signature smooth applesauce made from fresh-picked apples. Traditional recipe with natural sweetness.', priceCents: 899, imageUrl: 'https://placehold.co/400x400/png?text=Applesauce', isAvailable: true, createdAt: new Date(), updatedAt: new Date(), category: 'Applesauce' },
  { id: '2', name: 'Sugar-Free Applesauce', description: 'Pure applesauce with no added sugar. Just the natural sweetness of homegrown apples.', priceCents: 899, imageUrl: 'https://placehold.co/400x400/png?text=Sugar-Free+Applesauce', isAvailable: true, createdAt: new Date(), updatedAt: new Date(), category: 'Applesauce' },
  { id: '3', name: 'Apple Rings', description: 'Delicately dried apple rings. Perfect for snacking or adding to your favorite recipes.', priceCents: 799, imageUrl: 'https://placehold.co/400x400/png?text=Apple+Rings', isAvailable: true, createdAt: new Date(), updatedAt: new Date(), category: 'Dried Goods' },
  { id: '4', name: 'Apple Butter', description: 'Rich, creamy apple butter slow-cooked to perfection. Spread it on toast or enjoy by the spoonful.', priceCents: 1099, imageUrl: 'https://placehold.co/400x400/png?text=Apple+Butter', isAvailable: true, createdAt: new Date(), updatedAt: new Date(), category: 'Spreads' },
  { id: '5', name: 'Apple Chips', description: 'Crispy, naturally sweet apple chips. A healthy snack made from orchard-fresh apples.', priceCents: 699, imageUrl: 'https://placehold.co/400x400/png?text=Apple+Chips', isAvailable: true, createdAt: new Date(), updatedAt: new Date(), category: 'Dried Goods' },
  { id: '6', name: 'Raspberry Jam', description: 'Vibrant raspberry jam bursting with fresh berry flavor. Perfect for your morning toast.', priceCents: 1199, imageUrl: 'https://placehold.co/400x400/png?text=Raspberry+Jam', isAvailable: true, createdAt: new Date(), updatedAt: new Date(), category: 'Jams' },
  { id: '7', name: 'Blueberry Jam', description: 'Sweet blueberry jam made with handpicked berries. A family favorite for generations.', priceCents: 1199, imageUrl: 'https://placehold.co/400x400/png?text=Blueberry+Jam', isAvailable: true, createdAt: new Date(), updatedAt: new Date(), category: 'Jams' },
  { id: '8', name: 'Apple Jam', description: 'Unique apple jam with hints of cinnamon. Ilene\'s special recipe passed down through generations.', priceCents: 1099, imageUrl: 'https://placehold.co/400x400/png?text=Apple+Jam', isAvailable: true, createdAt: new Date(), updatedAt: new Date(), category: 'Jams' },
];

export default function ProductPreview() {
  const [products, setProducts] = useState<(Product & { category: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          // Add category based on product name
          const productsWithCategories = data.map((p: Product) => {
            let category = 'Other';
            const nameLower = p.name.toLowerCase();
            if (nameLower.includes('applesauce')) category = 'Applesauce';
            else if (nameLower.includes('butter')) category = 'Spreads';
            else if (nameLower.includes('rings') || nameLower.includes('chips')) category = 'Dried Goods';
            else if (nameLower.includes('jam')) category = 'Jams';
            else if (nameLower.includes('pickle')) category = 'Pickled';
            
            return { ...p, category };
          });
          setProducts(productsWithCategories);
        } else {
          // Fallback to mock data
          setProducts(mockProducts);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
        // Fallback to mock data
        setProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-pulse text-[#636E72]">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCardNew key={product.id} product={product} />
      ))}
    </div>
  );
}

