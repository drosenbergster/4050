'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  flavorCount: number;
  productCount: number;
  firstProductImage: string | null;
}

// Fallback image if no product images exist
const defaultFallbackImage = 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&h=800&fit=crop&q=80';

// Category accent colors for hover effect
const categoryAccentColors: Record<string, string> = {
  'Applesauce': 'bg-amber-500',
  'Jams and Spreads': 'bg-rose-500',
  'Dried Goods': 'bg-orange-500',
  'Pickles': 'bg-emerald-500',
};

export default function CategoryCards() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/catalog');
        if (res.ok) {
          const data = await res.json();
          // Transform to get categories with product counts and first product image
          const cats: Category[] = (data.categoriesWithStock || []).map((cat: {
            id: string;
            name: string;
            description: string | null;
            imageUrl: string | null;
            flavors: Array<{ imageUrl: string | null; sizes: Array<{ quantity: number }> }>;
          }) => {
            // Find the first product with an image
            const firstProductWithImage = cat.flavors.find(f => f.imageUrl);
            
            return {
              id: cat.id,
              name: cat.name,
              description: cat.description,
              imageUrl: cat.imageUrl,
              flavorCount: cat.flavors.length,
              productCount: cat.flavors.reduce((sum, f) => 
                sum + f.sizes.reduce((s, size) => s + size.quantity, 0), 0
              ),
              firstProductImage: firstProductWithImage?.imageUrl || null,
            };
          });
          setCategories(cats);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-[4/5] rounded-2xl bg-[#F5EDE4] animate-pulse" />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#636E72]">No products available yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
      {categories.map((category) => {
        const accentColor = categoryAccentColors[category.name] || 'bg-stone-500';
        // Use: 1) category image, 2) first product image, 3) fallback
        const imageUrl = category.imageUrl || category.firstProductImage || defaultFallbackImage;
        
        return (
          <Link
            key={category.id}
            href={`/shop?category=${encodeURIComponent(category.name)}`}
            className="group relative aspect-[4/5] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <Image
                src={imageUrl}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
                unoptimized
              />
              {/* Subtle vignette overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>

            {/* Content - with background for readability */}
            <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 bg-gradient-to-t from-black/90 via-black/70 to-transparent pt-16">
              {/* Category Name */}
              <h3 className="text-xl md:text-2xl font-serif font-bold text-[#FDF8F3] mb-1.5">
                {category.name}
              </h3>

              {/* View Products Link */}
              <div className="flex items-center gap-1 text-[#FDF8F3]/80 text-sm font-medium group-hover:text-[#FDF8F3] transition-colors">
                <span>View products</span>
                <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Hover Accent Line */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 ${accentColor} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
          </Link>
        );
      })}
    </div>
  );
}

