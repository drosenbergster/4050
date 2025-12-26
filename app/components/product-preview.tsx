'use client';

import { useEffect, useState } from 'react';
import HomemadeCard from './homemade-card';
import { Product } from '@/lib/types';
import { STATIC_PRODUCTS } from '@/lib/static-data';

// Mock data fallback with Unsplash images - centralized in static-data.ts
const mockProducts = STATIC_PRODUCTS;

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
            if (nameLower.includes('applesauce')) category = 'Applesauces';
            else if (nameLower.includes('butter')) category = 'Spreads';
            else if (nameLower.includes('rings') || nameLower.includes('chips')) category = 'Dried Goods';
            else if (nameLower.includes('jam')) category = 'Jams';
            else if (nameLower.includes('pickle')) category = 'Pickled Goods';

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 border-t border-l border-[#E5DDD3]">
      {products.map((product) => (
        <HomemadeCard key={product.id} product={product} />
      ))}
    </div>
  );
}

