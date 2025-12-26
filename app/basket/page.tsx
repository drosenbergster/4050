'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useBasket } from '@/app/context/basket-context';
import { Trash2, Minus, Plus, ArrowRight, ShoppingBasket } from 'lucide-react';

export default function BasketPage() {
    const { items, updateQuantity, subtotal, removeFromBasket } = useBasket();

    // Helper to format price in cents to dollars
    const formatPrice = (cents: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(cents / 100);
    };

    if (items.length === 0) {
        return (
            <main className="bg-[#FDF8F3] min-h-screen py-20 px-4">
                <div className="container mx-auto max-w-2xl text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="bg-white p-6 rounded-full shadow-sm">
                            <ShoppingBasket className="w-12 h-12 text-[#8B7355]" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-[#5C4A3D] mb-4">
                        Your Basket is Empty
                    </h1>
                    <p className="text-[#636E72] mb-8 text-lg">
                        Looks like you haven’t added any delicious homemade treats yet.
                    </p>
                    <Link
                        href="/shop"
                        className="inline-flex items-center px-8 py-3 bg-[#E67E22] text-white rounded-lg hover:bg-[#D35400] transition-colors font-medium shadow-sm hover:shadow-md"
                    >
                        Start Shopping
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="bg-[#FDF8F3] min-h-screen py-12 px-4">
            <div className="container mx-auto max-w-5xl">
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#5C4A3D] mb-8">
                    Your Basket ({items.length} items)
                </h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Basket Items List */}
                    <div className="flex-grow">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="p-6 space-y-6">
                                {items.map((item) => (
                                    <div key={item.productId} className="flex flex-col sm:flex-row gap-6 py-6 border-b border-[#F0E6D2] last:border-0 last:pb-0 first:pt-0">
                                        {/* Product Image */}
                                        <div className="relative w-full sm:w-32 h-32 flex-shrink-0 bg-[#F5EDE4] rounded-lg overflow-hidden">
                                            <Image
                                                src={item.product.imageUrl || 'https://placehold.co/400x400/F5EDE4/8B7355?text=Product'}
                                                alt={item.product.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-grow flex flex-col justify-between">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="text-lg font-bold text-[#5C4A3D] mb-1">
                                                        {item.product.name}
                                                    </h3>
                                                    <p className="text-sm text-[#636E72] mb-2 line-clamp-1">
                                                        {item.product.description}
                                                    </p>
                                                    <div className="text-[#E67E22] font-medium">
                                                        {formatPrice(item.product.price)}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeFromBasket(item.productId)}
                                                    className="text-[#95A5A6] hover:text-[#C0392B] transition-colors p-1"
                                                    aria-label="Remove item"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>

                                            {/* Quantity and Total */}
                                            <div className="flex justify-between items-end">
                                                <div className="flex items-center border border-[#D5D8DC] rounded-lg bg-gray-50">
                                                    <button
                                                        onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                                                        className="p-2 text-[#5C4A3D] hover:bg-gray-100 rounded-l-lg transition-colors"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <span className="w-10 text-center font-medium text-[#5C4A3D]">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                        className="p-2 text-[#5C4A3D] hover:bg-gray-100 rounded-r-lg transition-colors"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                                <div className="font-bold text-lg text-[#5C4A3D]">
                                                    {formatPrice(item.lineTotal)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="w-full lg:w-96 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-[#5C4A3D] mb-6">Order Summary</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-[#636E72]">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-[#5C4A3D]">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-[#636E72]">
                                    <span>Shipping</span>
                                    <span className="text-sm italic">Calculated at checkout</span>
                                </div>
                            </div>

                            <div className="border-t border-[#F0E6D2] pt-4 mb-8">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-[#5C4A3D]">Total</span>
                                    <span className="text-2xl font-bold text-[#E67E22]">{formatPrice(subtotal)}</span>
                                </div>
                                <p className="text-xs text-[#95A5A6] mt-1 text-right">
                                    Including pickup options
                                </p>
                            </div>

                            <Link
                                href="/checkout"
                                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#27AE60] text-white rounded-lg hover:bg-[#219150] transition-colors font-bold shadow-md hover:shadow-lg transform active:scale-[0.98] transition-all"
                            >
                                Proceed to Checkout
                                <ArrowRight size={20} />
                            </Link>

                            <div className="mt-6 text-center">
                                <Link href="/shop" className="text-sm text-[#636E72] hover:text-[#5C4A3D] underline">
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
