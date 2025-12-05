import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/app/context/cart-context";
import Navbar from "@/app/components/navbar";
import CartSidebar from "@/app/components/cart-sidebar";

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
  title: "4050 - Homemade Goods",
  description: "Handcrafted, homegrown produce and goods from our family to yours.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased font-sans text-[#2C3E50] bg-white`}
      >
        <CartProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <CartSidebar />
            <main className="flex-grow">
              {children}
            </main>
            <footer className="bg-[#2C3E50] text-white py-8 mt-auto">
              <div className="container mx-auto px-4 text-center">
                <p className="font-serif text-lg mb-2">4050</p>
                <p className="text-sm text-gray-300">© {new Date().getFullYear()} 4050. All rights reserved.</p>
              </div>
            </footer>
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
