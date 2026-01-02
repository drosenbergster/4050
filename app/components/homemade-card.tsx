'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useBasket } from '@/app/context/basket-context';
import { Product } from '@/lib/types';
import { Plus, Check } from 'lucide-react';
import { formatPrice } from '@/lib/format';

interface ProductCardProps {
  product: Product;
}

export default function HomemadeCard({ product }: ProductCardProps) {
  const { addToBasket } = useBasket();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToBasket = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    addToBasket(product, 1);
    setTimeout(() => setIsAdding(false), 2000);
  };

  return (
    <div className="group relative bg-[#FDF8F3] overflow-hidden border-b border-r border-[#E5DDD3] hover:bg-white transition-all duration-300 flex flex-col h-full">
      {/* Clickable Product Link */}
      <Link href={`/product/${product.id}`} className="flex flex-col h-full p-3 sm:p-4">
        {/* Product Image */}
        <div className="relative aspect-square mb-2 overflow-hidden bg-[#F5EDE4] rounded-sm">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#8B7355] font-serif opacity-20">
              4050
            </div>
          )}
          
          {/* Hover Description Overlay */}
          <div className="absolute inset-0 bg-[#5C4A3D]/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
            <p className="text-white text-[11px] leading-relaxed text-center font-serif italic">
              {product.description}
            </p>
          </div>
          
          {/* Availability Overlay */}
          {!product.isAvailable && (
            <div className="absolute inset-0 bg-[#FDF8F3]/80 backdrop-blur-[1px] flex items-center justify-center">
              <span className="text-[#5C4A3D] text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] border-y border-[#5C4A3D] py-1 px-2">
                Currently Out
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col flex-grow">
          <div className="flex justify-between items-start gap-2 mb-2">
            <h3 className="text-sm sm:text-base font-serif font-bold text-[#5C4A3D] leading-tight group-hover:text-[#4A7C59] transition-colors">
              {product.name}
            </h3>
            <span className="text-xs sm:text-sm font-medium text-[#8B7355] whitespace-nowrap">
              {formatPrice(product.price)}
            </span>
          </div>
        </div>
      </Link>

      {/* Add Button - Outside of Link */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4">
        <button
          onClick={handleAddToBasket}
          disabled={!product.isAvailable || isAdding}
          className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-full transition-all duration-300 active:scale-95 touch-manipulation font-medium text-xs sm:text-sm ${
            isAdding 
              ? 'bg-[#4A7C59] text-white' 
              : 'bg-[#5C4A3D] text-white hover:bg-[#4A7C59]'
          } disabled:opacity-30 disabled:cursor-not-allowed`}
          aria-label="Add to basket"
        >
          {isAdding ? (
            <>
              <Check size={14} strokeWidth={2.5} />
              <span>Added!</span>
            </>
          ) : (
            <>
              <Plus size={14} strokeWidth={2} />
              <span>Add</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
