'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { CartItemWithProduct, Product } from '@/lib/types';

// Alias for naming consistency with "Basket" branding
type BasketItemWithProduct = CartItemWithProduct;

interface BasketState {
  items: BasketItemWithProduct[];
  subtotal: number;
  itemCount: number;
}

interface BasketContextType extends BasketState {
  addToBasket: (product: Product, quantity: number) => void;
  removeFromBasket: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearBasket: () => void;
  isBasketOpen: boolean;
  toggleBasket: () => void;
  toast: { message: string; isVisible: boolean };
  showToast: (message: string) => void;
  hideToast: () => void;
}

const BasketContext = createContext<BasketContextType | undefined>(undefined);

const STORAGE_KEY = '4050_basket';

const initialState: BasketState = {
  items: [],
  subtotal: 0,
  itemCount: 0,
};

// Helper function to load basket from localStorage
function loadBasketFromStorage(): BasketState {
  if (typeof window === 'undefined') return initialState;

  try {
    const savedBasket = localStorage.getItem(STORAGE_KEY);
    if (savedBasket) {
      const parsed = JSON.parse(savedBasket);
      const items = parsed.items || [];
      const subtotal = items.reduce((sum: number, item: BasketItemWithProduct) => sum + (item.product.price * item.quantity), 0);
      const itemCount = items.reduce((count: number, item: BasketItemWithProduct) => count + item.quantity, 0);
      return { items, subtotal, itemCount };
    }
  } catch {
    console.error('Failed to load basket from localStorage');
  }
  return initialState;
}

// Helper function to save basket to localStorage
function saveBasketToStorage(state: BasketState): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

export function BasketProvider({ children }: { children: ReactNode }) {
  // Initialize with a function to avoid SSR issues - the function only runs on client
  const [state, setState] = useState<BasketState>(() => {
    if (typeof window !== 'undefined') {
      return loadBasketFromStorage();
    }
    return initialState;
  });

  const [isBasketOpen, setIsBasketOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', isVisible: false });
  const isMountedRef = useRef(false);

  // Mark as mounted after first render and sync localStorage
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      // Re-load from storage in case SSR had different data
      const stored = loadBasketFromStorage();
      if (JSON.stringify(stored) !== JSON.stringify(state)) {
        setState(stored);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save to localStorage when state changes (skip initial mount)
  useEffect(() => {
    if (isMountedRef.current) {
      saveBasketToStorage(state);
    }
  }, [state]);

  const addToBasket = useCallback((product: Product, quantity: number) => {
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
    // Removed auto-open for better UX
    // setIsBasketOpen(true);
    setToast({ message: `Added ${quantity} ${product.name} to basket`, isVisible: true });
  }, []);

  const showToast = useCallback((message: string) => {
    setToast({ message, isVisible: true });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  }, []);

  const removeFromBasket = useCallback((productId: string) => {
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

  const clearBasket = useCallback(() => {
    setState(initialState);
  }, []);

  const toggleBasket = useCallback(() => {
    setIsBasketOpen((prev) => !prev);
  }, []);

  return (
    <BasketContext.Provider
      value={{
        ...state,
        addToBasket,
        removeFromBasket,
        updateQuantity,
        clearBasket,
        isBasketOpen,
        toggleBasket,
        toast,
        showToast,
        hideToast,
      }}
    >
      {children}
    </BasketContext.Provider>
  );
}

export function useBasket() {
  const context = useContext(BasketContext);
  if (context === undefined) {
    throw new Error('useBasket must be used within a BasketProvider');
  }
  return context;
}
