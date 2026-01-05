'use client';

import { useMemo, useState } from 'react';
import { Minus, Plus, Check } from 'lucide-react';
import { useBasket } from '@/app/context/basket-context';
import { formatPrice } from '@/lib/format';
import type { ProductSizeOption } from './page';

// Product shape from the page
interface ProductData {
  id: string;
  name: string;
  fullName: string;
  description: string;
  imageUrl: string;
  isAvailable: boolean;
}

interface PurchaseOptionsProps {
  product: ProductData;
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

  const unitPrice = selected?.unitPrice ?? 0;
  const variantLabel = selected?.label;
  const variantKey = selected?.key;
  const stockAvailable = selected?.quantity ?? 0;

  // Prevent ordering more than available stock
  const maxQuantity = stockAvailable;
  const canIncrease = quantity < maxQuantity;

  const handleAdd = () => {
    if (quantity > stockAvailable) return;
    
    setIsAdding(true);
    // Create a product-like object for the basket
    const productForBasket = {
      id: product.id,
      name: product.fullName,
      description: product.description,
      price: unitPrice,
      imageUrl: product.imageUrl,
      category: null,
      isAvailable: product.isAvailable,
      quantity: stockAvailable,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    addToBasket(productForBasket, quantity, { variantKey, variantLabel, unitPrice });
    setTimeout(() => {
      setIsAdding(false);
      setQuantity(1);
    }, 1500);
  };

  if (sizes.length === 0) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
        This product is currently out of stock.
      </div>
    );
  }

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
            const lowStock = s.quantity > 0 && s.quantity <= 3;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => {
                  setSelectedKey(s.key);
                  setQuantity(1); // Reset quantity when changing size
                }}
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
                  <div>
                    <div className="font-medium text-[#5C4A3D]">{s.label}</div>
                    {lowStock && (
                      <div className="text-xs text-amber-600">Only {s.quantity} left</div>
                    )}
                  </div>
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
            onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
            className="p-2 text-[#636E72] hover:text-[#5C4A3D] transition-colors disabled:opacity-40"
            disabled={disabled || isAdding || !canIncrease}
            aria-label="Increase quantity"
          >
            <Plus size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled || isAdding || quantity > stockAvailable}
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


