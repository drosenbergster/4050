'use client';

import { useEffect, useState } from 'react';
import HomemadeCard from './homemade-card';
import { ShopProduct } from '@/app/shop/page';

export default function ProductPreview() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        // Use the new catalog API which returns ShopProduct-compatible data
        const res = await fetch('/api/catalog');
        if (res.ok) {
          const data = await res.json();
          // Transform catalog data to ShopProduct format
          const shopProducts: ShopProduct[] = data.categories?.flatMap((category: {
            id: string;
            name: string;
            flavors: Array<{
              id: string;
              name: string;
              description: string | null;
              imageUrl: string | null;
              isAvailable: boolean;
              sizes: Array<{
                id: string;
                sizeKey: string;
                sizeLabel: string;
                sizeOz: number;
                unitPrice: number;
                quantity: number;
              }>;
            }>;
          }) =>
            category.flavors
              .filter(f => f.isAvailable && f.sizes.some(s => s.quantity > 0))
              .map(flavor => {
                const prices = flavor.sizes.map(s => s.unitPrice);
                return {
                  id: flavor.id,
                  name: flavor.name,
                  fullName: flavor.name,
                  description: flavor.description || '',
                  imageUrl: flavor.imageUrl || '',
                  categoryId: category.id,
                  categoryName: category.name,
                  isAvailable: flavor.isAvailable,
                  sizes: flavor.sizes,
                  minPrice: Math.min(...prices),
                  maxPrice: Math.max(...prices),
                };
              })
          ) || [];
          setProducts(shopProducts.slice(0, 10)); // Limit to 10 for preview
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]);
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

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-[#636E72]">No products available yet</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 border-t border-l border-[#E5DDD3]">
      {products.map((product) => (
        <HomemadeCard key={product.id} product={product} />
      ))}
    </div>
  );
}

