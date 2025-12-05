'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItemWithProduct, Product } from '@/lib/types';

interface CartState {
  items: CartItemWithProduct[];
  subtotal: number;
  itemCount: number;
}

interface CartContextType extends CartState {
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const initialState: CartState = {
  items: [],
  subtotal: 0,
  itemCount: 0,
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>(initialState);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('4050_cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        // Recalculate totals to be safe
        const items = parsed.items || [];
        const subtotal = items.reduce((sum: number, item: CartItemWithProduct) => sum + (item.product.price * item.quantity), 0);
        const itemCount = items.reduce((count: number, item: CartItemWithProduct) => count + item.quantity, 0);
        
        setState({ items, subtotal, itemCount });
      } catch (e) {
        console.error('Failed to parse cart from local storage', e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('4050_cart', JSON.stringify(state));
    }
  }, [state, isInitialized]);

  const addToCart = (product: Product, quantity: number) => {
    setState((prev) => {
      const existingItemIndex = prev.items.findIndex((item) => item.productId === product.id);
      let newItems;

      if (existingItemIndex >= 0) {
        newItems = [...prev.items];
        newItems[existingItemIndex].quantity += quantity;
        newItems[existingItemIndex].lineTotal = newItems[existingItemIndex].quantity * product.price;
      } else {
        newItems = [
          ...prev.items,
          { 
            productId: product.id, 
            quantity, 
            product, 
            lineTotal: quantity * product.price 
          }
        ];
      }

      const subtotal = newItems.reduce((sum, item) => sum + item.lineTotal, 0);
      const itemCount = newItems.reduce((count, item) => count + item.quantity, 0);

      return { items: newItems, subtotal, itemCount };
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setState((prev) => {
      const newItems = prev.items.filter((item) => item.productId !== productId);
      const subtotal = newItems.reduce((sum, item) => sum + item.lineTotal, 0);
      const itemCount = newItems.reduce((count, item) => count + item.quantity, 0);
      return { items: newItems, subtotal, itemCount };
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setState((prev) => {
      if (quantity <= 0) {
        const newItems = prev.items.filter((item) => item.productId !== productId);
        const subtotal = newItems.reduce((sum, item) => sum + item.lineTotal, 0);
        const itemCount = newItems.reduce((count, item) => count + item.quantity, 0);
        return { items: newItems, subtotal, itemCount };
      }

      const newItems = prev.items.map((item) =>
        item.productId === productId 
          ? { ...item, quantity, lineTotal: quantity * item.product.price } 
          : item
      );

      const subtotal = newItems.reduce((sum, item) => sum + item.lineTotal, 0);
      const itemCount = newItems.reduce((count, item) => count + item.quantity, 0);
      
      return { items: newItems, subtotal, itemCount };
    });
  };

  const clearCart = () => {
    setState(initialState);
  };

  const toggleCart = () => {
    setIsCartOpen((prev) => !prev);
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
