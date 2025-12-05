'use client';

import { useState } from 'react';
import { Product } from '@/lib/types';
import ProductCardNew from './product-card-new';

interface ProductGridWithFiltersProps {
  products: (Product & { category: string })[];
}

const CATEGORIES = ['All', 'Applesauce', 'Spreads', 'Dried Goods', 'Jams', 'Pickled'];

export default function ProductGridWithFilters({ products }: ProductGridWithFiltersProps) {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory);

  return (
    <div>
      {/* Category Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === category
                ? 'bg-[#4A7C59] text-white'
                : 'bg-white text-[#636E72] hover:bg-[#E8F0EA] border border-[#E5DDD3]'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCardNew key={product.id} product={product} />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-[#636E72]">
          No products found in this category.
        </div>
      )}
    </div>
  );
}

