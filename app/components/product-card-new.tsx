'use client';

import { Product } from '@/lib/types';
import Image from 'next/image';
import { useCart } from '@/app/context/cart-context';
import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { formatPrice } from '@/lib/format';

interface ProductCardNewProps {
  product: Product & { category: string };
}

export default function ProductCardNew({ product }: ProductCardNewProps) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(product, 1);
    setTimeout(() => setIsAdding(false), 800);
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 border border-[#E5DDD3] flex flex-col">
      {/* Image Container */}
      <div className="relative aspect-square bg-[#F5EDE4] overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="flex items-center justify-center h-full text-[#8B7355]">
            No Image
          </div>
        )}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white px-4 py-2 text-sm font-bold rounded-full uppercase tracking-wide text-[#5C4A3D]">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Category Tag */}
        <span className="text-xs font-medium text-[#4A7C59] uppercase tracking-wider mb-2">
          {product.category}
        </span>

        {/* Product Name */}
        <h3 className="text-lg font-serif font-bold text-[#5C4A3D] mb-2">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-[#636E72] line-clamp-2 mb-4 flex-grow">
          {product.description}
        </p>

        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E5DDD3]">
          <span className="text-xl font-bold text-[#5C4A3D]">
            {formatPrice(product.price)}
          </span>

          <button
            onClick={handleAddToCart}
            disabled={!product.isAvailable}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${product.isAvailable
                ? isAdding
                  ? 'bg-[#3D6649] text-white'
                  : 'bg-[#4A7C59] text-white hover:bg-[#3D6649]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
          >
            <ShoppingCart size={16} />
            {isAdding ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}

