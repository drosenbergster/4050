'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Sprout, ArrowRight, Heart, Mail } from 'lucide-react';
import { useBasket } from '@/app/context/basket-context';
import { CURRENT_QUARTER_ORGS } from '@/lib/causes';

function ThankYouContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order_id');
    const { clearBasket } = useBasket();

    // Get cause from URL params (we'll need to pass this from checkout)
    const causeId = searchParams.get('cause');
    const seedCount = searchParams.get('seeds');
    
    const selectedOrg = CURRENT_QUARTER_ORGS.find(org => org.id === causeId);

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
                    Your order has been placed and is already making a difference.
                </p>

                {/* Seeds Celebration */}
                {(selectedOrg || seedCount) && (
                    <div className="bg-[#E8F0EA] rounded-2xl p-6 md:p-8 mb-8 border border-[#4A7C59]/20">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-[#4A7C59] rounded-full flex items-center justify-center">
                                <Sprout className="text-white" size={24} />
                            </div>
                        </div>
                        <h2 className="text-xl font-serif font-bold text-[#4A7C59] mb-2">
                            You planted {seedCount || 'your'} seed{seedCount !== '1' ? 's' : ''}!
                        </h2>
                        {selectedOrg ? (
                            <p className="text-[#5C4A3D]">
                                Your seeds are growing support for <strong>{selectedOrg.name}</strong>.
                            </p>
                        ) : (
                            <p className="text-[#5C4A3D]">
                                Your seeds are growing support for our community partners.
                            </p>
                        )}
                        <p className="text-sm text-[#636E72] mt-3">
                            At the end of this quarter, we&apos;ll tally everyone&apos;s seeds and distribute profits 
                            proportionally to each organization.
                        </p>
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm p-8 mb-10 border border-[#F0E6D2]">
                    <div className="flex flex-col items-center gap-4 mb-6 pb-6 border-b border-[#F0E6D2]">
                        <div className="text-sm uppercase tracking-widest text-[#95A5A6] font-bold">Order Number</div>
                        <div className="text-2xl font-mono font-bold text-[#5C4A3D]">#{orderId || 'ORD-4050-XXXX'}</div>
                    </div>

                    <div className="space-y-4 text-left">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 text-[#E67E22]"><Heart size={18} fill="currentColor" /></div>
                            <p className="text-[#636E72]">
                                <span className="font-bold text-[#5C4A3D]">What&apos;s next?</span> We&apos;ll send a confirmation email with all the details shortly.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-1 text-[#E67E22]"><Mail size={18} /></div>
                            <p className="text-[#636E72]">
                                <span className="font-bold text-[#5C4A3D]">Delivery:</span> If you chose local pickup, we&apos;ll contact you to schedule a time.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Newsletter CTA */}
                <div className="bg-[#FDF8F3] rounded-2xl p-6 border border-[#E5DDD3] mb-10">
                    <h3 className="font-serif font-bold text-[#5C4A3D] mb-2">
                        Want to see where your seeds grow?
                    </h3>
                    <p className="text-sm text-[#636E72] mb-4">
                        We send quarterly updates showing how the community&apos;s seeds turned into real support for local organizations.
                    </p>
                    <p className="text-xs text-[#8B7355] italic">
                        Keep an eye on your inbox—if you provided an email, you&apos;re already on our list!
                    </p>
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
                        href="/impact"
                        className="inline-flex items-center justify-center px-8 py-3 bg-white text-[#5C4A3D] border border-[#D5D8DC] rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        See Our Impact
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
