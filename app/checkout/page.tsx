'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useBasket } from '@/app/context/basket-context';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2, Lock, ArrowRight, ArrowLeft, Coins, Leaf } from 'lucide-react';
import { CURRENT_CAUSES } from '@/lib/causes';

// Initialize Stripe outside component
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

// Payment Form Component
function PaymentForm({ onSuccess }: { onSuccess: () => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsProcessing(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/thank-you`,
            },
            redirect: 'if_required',
        });

        if (error) {
            setErrorMessage(error.message || 'An unexpected error occurred.');
            setIsProcessing(false);
        } else {
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />

            {errorMessage && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                    {errorMessage}
                </div>
            )}

            <button
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#27AE60] text-white rounded-lg hover:bg-[#219150] transition-colors font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="animate-spin" size={20} />
                        Processing...
                    </>
                ) : (
                    <>
                        <Lock size={20} />
                        Pay Now
                    </>
                )}
            </button>
        </form>
    );
}

export default function CheckoutPage() {
    const router = useRouter();
    const { items, subtotal, showToast } = useBasket();
    const [mounted, setMounted] = useState(false);

    // State
    const [step, setStep] = useState<'details' | 'impact' | 'payment'>('details');
    const [isLoading, setIsLoading] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);

    // Form State
    const [fulfillmentMethod, setFulfillmentMethod] = useState<'PICKUP' | 'SHIPPING'>('PICKUP');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
    });

    // Impact & Seeds State
    const [proceedsChoice, setProceedsChoice] = useState(CURRENT_CAUSES[0].id);
    const [extraSupportAmount, setExtraSupportAmount] = useState(0); // in cents
    const [isRoundingUp, setIsRoundingUp] = useState(false);
    const [customAmount, setCustomAmount] = useState('');

    useEffect(() => {
        setMounted(true);
    }, []);

    // Calculate totals
    const shippingCost = fulfillmentMethod === 'SHIPPING' ? 1000 : 0;
    
    // Calculate round-up amount
    const currentSubtotal = subtotal + shippingCost;
    const roundUpAmount = isRoundingUp ? (100 - (currentSubtotal % 100)) % 100 : 0;
    
    const totalExtra = extraSupportAmount + roundUpAmount;
    const total = currentSubtotal + totalExtra;

    // Seeds calculation ("Garden Math")
    // Alignment: Shipping does NOT count toward seeds.
    // Seeds are based on (products + sowing extra): 1 base seed + 1 per $10 of your order (excluding shipping).
    const seedBasisCents = subtotal + totalExtra;
    const earnedSeeds = Math.floor(seedBasisCents / 1000);
    const seedCount = 1 + earnedSeeds;

    // Helpers
    const formatPrice = (cents: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(cents / 100);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (/^\d*\.?\d{0,2}$/.test(val)) {
            setCustomAmount(val);
            const cents = Math.round(parseFloat(val || '0') * 100);
            setExtraSupportAmount(cents);
        }
    };

    const handleDetailsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCheckoutError(null);
        setStep('impact');
    };

    const handleImpactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setCheckoutError(null);

        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    items,
                    fulfillmentMethod,
                    customerDetails: {
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                    },
                    shippingAddress: fulfillmentMethod === 'SHIPPING' ? {
                        street: formData.street,
                        city: formData.city,
                        state: formData.state,
                        zipCode: formData.zipCode,
                    } : null,
                    proceedsChoice,
                    extraSupportAmount: totalExtra,
                    seedCount,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to initialize checkout');
            }

            setClientSecret(data.clientSecret);
            setOrderId(data.orderId);
            setStep('payment');
        } catch (error) {
            console.error('Checkout error:', error);
            setCheckoutError(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
            showToast('Checkout failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePaymentSuccess = () => {
        router.push(`/thank-you?order_id=${orderId}&cause=${proceedsChoice}&seeds=${seedCount}`);
    };

    // Redirect if empty basket
    useEffect(() => {
        if (mounted && items.length === 0) {
            router.push('/shop');
        }
    }, [items, router, mounted]);

    if (!mounted || items.length === 0) {
        return (
            <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center">
                <Loader2 className="animate-spin text-[#4A7C59]" size={40} />
            </div>
        );
    }

    return (
        <main className="bg-[#FDF8F3] min-h-screen py-12 px-4">
            <div className="container mx-auto max-w-6xl">
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#5C4A3D] mb-2 text-center">
                    Checkout
                </h1>
                <p className="text-center text-[#636E72] mb-8 font-serif italic">
                    Guest checkout — no account required
                </p>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content */}
                    <div className="flex-grow">
                        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-[#E5DDD3]">
                            {/* Progress Steps */}
                            <div className="flex items-center mb-8 text-sm font-medium">
                                <span className={`flex items-center gap-2 ${step === 'details' ? 'text-[#E67E22]' : 'text-[#27AE60]'}`}>
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step === 'details' ? 'bg-[#E67E22] text-white' : 'bg-[#27AE60] text-white'}`}>1</span>
                                    Details
                                </span>
                                <div className="h-px bg-gray-200 w-12 mx-4"></div>
                                <span className={`flex items-center gap-2 ${step === 'impact' ? 'text-[#E67E22]' : (step === 'payment' ? 'text-[#27AE60]' : 'text-gray-400')}`}>
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step === 'impact' ? 'bg-[#E67E22] text-white' : (step === 'payment' ? 'bg-[#27AE60] text-white' : 'bg-gray-200 text-gray-500')}`}>2</span>
                                    Plant Your Seeds
                                </span>
                                <div className="h-px bg-gray-200 w-12 mx-4"></div>
                                <span className={`flex items-center gap-2 ${step === 'payment' ? 'text-[#E67E22]' : 'text-gray-400'}`}>
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-[#E67E22] text-white' : 'bg-gray-200 text-gray-500'}`}>3</span>
                                    Payment
                                </span>
                            </div>

                            {step === 'details' ? (
                                <form onSubmit={handleDetailsSubmit} className="space-y-12">
                                    {/* Contact Info */}
                                    <section>
                                        <h2 className="text-xl font-serif font-bold text-[#5C4A3D] mb-4">Contact Information</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-[#636E72] mb-1">Full Name</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    required
                                                    className="w-full px-4 py-2 border border-[#D5D8DC] rounded-lg focus:ring-2 focus:ring-[#E67E22] focus:border-transparent outline-none"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-[#636E72] mb-1">Email</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    required
                                                    className="w-full px-4 py-2 border border-[#D5D8DC] rounded-lg focus:ring-2 focus:ring-[#E67E22] focus:border-transparent outline-none"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-[#636E72] mb-1">Phone</label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    required
                                                    className="w-full px-4 py-2 border border-[#D5D8DC] rounded-lg focus:ring-2 focus:ring-[#E67E22] focus:border-transparent outline-none"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                    </section>

                                    {/* Fulfillment Method */}
                                    <section>
                                        <h2 className="text-xl font-serif font-bold text-[#5C4A3D] mb-4">Delivery Options</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFulfillmentMethod('PICKUP');
                                                    setClientSecret(null);
                                                    setOrderId(null);
                                                }}
                                                className={`p-5 border rounded-xl text-left transition-all active:scale-[0.98] touch-manipulation flex flex-col justify-between h-full ${fulfillmentMethod === 'PICKUP' ? 'border-[#E67E22] bg-orange-50/30 ring-1 ring-[#E67E22] shadow-sm' : 'border-[#D5D8DC] hover:border-[#E67E22] bg-white'}`}
                                            >
                                                <div>
                                                    <div className="font-bold text-[#5C4A3D] mb-1 flex items-center justify-between">
                                                        Local Pickup
                                                        {fulfillmentMethod === 'PICKUP' && <div className="w-2 h-2 rounded-full bg-[#E67E22]" />}
                                                    </div>
                                                    <div className="text-[13px] text-[#636E72] leading-relaxed">Pick up in the 4050 neighborhood area.</div>
                                                </div>
                                                <div className="mt-4 text-xs font-bold text-[#4A7C59] uppercase tracking-wider">Free</div>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFulfillmentMethod('SHIPPING');
                                                    setClientSecret(null);
                                                    setOrderId(null);
                                                }}
                                                className={`p-5 border rounded-xl text-left transition-all active:scale-[0.98] touch-manipulation flex flex-col justify-between h-full ${fulfillmentMethod === 'SHIPPING' ? 'border-[#E67E22] bg-orange-50/30 ring-1 ring-[#E67E22] shadow-sm' : 'border-[#D5D8DC] hover:border-[#E67E22] bg-white'}`}
                                            >
                                                <div>
                                                    <div className="font-bold text-[#5C4A3D] mb-1 flex items-center justify-between">
                                                        Flat Rate Shipping
                                                        {fulfillmentMethod === 'SHIPPING' && <div className="w-2 h-2 rounded-full bg-[#E67E22]" />}
                                                    </div>
                                                    <div className="text-[13px] text-[#636E72] leading-relaxed">Anywhere in the US via standard shipping.</div>
                                                </div>
                                                <div className="mt-4 text-xs font-bold text-[#5C4A3D] uppercase tracking-wider">$10.00</div>
                                            </button>
                                        </div>
                                    </section>

                                    {/* Shipping Address */}
                                    {fulfillmentMethod === 'SHIPPING' && (
                                        <section className="animate-in fade-in slide-in-from-top-4 duration-300">
                                            <h2 className="text-xl font-serif font-bold text-[#5C4A3D] mb-4">Shipping Address</h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-[#636E72] mb-1">Street Address</label>
                                                    <input
                                                        type="text"
                                                        name="street"
                                                        required
                                                        className="w-full px-4 py-2 border border-[#D5D8DC] rounded-lg focus:ring-2 focus:ring-[#E67E22] focus:border-transparent outline-none"
                                                        value={formData.street}
                                                        onChange={handleInputChange}
                                                        placeholder="123 Main St"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-[#636E72] mb-1">City</label>
                                                    <input
                                                        type="text"
                                                        name="city"
                                                        required
                                                        className="w-full px-4 py-2 border border-[#D5D8DC] rounded-lg focus:ring-2 focus:ring-[#E67E22] focus:border-transparent outline-none"
                                                        value={formData.city}
                                                        onChange={handleInputChange}
                                                        placeholder="Anytown"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-[#636E72] mb-1">State</label>
                                                        <input
                                                            type="text"
                                                            name="state"
                                                            required
                                                            className="w-full px-4 py-2 border border-[#D5D8DC] rounded-lg focus:ring-2 focus:ring-[#E67E22] focus:border-transparent outline-none"
                                                            value={formData.state}
                                                            onChange={handleInputChange}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-[#636E72] mb-1">ZIP Code</label>
                                                        <input
                                                            type="text"
                                                            name="zipCode"
                                                            required
                                                            className="w-full px-4 py-2 border border-[#D5D8DC] rounded-lg focus:ring-2 focus:ring-[#E67E22] focus:border-transparent outline-none"
                                                            value={formData.zipCode}
                                                            onChange={handleInputChange}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    )}

                                    {/* Pickup Info */}
                                    {fulfillmentMethod === 'PICKUP' && (
                                        <div className="bg-[#F5EDE4] p-4 rounded-lg flex gap-3 animate-in fade-in duration-300">
                                            <div className="min-w-6 pt-1">ℹ️</div>
                                            <div className="text-sm text-[#5C4A3D]">
                                                <p className="font-bold mb-1">Pickup Information</p>
                                                <p>We will contact you via email to schedule your pickup time.</p>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#E67E22] text-white rounded-lg hover:bg-[#D35400] transition-colors font-bold shadow-md"
                                    >
                                        Continue to Plant Your Seeds
                                        <ArrowRight size={20} />
                                    </button>
                                </form>
                            ) : step === 'impact' ? (
                                <form onSubmit={handleImpactSubmit} className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-300">
                                    <div className="mb-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setStep('details');
                                                setClientSecret(null);
                                                setOrderId(null);
                                            }}
                                            className="text-[#636E72] hover:text-[#5C4A3D] text-sm flex items-center gap-1 mb-4"
                                        >
                                            <ArrowLeft size={16} />
                                            Back to details
                                        </button>
                                        <h2 className="text-xl font-serif font-bold text-[#5C4A3D] mb-2">Plant Your Seeds</h2>
                                        <p className="text-sm text-[#636E72]">Choose where your harvest helps the community flourish.</p>
                                    </div>

                                    {/* Share Choice - Seeds of Kindness */}
                                    <section className="bg-[#FDF8F3] p-6 rounded-2xl border border-[#E5DDD3]">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-white rounded-full text-[#4A7C59]">
                                                <Leaf size={20} />
                                            </div>
                                            <h3 className="text-xl font-serif font-bold text-[#5C4A3D]">Seeds of Kindness</h3>
                                        </div>
                                        <p className="text-[#636E72] text-sm mb-6 leading-relaxed">
                                            The garden provided this harvest, and 100% of the profits are yours to share.
                                            Where would you like to plant your seeds today?
                                        </p>

                                        {/* Seeds Indicator */}
                                        <div className="mb-6 p-4 bg-white rounded-xl border border-[#4A7C59]/20 group transition-all duration-500 hover:shadow-md">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-[#E8F0EA] rounded-full flex items-center justify-center text-[#4A7C59] group-hover:scale-110 transition-transform duration-500">
                                                        <Leaf size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="text-[13px] sm:text-sm font-bold text-[#5C4A3D]">
                                                            With this order, you can plant
                                                        </div>
                                                        <div className="text-[11px] sm:text-xs text-[#636E72]">
                                                            1 seed always + 1 more per $10 (shipping doesn’t count)
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-xl sm:text-2xl font-bold text-[#4A7C59] tabular-nums flex flex-col items-end leading-tight">
                                                    <span>{seedCount} {seedCount === 1 ? 'Seed' : 'Seeds'}</span>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <div className="text-[11px] text-[#8B7355] italic">
                                                    Seeds are calculated from your order before shipping: {formatPrice(subtotal)}{totalExtra > 0 ? ` + ${formatPrice(totalExtra)} sowing extra` : ''}. Shipping doesn’t count.
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <select 
                                                value={proceedsChoice}
                                                onChange={(e) => {
                                                    setProceedsChoice(e.target.value);
                                                    setClientSecret(null);
                                                    setOrderId(null);
                                                }}
                                                className="w-full px-4 py-3 border border-[#D5D8DC] rounded-xl bg-white focus:ring-2 focus:ring-[#4A7C59]/30 focus:border-[#4A7C59] outline-none font-medium text-[#5C4A3D] appearance-none cursor-pointer"
                                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238B7355'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.25rem' }}
                                            >
                                                {CURRENT_CAUSES.map(cause => (
                                                    <option key={cause.id} value={cause.id}>
                                                        {cause.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <p className="text-[11px] sm:text-xs text-[#8B7355] italic px-1 leading-relaxed">
                                                {CURRENT_CAUSES.find(c => c.id === proceedsChoice)?.description}
                                            </p>
                                        </div>
                                    </section>

                                    {/* Sow Extra Seeds - Additional Support */}
                                    <section>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-[#F5EDE4] rounded-full text-[#8B7355]">
                                                <Coins size={20} />
                                            </div>
                                            <h3 className="text-xl font-serif font-bold text-[#5C4A3D]">Sow Extra Seeds</h3>
                                        </div>
                                        <p className="text-[#636E72] text-sm mb-6 leading-relaxed">
                                            If you’d like to help us grow even more support for {CURRENT_CAUSES.find(c => c.id === proceedsChoice)?.name},
                                            you can sow extra seeds here.
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <label className="flex items-center gap-3 p-4 border border-[#D5D8DC] rounded-xl cursor-pointer hover:bg-[#FDF8F3] transition-all active:scale-[0.98] touch-manipulation">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={isRoundingUp}
                                                        onChange={(e) => {
                                                            setIsRoundingUp(e.target.checked);
                                                            setClientSecret(null);
                                                            setOrderId(null);
                                                        }}
                                                        className="w-5 h-5 accent-[#4A7C59] cursor-pointer"
                                                    />
                                                    <div className="flex-grow">
                                                        <div className="font-bold text-[#5C4A3D] text-sm">Round up my total</div>
                                                        <div className="text-[11px] text-[#636E72]">Add {formatPrice(roundUpAmount)} to your order</div>
                                                    </div>
                                                </label>

                                                <div className="grid grid-cols-3 gap-2">
                                                    {[200, 500, 1000].map(amt => (
                                                        <button
                                                            key={amt}
                                                            type="button"
                                                            onClick={() => {
                                                                setExtraSupportAmount(amt);
                                                                setCustomAmount((amt / 100).toFixed(2));
                                                                setClientSecret(null);
                                                                setOrderId(null);
                                                            }}
                                                            className={`py-2.5 border rounded-lg text-xs sm:text-sm font-bold transition-all active:scale-95 touch-manipulation ${extraSupportAmount === amt ? 'bg-[#5C4A3D] text-white border-[#5C4A3D] shadow-sm' : 'bg-white text-[#5C4A3D] border-[#D5D8DC] hover:border-[#5C4A3D]'}`}
                                                        >
                                                            +{formatPrice(amt)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-[#636E72]">Or set a custom amount:</label>
                                                <div className="relative group">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#636E72] group-focus-within:text-[#4A7C59] transition-colors">$</span>
                                                    <input 
                                                        type="text"
                                                        placeholder="0.00"
                                                        value={customAmount}
                                                        onChange={(e) => {
                                                            handleCustomAmountChange(e);
                                                            setClientSecret(null);
                                                            setOrderId(null);
                                                        }}
                                                        className="w-full pl-8 pr-4 py-3 border border-[#D5D8DC] rounded-xl focus:ring-2 focus:ring-[#4A7C59]/30 focus:border-[#4A7C59] outline-none text-sm sm:text-base transition-all"
                                                        inputMode="decimal"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Error Message */}
                                    {checkoutError && (
                                        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium animate-in fade-in duration-300">
                                            {checkoutError}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#E67E22] text-white rounded-lg hover:bg-[#D35400] transition-colors font-bold shadow-md disabled:opacity-70"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="animate-spin" size={20} />
                                                Creating Payment...
                                            </>
                                        ) : (
                                            <>
                                                Continue to Payment
                                                <ArrowRight size={20} />
                                            </>
                                        )}
                                    </button>
                                </form>
                            ) : (
                                <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                                    <div className="mb-6">
                                        <button
                                            onClick={() => {
                                                setStep('impact');
                                                setClientSecret(null);
                                                setOrderId(null);
                                            }}
                                            className="text-[#636E72] hover:text-[#5C4A3D] text-sm flex items-center gap-1 mb-4"
                                        >
                                            <ArrowLeft size={16} />
                                            Back to planting
                                        </button>
                                        <h2 className="text-xl font-serif font-bold text-[#5C4A3D] mb-2">Secure Payment</h2>
                                        <p className="text-sm text-[#636E72]">Complete your purchase securely via Stripe.</p>
                                    </div>

                                    {clientSecret && (
                                        <Elements stripe={stripePromise} options={{ clientSecret }}>
                                            <PaymentForm onSuccess={handlePaymentSuccess} />
                                        </Elements>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="w-full lg:w-96 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24 border border-[#E5DDD3]">
                            <h2 className="text-xl font-serif font-bold text-[#5C4A3D] mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
                                {items.map((item) => (
                                    <div key={item.productId} className="flex gap-4">
                                        <div className="relative w-16 h-16 bg-[#F5EDE4] rounded-lg overflow-hidden flex-shrink-0">
                                            <Image
                                                src={item.product.imageUrl || 'https://placehold.co/100'}
                                                alt={item.product.name}
                                                fill
                                                className="object-cover"
                                            />
                                            <span className="absolute top-0 right-0 bg-[#4A7C59] text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-bl-lg">
                                                {item.quantity}
                                            </span>
                                        </div>
                                        <div className="flex-grow">
                                            <p className="text-sm font-bold text-[#5C4A3D] line-clamp-2">{item.product.name}</p>
                                            <p className="text-sm text-[#636E72]">{formatPrice(item.lineTotal)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 mb-6 border-t border-[#F0E6D2] pt-4">
                                <div className="flex justify-between text-[#636E72]">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-[#5C4A3D]">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-[#636E72]">
                                    <span>Shipping</span>
                                    <span className="font-medium text-[#5C4A3D]">{fulfillmentMethod === 'SHIPPING' ? '$10.00' : 'Free'}</span>
                                </div>
                                {totalExtra > 0 && (
                                    <div className="flex justify-between text-[#4A7C59] font-medium">
                                        <span>Sowing Extra</span>
                                        <span>+{formatPrice(totalExtra)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-[#F0E6D2] pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-serif font-bold text-[#5C4A3D]">Total</span>
                                    <span className="text-2xl font-bold text-[#E67E22]">{formatPrice(total)}</span>
                                </div>
                                <div className="mt-4 flex items-center justify-between p-3 bg-[#FDF8F3] rounded-lg border border-[#E5DDD3]">
                                    <span className="text-xs font-bold text-[#5C4A3D] uppercase tracking-wider">Seeds of Kindness</span>
                                    <span className="text-sm font-bold text-[#4A7C59]">{seedCount} Seeds</span>
                                </div>
                                <p className="mt-2 text-[10px] text-[#8B7355] italic text-right">
                                    With this order, you can plant {seedCount} seed{seedCount === 1 ? '' : 's'}. 1 seed always + 1 more per $10 (shipping doesn’t count).
                                </p>
                                {totalExtra > 0 && (
                                    <p className="text-[10px] text-[#4A7C59] mt-2 text-right italic">
                                        Thank you for sowing extra seeds to help {CURRENT_CAUSES.find(c => c.id === proceedsChoice)?.name} flourish.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
