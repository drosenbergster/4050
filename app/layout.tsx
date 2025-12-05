import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/app/context/cart-context";
import Navbar from "@/app/components/navbar";
import CartSidebar from "@/app/components/cart-sidebar";
import Link from "next/link";
import { Leaf, Mail, MapPin } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "4050 - Ilene's Homegrown Goodness",
  description: "Homemade applesauce, jams, and preserves. 100% of profits support community causes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased`}
      >
        <CartProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <CartSidebar />
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
        </CartProvider>
      </body>
    </html>
  );
}
