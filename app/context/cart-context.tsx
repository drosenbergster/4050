'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
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

const STORAGE_KEY = '4050_cart';

const initialState: CartState = {
  items: [],
  subtotal: 0,
  itemCount: 0,
};

// Helper function to load cart from localStorage
function loadCartFromStorage(): CartState {
  if (typeof window === 'undefined') return initialState;
  
  try {
    const savedCart = localStorage.getItem(STORAGE_KEY);
    if (savedCart) {
      const parsed = JSON.parse(savedCart);
      const items = parsed.items || [];
      const subtotal = items.reduce((sum: number, item: CartItemWithProduct) => sum + (item.product.price * item.quantity), 0);
      const itemCount = items.reduce((count: number, item: CartItemWithProduct) => count + item.quantity, 0);
      return { items, subtotal, itemCount };
    }
  } catch {
    console.error('Failed to load cart from localStorage');
  }
  return initialState;
}

// Helper function to save cart to localStorage
function saveCartToStorage(state: CartState): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  // Initialize with a function to avoid SSR issues - the function only runs on client
  const [state, setState] = useState<CartState>(() => {
    if (typeof window !== 'undefined') {
      return loadCartFromStorage();
    }
    return initialState;
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const isMountedRef = useRef(false);

  // Mark as mounted after first render and sync localStorage
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      // Re-load from storage in case SSR had different data
      const stored = loadCartFromStorage();
      if (JSON.stringify(stored) !== JSON.stringify(state)) {
        setState(stored);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save to localStorage when state changes (skip initial mount)
  useEffect(() => {
    if (isMountedRef.current) {
      saveCartToStorage(state);
    }
  }, [state]);

  const addToCart = useCallback((product: Product, quantity: number) => {
    setState((prev) => {
      const existingItemIndex = prev.items.findIndex((item) => item.productId === product.id);
      let newItems;

      if (existingItemIndex >= 0) {
        newItems = [...prev.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity,
          lineTotal: (newItems[existingItemIndex].quantity + quantity) * product.price
        };
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
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setState((prev) => {
      const newItems = prev.items.filter((item) => item.productId !== productId);
      const subtotal = newItems.reduce((sum, item) => sum + item.lineTotal, 0);
      const itemCount = newItems.reduce((count, item) => count + item.quantity, 0);
      return { items: newItems, subtotal, itemCount };
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setState((prev) => {
      let newItems;
      if (quantity <= 0) {
        newItems = prev.items.filter((item) => item.productId !== productId);
      } else {
        newItems = prev.items.map((item) =>
          item.productId === productId 
            ? { ...item, quantity, lineTotal: quantity * item.product.price } 
            : item
        );
      }

      const subtotal = newItems.reduce((sum, item) => sum + item.lineTotal, 0);
      const itemCount = newItems.reduce((count, item) => count + item.quantity, 0);
      
      return { items: newItems, subtotal, itemCount };
    });
  }, []);

  const clearCart = useCallback(() => {
    setState(initialState);
  }, []);

  const toggleCart = useCallback(() => {
    setIsCartOpen((prev) => !prev);
  }, []);

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
