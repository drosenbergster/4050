'use client';

import { useEffect, useState } from 'react';
import { ShoppingBasket, X } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, isVisible, onClose, duration = 3000 }: ToastProps) {
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible && !shouldRender) return null;

  return (
    <div
      className={`fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 w-[calc(100%-2rem)] sm:w-auto ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
      }`}
      onTransitionEnd={() => {
        if (!isVisible) setShouldRender(false);
      }}
    >
      <div className="bg-[#4A7C59] text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-2xl flex items-center gap-3 sm:gap-4 min-w-0 sm:min-w-[300px]">
        <div className="bg-white/20 p-2 rounded-full flex-shrink-0">
          <ShoppingBasket size={18} />
        </div>
        <p className="font-medium flex-grow text-sm sm:text-base truncate">{message}</p>
        <button
          onClick={onClose}
          className="hover:bg-white/10 p-1 rounded-full transition-colors flex-shrink-0"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
