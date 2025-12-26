'use client';

import { useState, useMemo } from 'react';
import { Product } from '@/lib/types';
import HomemadeCard from './homemade-card';
import { Search } from 'lucide-react';

interface ProductGridWithFiltersProps {
  products: (Product & { category: string })[];
}

const CATEGORIES = ['All', 'Applesauces', 'Spreads', 'Dried Goods', 'Jams', 'Pickled Goods'];

export default function ProductGridWithFilters({ products }: ProductGridWithFiltersProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  return (
    <div className="space-y-8 sm:space-y-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-1 sm:px-0">
        {/* Category Filter Tabs */}
        <nav aria-label="Product categories" className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              aria-current={activeCategory === category ? 'page' : undefined}
              className={`px-4 sm:px-5 py-2.5 sm:py-2 rounded-full text-[13px] sm:text-sm font-medium transition-all active:scale-95 touch-manipulation ${activeCategory === category
                  ? 'bg-[#4A7C59] text-white shadow-sm'
                  : 'bg-white text-[#636E72] hover:bg-[#E8F0EA] border border-[#E5DDD3]'
                }`}
            >
              {category}
            </button>
          ))}
        </nav>

        {/* Search Bar */}
        <div className="relative w-full md:max-w-xs group">
          <label htmlFor="product-search" className="sr-only">Search products</label>
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8B7355] transition-colors group-focus-within:text-[#4A7C59]">
            <Search size={18} />
          </div>
          <input
            id="product-search"
            type="search"
            placeholder="Search our harvest..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 sm:py-2 bg-white border border-[#E5DDD3] rounded-full text-[15px] sm:text-sm text-[#5C4A3D] placeholder-[#8B7355]/40 focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/30 focus:border-[#4A7C59] transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div 
        role="region" 
        aria-label="Products list"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 border-t border-l border-[#E5DDD3] mx-[-1rem] sm:mx-0"
      >
        {filteredProducts.map((product) => (
          <HomemadeCard key={product.id} product={product} />
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

