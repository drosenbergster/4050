'use client';

import Image from 'next/image';
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

  const handleAddToBasket = () => {
    setIsAdding(true);
    addToBasket(product, 1);
    setTimeout(() => setIsAdding(false), 2000);
  };

  return (
    <div className="group relative bg-[#FDF8F3] overflow-hidden border-b border-r border-[#E5DDD3] hover:bg-white transition-all duration-500 flex flex-col h-full p-4 sm:p-6">
      {/* Product Image - "Real Life" Style */}
      <div className="relative aspect-[4/5] mb-4 sm:mb-6 overflow-hidden bg-[#F5EDE4] shadow-inner rounded-sm">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#8B7355] font-serif opacity-20">
            4050
          </div>
        )}
        
        {/* Availability Overlay */}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-[#FDF8F3]/80 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-[#5C4A3D] text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] border-y border-[#5C4A3D] py-1">
              Currently Out
            </span>
          </div>
        )}
      </div>

      {/* Product Info - "Kitchen Journal" Typography */}
      <div className="flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="text-lg sm:text-xl font-serif font-bold text-[#5C4A3D] leading-tight group-hover:text-[#4A7C59] transition-colors">
            {product.name}
          </h3>
          <span className="text-sm sm:text-base font-medium text-[#8B7355] pt-0.5">
            {formatPrice(product.price)}
          </span>
        </div>
        
        <p className="text-[#636E72] text-[13px] sm:text-sm leading-relaxed font-serif italic opacity-80 mb-4 sm:mb-6 flex-grow">
          {product.description}
        </p>

        {/* Action Area - Clear Add to Basket Button */}
        <div className="flex items-center justify-end">
          <button
            onClick={handleAddToBasket}
            disabled={!product.isAvailable || isAdding}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 active:scale-95 touch-manipulation font-medium text-sm ${
              isAdding 
                ? 'bg-[#4A7C59] text-white' 
                : 'bg-[#5C4A3D] text-white hover:bg-[#4A7C59]'
            } disabled:opacity-30 disabled:cursor-not-allowed`}
            aria-label="Add to basket"
          >
            {isAdding ? (
              <>
                <Check size={16} strokeWidth={2.5} />
                <span>Added!</span>
              </>
            ) : (
              <>
                <Plus size={16} strokeWidth={2} />
                <span>Add to Basket</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Subtle Texture/Grain Overlay to give it that "Kitchen Journal" paper feel */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/felt.png')]"></div>
    </div>
  );
}

