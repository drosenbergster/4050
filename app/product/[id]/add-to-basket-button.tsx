'use client';

import { useState } from 'react';
import { useBasket } from '@/app/context/basket-context';
import { Product } from '@/lib/types';
import { Plus, Check, Minus } from 'lucide-react';

interface AddToBasketButtonProps {
  product: Product;
}

export default function AddToBasketButton({ product }: AddToBasketButtonProps) {
  const { addToBasket } = useBasket();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToBasket = () => {
    setIsAdding(true);
    addToBasket(product, quantity);
    setTimeout(() => {
      setIsAdding(false);
      setQuantity(1);
    }, 2000);
  };

  return (
    <div className="flex items-center gap-3">
      {/* Quantity Selector */}
      <div className="flex items-center border border-[#E5DDD3] rounded-lg">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="p-2 text-[#636E72] hover:text-[#5C4A3D] transition-colors"
          disabled={quantity <= 1}
        >
          <Minus size={16} />
        </button>
        <span className="w-10 text-center font-medium text-[#5C4A3D]">
          {quantity}
        </span>
        <button
          onClick={() => setQuantity(quantity + 1)}
          className="p-2 text-[#636E72] hover:text-[#5C4A3D] transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Add Button */}
      <button
        onClick={handleAddToBasket}
        disabled={!product.isAvailable || isAdding}
        className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-medium transition-all ${
          isAdding
            ? 'bg-[#4A7C59] text-white'
            : 'bg-[#5C4A3D] text-white hover:bg-[#4A7C59]'
        } disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {isAdding ? (
          <>
            <Check size={18} strokeWidth={2.5} />
            <span>Added to Basket!</span>
          </>
        ) : (
          <>
            <Plus size={18} strokeWidth={2} />
            <span>Add to Basket</span>
          </>
        )}
      </button>
    </div>
  );
}


