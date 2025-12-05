'use client';

import { useEffect, useState } from 'react';
import ProductCardNew from './product-card-new';
import { Product } from '@/lib/types';

// Mock data fallback with Unsplash images - matches database
const mockProducts: (Product & { category: string })[] = [
  { id: '1', name: 'Classic Applesauce', description: 'Our signature smooth applesauce made from fresh-picked apples. Traditional recipe with natural sweetness.', price: 899, imageUrl: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&h=400&fit=crop', isAvailable: true, createdAt: new Date(), updatedAt: new Date(), category: 'Applesauce' },
  { id: '2', name: 'Sugar-Free Applesauce', description: 'Pure applesauce with no added sugar. Just the natural sweetness of homegrown apples.', price: 899, imageUrl: 'https://images.unsplash.com/photo-1619546952812-320e9c0e4b26?w=400&h=400&fit=crop', isAvailable: true, createdAt: new Date(), updatedAt: new Date(), category: 'Applesauce' },
  { id: '3', name: 'Apple Rings', description: 'Delicately dried apple rings. Perfect for snacking or adding to your favorite recipes.', price: 799, imageUrl: 'https://images.unsplash.com/photo-1590005354167-6da97870c757?w=400&h=400&fit=crop', isAvailable: true, createdAt: new Date(), updatedAt: new Date(), category: 'Dried Goods' },
  { id: '4', name: 'Apple Butter', description: 'Rich, creamy apple butter slow-cooked to perfection. Spread it on toast or enjoy by the spoonful.', price: 1099, imageUrl: 'https://images.unsplash.com/photo-1603309977775-bdc8c4dd4e01?w=400&h=400&fit=crop', isAvailable: true, createdAt: new Date(), updatedAt: new Date(), category: 'Spreads' },
  { id: '5', name: 'Apple Chips', description: 'Crispy, naturally sweet apple chips. A healthy snack made from orchard-fresh apples.', price: 699, imageUrl: 'https://images.unsplash.com/photo-1606312617524-c6c61bf79a0b?w=400&h=400&fit=crop', isAvailable: true, createdAt: new Date(), updatedAt: new Date(), category: 'Dried Goods' },
  { id: '6', name: 'Raspberry Jam', description: 'Vibrant raspberry jam bursting with fresh berry flavor. Perfect for your morning toast.', price: 1199, imageUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=400&fit=crop', isAvailable: true, createdAt: new Date(), updatedAt: new Date(), category: 'Jams' },
  { id: '7', name: 'Blueberry Jam', description: 'Sweet blueberry jam made with handpicked berries. A family favorite for generations.', price: 1199, imageUrl: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400&h=400&fit=crop', isAvailable: true, createdAt: new Date(), updatedAt: new Date(), category: 'Jams' },
  { id: '8', name: 'Apple Jam', description: 'Unique apple jam with hints of cinnamon. Ilene\'s special recipe passed down through generations.', price: 1099, imageUrl: 'https://images.unsplash.com/photo-1603312675949-d4e18f6a1f5a?w=400&h=400&fit=crop', isAvailable: true, createdAt: new Date(), updatedAt: new Date(), category: 'Jams' },
  { id: '9', name: 'Pickled Green Beans', description: 'Crisp, tangy pickled green beans. A delicious addition to any meal or charcuterie board.', price: 999, imageUrl: 'https://images.unsplash.com/photo-1592870449490-29d5c982b2de?w=400&h=400&fit=crop', isAvailable: true, createdAt: new Date(), updatedAt: new Date(), category: 'Pickled' },
  { id: '10', name: 'Classic Dill Pickles', description: 'Crunchy dill pickles with the perfect balance of tangy and savory flavors.', price: 999, imageUrl: 'https://images.unsplash.com/photo-1589621316382-008455b857cd?w=400&h=400&fit=crop', isAvailable: true, createdAt: new Date(), updatedAt: new Date(), category: 'Pickled' },
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

