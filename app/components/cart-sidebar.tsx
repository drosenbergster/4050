'use client';

import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/app/context/cart-context';
import Image from 'next/image';
import { useEffect } from 'react';

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function CartSidebar() {
  const {
    isCartOpen,
    toggleCart,
    items,
    updateQuantity,
    removeFromCart,
    subtotal,
    itemCount
  } = useCart();

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  return (
    <>
      {/* Backdrop */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 transition-opacity"
          onClick={toggleCart}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full md:w-[420px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#E5DDD3] flex items-center justify-between bg-[#FDF8F3]">
            <h2 className="text-xl font-serif font-bold text-[#5C4A3D]">
              Your Cart ({itemCount})
            </h2>
            <button
              onClick={toggleCart}
              className="p-2 text-[#636E72] hover:text-[#5C4A3D] transition-colors rounded-full hover:bg-[#E5DDD3]"
            >
              <X size={24} />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-20 h-20 bg-[#F5EDE4] rounded-full flex items-center justify-center text-[#8B7355]">
                  <X size={36} />
                </div>
                <p className="text-[#636E72] text-lg">Your cart is empty</p>
                <button
                  onClick={toggleCart}
                  className="text-[#4A7C59] font-medium underline hover:text-[#3D6649]"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.productId} className="flex gap-4 pb-6 border-b border-[#E5DDD3] last:border-b-0">
                  <div className="relative w-20 h-20 bg-[#F5EDE4] rounded-xl overflow-hidden flex-shrink-0">
                    {item.product.imageUrl ? (
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#8B7355] text-xs">
                        No Img
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif font-bold text-[#5C4A3D]">{item.product.name}</h3>
                      <p className="text-sm text-[#636E72]">
                        {formatPrice(item.product.price)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-[#E5DDD3] rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-2 hover:bg-[#F5EDE4] text-[#636E72] transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-3 text-sm min-w-[2rem] text-center font-medium text-[#5C4A3D]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-2 hover:bg-[#F5EDE4] text-[#636E72] transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-red-400 hover:text-red-600 p-2 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-[#E5DDD3] p-6 bg-[#FDF8F3]">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[#636E72] font-medium">Subtotal</span>
                <span className="text-2xl font-bold text-[#5C4A3D]">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="text-xs text-[#636E72] mb-4 text-center">
                Shipping and taxes calculated at checkout.
              </p>
              <button className="w-full bg-[#4A7C59] text-white py-3.5 px-4 rounded-lg font-medium hover:bg-[#3D6649] transition-colors text-lg">
                Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
