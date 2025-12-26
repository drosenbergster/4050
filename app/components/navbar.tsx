'use client';

import Link from 'next/link';
import { ShoppingBasket, Menu, X, Leaf } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useBasket } from '@/app/context/basket-context';

export default function Navbar() {
  const { toggleBasket, itemCount } = useBasket();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="bg-[#FDF8F3] border-b border-[#E5DDD3] sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#4A7C59] rounded-full flex items-center justify-center">
              <Leaf size={18} className="text-white" />
            </div>
            <span className="text-2xl font-serif font-bold text-[#5C4A3D]">4050</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-[#636E72] hover:text-[#4A7C59] transition-colors font-medium">
              Home
            </Link>
            <Link href="/about" className="text-[#636E72] hover:text-[#4A7C59] transition-colors font-medium">
              About
            </Link>
            <Link href="/shop" className="text-[#636E72] hover:text-[#4A7C59] transition-colors font-medium">
              Products
            </Link>
            <Link href="/#impact" className="text-[#636E72] hover:text-[#4A7C59] transition-colors font-medium">
              Our Impact
            </Link>
            <button
              onClick={toggleBasket}
              className="flex items-center gap-2 bg-[#4A7C59] text-white px-4 py-2 rounded-lg hover:bg-[#3D6649] transition-colors"
              aria-label="Open basket"
            >
              <ShoppingBasket size={18} />
              <span>Basket</span>
              {mounted && itemCount > 0 && (
                <span className="bg-white text-[#4A7C59] text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={toggleBasket}
              className="relative p-2 text-[#5C4A3D] hover:text-[#4A7C59] transition-colors"
            >
              <ShoppingBasket size={24} />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#4A7C59] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-[#5C4A3D] hover:text-[#4A7C59]"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-[#FDF8F3] border-t border-[#E5DDD3] ${
          isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="container mx-auto px-4 py-6 flex flex-col space-y-5">
          <Link
            href="/"
            className="text-[#636E72] hover:text-[#4A7C59] text-xl font-serif font-bold transition-colors active:translate-x-1 duration-200"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/about"
            className="text-[#636E72] hover:text-[#4A7C59] text-xl font-serif font-bold transition-colors active:translate-x-1 duration-200"
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </Link>
          <Link
            href="/shop"
            className="text-[#636E72] hover:text-[#4A7C59] text-xl font-serif font-bold transition-colors active:translate-x-1 duration-200"
            onClick={() => setIsMenuOpen(false)}
          >
            Products
          </Link>
          <Link
            href="/#impact"
            className="text-[#636E72] hover:text-[#4A7C59] text-xl font-serif font-bold transition-colors active:translate-x-1 duration-200"
            onClick={() => setIsMenuOpen(false)}
          >
            Our Impact
          </Link>
        </div>
      </div>
    </nav>
  );
}
