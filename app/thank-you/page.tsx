'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ShoppingBasket, ArrowRight, Heart } from 'lucide-react';
import { useBasket } from '@/app/context/basket-context';

function ThankYouContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order_id');
    const { clearBasket } = useBasket();

    // Clear basket on mount
    useEffect(() => {
        clearBasket();
    }, [clearBasket]);

    return (
        <main className="bg-[#FDF8F3] min-h-screen py-20 px-4">
            <div className="container mx-auto max-w-2xl text-center">
                <div className="mb-8 flex justify-center">
                    <div className="bg-green-50 p-6 rounded-full shadow-sm">
                        <CheckCircle2 className="w-16 h-16 text-[#27AE60]" />
                    </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#5C4A3D] mb-4">
                    Thank You for Your Kindness!
                </h1>
                
                <p className="text-xl text-[#636E72] mb-8">
                    Your order has been placed and is supporting a great cause.
                </p>

                <div className="bg-white rounded-2xl shadow-sm p-8 mb-10 border border-[#F0E6D2]">
                    <div className="flex flex-col items-center gap-4 mb-6 pb-6 border-b border-[#F0E6D2]">
                        <div className="text-sm uppercase tracking-widest text-[#95A5A6] font-bold">Order Number</div>
                        <div className="text-2xl font-mono font-bold text-[#5C4A3D]">#{orderId || 'ORD-4050-XXXX'}</div>
                    </div>

                    <div className="space-y-4 text-left">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 text-[#E67E22]"><Heart size={18} fill="currentColor" /></div>
                            <p className="text-[#636E72]">
                                <span className="font-bold text-[#5C4A3D]">What’s next?</span> We’ll send a confirmation email with all the details shortly.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-1 text-[#E67E22]"><ShoppingBasket size={18} /></div>
                            <p className="text-[#636E72]">
                                <span className="font-bold text-[#5C4A3D]">Delivery:</span> If you chose local pickup, we’ll contact you to schedule a time.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/shop"
                        className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#E67E22] text-white rounded-lg hover:bg-[#D35400] transition-colors font-medium shadow-sm"
                    >
                        Back to the Garden
                        <ArrowRight size={18} />
                    </Link>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center px-8 py-3 bg-white text-[#5C4A3D] border border-[#D5D8DC] rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        Return Home
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default function ThankYouPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <ThankYouContent />
        </Suspense>
    );
}
