'use client';

import Navbar from "@/app/components/navbar";
import BasketSidebar from "@/app/components/basket-sidebar";
import Toast from "@/app/components/toast";
import { useBasket } from "@/app/context/basket-context";
import Link from "next/link";
import { Leaf, Mail, MapPin } from "lucide-react";

export default function RootContent({ children }: { children: React.ReactNode }) {
  const { toast, hideToast } = useBasket();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <BasketSidebar />
      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#5C4A3D] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#4A7C59] rounded-full flex items-center justify-center">
                  <Leaf size={18} className="text-white" />
                </div>
                <span className="text-xl font-serif font-bold">4050</span>
              </div>
              <p className="text-[#D4C5B9] text-sm">
                Homemade goodness supporting community causes, one jar at a time.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <div className="flex flex-col space-y-2">
                <Link href="/" className="text-[#D4C5B9] hover:text-white transition-colors text-sm">
                  Home
                </Link>
                <Link href="/about" className="text-[#D4C5B9] hover:text-white transition-colors text-sm">
                  About Us
                </Link>
                <Link href="/shop" className="text-[#D4C5B9] hover:text-white transition-colors text-sm">
                  Products
                </Link>
                <Link href="/#impact" className="text-[#D4C5B9] hover:text-white transition-colors text-sm">
                  Our Impact
                </Link>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <div className="flex flex-col space-y-3">
                <div className="flex items-center gap-2 text-sm text-[#D4C5B9]">
                  <Mail size={16} />
                  <span>hello@4050goods.com</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#D4C5B9]">
                  <MapPin size={16} />
                  <span>Local Community Kitchen</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[#7A6B5D] pt-6 text-center">
            <p className="text-[#D4C5B9] text-sm">
              © {new Date().getFullYear()} 4050. Made with love for the community.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
