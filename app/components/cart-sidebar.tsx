'use client';

import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/app/context/cart-context';
import Image from 'next/image';
import { formatPrice } from '@/lib/format';
import { useEffect } from 'react';

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
          className="fixed inset-0 bg-black/30 z-50 transition-opacity"
          onClick={toggleCart}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full md:w-[400px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
            <h2 className="text-xl font-serif font-medium text-[#2C3E50]">
              Your Cart ({itemCount})
            </h2>
            <button
              onClick={toggleCart}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                  <X size={32} />
                </div>
                <p className="text-gray-500 text-lg">Your cart is empty</p>
                <button
                  onClick={toggleCart}
                  className="text-[#2C3E50] font-medium underline hover:text-[#34495E]"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.productId} className="flex gap-4">
                  <div className="relative w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    {item.product.imageUrl ? (
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No Img
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-medium text-[#2C3E50]">{item.product.name}</h3>
                      <p className="text-sm text-gray-500">
                        {item.product.price === 0 ? 'TBD' : formatPrice(item.product.price)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-200 rounded-md">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-1 hover:bg-gray-50 text-gray-600"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-2 text-sm min-w-[1.5rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-1 hover:bg-gray-50 text-gray-600"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-red-400 hover:text-red-600 p-1"
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
            <div className="border-t border-gray-100 p-6 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-lg font-bold text-[#2C3E50]">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-4 text-center">
                Shipping and taxes calculated at checkout.
              </p>
              <button className="w-full bg-[#2C3E50] text-white py-3 px-4 rounded-md font-medium hover:bg-[#34495E] transition-colors">
                Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

