'use client';

import { Product } from '@/lib/types';
import Image from 'next/image';
import { useCart } from '@/app/context/cart-context';
import { useState } from 'react';
import { formatPrice } from '@/lib/format';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(product, 1);
    setTimeout(() => setIsAdding(false), 500);
  };

  return (
    <div className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 overflow-hidden flex flex-col h-full">
      <div className="relative aspect-square w-full bg-gray-100 overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No Image
          </div>
        )}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide text-gray-800">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-serif font-medium text-[#2C3E50] mb-1">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-grow">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
          <span className="font-medium text-lg text-[#2C3E50]">
            {product.price === 0 ? 'TBD' : formatPrice(product.price)}
          </span>
          
          <button
            onClick={handleAddToCart}
            disabled={!product.isAvailable}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
              product.isAvailable
                ? 'bg-[#2C3E50] text-white hover:bg-[#34495E] active:bg-[#2C3E50]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isAdding ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}

