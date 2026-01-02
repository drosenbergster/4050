'use client';

import { useMemo, useState } from 'react';
import { Minus, Plus, Check } from 'lucide-react';
import { useBasket } from '@/app/context/basket-context';
import { Product } from '@/lib/types';
import type { ProductSizeOption } from '@/lib/product-details';
import { formatPrice } from '@/lib/format';

interface PurchaseOptionsProps {
  product: Product;
  sizes: ProductSizeOption[];
  disabled?: boolean;
}

export default function PurchaseOptions({ product, sizes, disabled }: PurchaseOptionsProps) {
  const { addToBasket } = useBasket();
  const [quantity, setQuantity] = useState(1);
  const [selectedKey, setSelectedKey] = useState(sizes[0]?.key ?? 'default');
  const [isAdding, setIsAdding] = useState(false);

  const selected = useMemo(() => {
    return sizes.find((s) => s.key === selectedKey) ?? sizes[0];
  }, [sizes, selectedKey]);

  const unitPrice = selected?.unitPrice ?? product.price;
  const variantLabel = selected?.label;
  const variantKey = selected?.key;

  const handleAdd = () => {
    setIsAdding(true);
    addToBasket(product, quantity, { variantKey, variantLabel, unitPrice });
    setTimeout(() => {
      setIsAdding(false);
      setQuantity(1);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      {/* Sizes */}
      <div>
        <div className="text-sm font-bold text-[#5C4A3D] uppercase tracking-wide mb-2">
          Choose a size
        </div>
        <div className="grid gap-2">
          {sizes.map((s) => {
            const active = s.key === selectedKey;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setSelectedKey(s.key)}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors text-left ${
                  active
                    ? 'border-[#4A7C59] bg-[#E8F0EA]/40'
                    : 'border-[#E5DDD3] bg-[#FDF8F3] hover:border-[#4A7C59]/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full border ${
                      active ? 'border-[#4A7C59] bg-[#4A7C59]' : 'border-[#8B7355]'
                    }`}
                    aria-hidden="true"
                  />
                  <div className="font-medium text-[#5C4A3D]">{s.label}</div>
                </div>
                <div className="font-bold text-[#4A7C59]">{formatPrice(s.unitPrice)}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantity + Add */}
      <div className="flex items-center gap-3">
        <div className="flex items-center border border-[#E5DDD3] rounded-lg bg-white">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-2 text-[#636E72] hover:text-[#5C4A3D] transition-colors disabled:opacity-40"
            disabled={quantity <= 1 || disabled || isAdding}
            aria-label="Decrease quantity"
          >
            <Minus size={16} />
          </button>
          <span className="w-10 text-center font-medium text-[#5C4A3D] tabular-nums">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="p-2 text-[#636E72] hover:text-[#5C4A3D] transition-colors disabled:opacity-40"
            disabled={disabled || isAdding}
            aria-label="Increase quantity"
          >
            <Plus size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled || isAdding}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-lg font-medium transition-all ${
            isAdding ? 'bg-[#4A7C59] text-white' : 'bg-[#5C4A3D] text-white hover:bg-[#4A7C59]'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {isAdding ? (
            <>
              <Check size={18} strokeWidth={2.5} />
              <span>Added</span>
            </>
          ) : (
            <>
              <span>Add to Basket</span>
              <span className="opacity-90">•</span>
              <span className="font-bold">{formatPrice(unitPrice * quantity)}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}


