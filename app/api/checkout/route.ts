import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';
import Stripe from 'stripe';
import { Product } from '@/lib/types';
import { sendOrderConfirmationEmail } from '@/lib/server/mail';

type CheckoutItemInput = {
    productId: string;
    quantity: number;
};

// Initialize Stripe lazily to avoid crashing the build when STRIPE_SECRET_KEY is unset.
// (Vercel builds import route modules; throwing at import time fails the deployment.)
const getStripe = () => {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return null;
    return new Stripe(key, {
        apiVersion: '2025-12-15.clover' as Stripe.LatestApiVersion,
    });
};

const SHIPPING_COST_CENTS = 1000; // $10.00

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            items,
            customerDetails,
            fulfillmentMethod,
            shippingAddress,
            proceedsChoice,
            extraSupportAmount = 0
        } = body;

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'Basket is empty' }, { status: 400 });
        }

        if (!customerDetails) {
            return NextResponse.json({ error: 'Missing customer details' }, { status: 400 });
        }

        if (!customerDetails?.name || !customerDetails?.email || !customerDetails?.phone) {
            return NextResponse.json({ error: 'Missing customer details' }, { status: 400 });
        }

        if (fulfillmentMethod !== 'PICKUP' && fulfillmentMethod !== 'SHIPPING') {
            return NextResponse.json({ error: 'Invalid fulfillment method' }, { status: 400 });
        }

        if (fulfillmentMethod === 'SHIPPING') {
            const addr = shippingAddress;
            if (!addr?.street || !addr?.city || !addr?.state || !addr?.zipCode) {
                return NextResponse.json({ error: 'Missing shipping address' }, { status: 400 });
            }
        }

        // Validate extra support amount
        if (typeof extraSupportAmount !== 'number' || extraSupportAmount < 0) {
            return NextResponse.json({ error: 'Invalid extra support amount' }, { status: 400 });
        }

        // 1. Validate items and calculate total
        // Products must exist in the database to process an order
        let dbProducts: Product[] = [];
        const productIds = items
            .map((item: unknown) => {
                if (typeof item !== 'object' || item === null) return null;
                const productId = (item as { productId?: unknown }).productId;
                return typeof productId === 'string' ? productId : null;
            })
            .filter((id): id is string => typeof id === 'string');

        if (productIds.length !== items.length) {
            return NextResponse.json(
                { error: 'Invalid basket item(s). Please refresh your basket.' },
                { status: 400 }
            );
        }

        try {
            dbProducts = await prisma.product.findMany({
                where: {
                    id: { in: productIds },
                    isAvailable: true,
                },
            });
        } catch (dbError) {
            console.error('Database query failed during checkout:', dbError);
            return NextResponse.json({ error: 'Store is temporarily offline. Please try again later.' }, { status: 503 });
        }

        // Check if all requested items were found in the database
        const missingIds = productIds.filter((id: string) => !dbProducts.find(p => p.id === id));
        if (missingIds.length > 0) {
            return NextResponse.json(
                { error: `Some products are no longer available. Please refresh your basket.` },
                { status: 400 }
            );
        }

        let subtotal = 0;
        const orderItemsData: Array<{
            productId: string;
            productName: string;
            quantity: number;
            unitPrice: number;
            lineTotal: number;
        }> = [];

        // Map items to DB/Static products
        for (const rawItem of items as unknown[]) {
            if (typeof rawItem !== 'object' || rawItem === null) {
                return NextResponse.json(
                    { error: 'Invalid basket item(s). Please refresh your basket.' },
                    { status: 400 }
                );
            }

            const productId = (rawItem as { productId?: unknown }).productId;
            const quantity = (rawItem as { quantity?: unknown }).quantity;

            if (typeof productId !== 'string' || typeof quantity !== 'number' || quantity <= 0) {
                return NextResponse.json(
                    { error: 'Invalid basket item(s). Please refresh your basket.' },
                    { status: 400 }
                );
            }

            const product = dbProducts.find((p) => p.id === productId);

            if (!product) {
                return NextResponse.json(
                    { error: `Product not found or unavailable: ${productId}` },
                    { status: 400 }
                );
            }

            const lineTotal = product.price * quantity;
            subtotal += lineTotal;

            orderItemsData.push({
                productId: product.id,
                productName: product.name,
                quantity: quantity,
                unitPrice: product.price,
                lineTotal: lineTotal,
            });
        }

        // 2. Calculate final total
        const shippingCost = fulfillmentMethod === 'SHIPPING' ? SHIPPING_COST_CENTS : 0;
        const total = subtotal + shippingCost + extraSupportAmount;
        
        // Calculate seeds ("Garden Math"):
        // 1 base seed + 1 per $10 of your order EXCLUDING shipping.
        // Includes voluntary "sowing extra" amounts (extraSupportAmount).
        const seedCount = 1 + Math.floor((subtotal + extraSupportAmount) / 1000);

        // 3. Development fallback (no Stripe keys)
        if (!process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV === 'development') {
            // Mock for development without keys
            const mockOrderId = 'mock-order-' + Date.now();
            
            // In dev mode without Stripe, we'll trigger a mock email immediately
            // so the developer can see the template.
            if (process.env.NODE_ENV === 'development') {
                await sendOrderConfirmationEmail({
                    id: mockOrderId,
                    customerName: customerDetails.name,
                    customerEmail: customerDetails.email,
                    items: orderItemsData,
                    subtotal,
                    shippingCost,
                    extraSupportAmount,
                    total,
                    seedCount
                });
            }

            return NextResponse.json({
                clientSecret: 'mock_secret',
                orderId: mockOrderId,
            });
        }

        const stripe = getStripe();
        if (!stripe) {
            // In production, Stripe must be configured to accept payments.
            // Return a safe error instead of throwing during module import/build.
            return NextResponse.json(
                { error: 'Payments are temporarily unavailable. Please try again later.' },
                { status: 503 }
            );
        }

        // Standard Stripe Flow (Hardened):
        // Persist the Order first, then create a PaymentIntent and link it back.
        // This prevents "paid but no order" scenarios when the DB is misconfigured/unavailable.
        let orderId: string;
        try {
            const order = await prisma.order.create({
                data: {
                    customerName: customerDetails.name,
                    customerEmail: customerDetails.email,
                    customerPhone: customerDetails.phone,
                    shippingAddress: fulfillmentMethod === 'SHIPPING' ? shippingAddress : null,
                    fulfillmentMethod: fulfillmentMethod,
                    shippingCost: fulfillmentMethod === 'SHIPPING' ? shippingCost : null,
                    subtotal: subtotal,
                    total: total,
                    // Note: proceedsChoice, extraSupportAmount, seedCount not stored yet (needs DB migration)
                    paymentStatus: 'PENDING',
                    fulfillmentStatus: 'PENDING',
                    items: {
                        create: orderItemsData,
                    },
                },
                select: {
                    id: true,
                }
            });
            orderId = order.id;
        } catch (dbCreateError) {
            console.error('Failed to create order in DB (before PaymentIntent):', dbCreateError);
            return NextResponse.json(
                { error: 'Store is temporarily offline. Please try again later.' },
                { status: 503 }
            );
        }

        let paymentIntent: Stripe.PaymentIntent;
        try {
            paymentIntent = await stripe.paymentIntents.create({
                amount: total,
                currency: 'usd',
                automatic_payment_methods: {
                    enabled: true,
                },
                metadata: {
                    orderId,
                    customerName: customerDetails.name,
                    customerEmail: customerDetails.email,
                    fulfillmentMethod,
                    proceedsChoice: proceedsChoice || '',
                },
            });
        } catch (stripeError) {
            console.error('Stripe error:', stripeError);
            // Avoid orphaned orders if Stripe fails to initialize payment
            try {
                await prisma.order.delete({ where: { id: orderId } });
            } catch (cleanupError) {
                console.error('Failed to cleanup order after Stripe error:', cleanupError);
            }
            return NextResponse.json({ error: 'Payment initialization failed' }, { status: 500 });
        }

        // 4. Link PaymentIntent back to Order (critical for webhook updates)
        try {
            await prisma.order.update({
                where: { id: orderId },
                data: { stripePaymentIntentId: paymentIntent.id },
            });

            return NextResponse.json({
                clientSecret: paymentIntent.client_secret,
                orderId: orderId,
            });
        } catch (dbSaveError) {
            console.error('Failed to link PaymentIntent to order:', dbSaveError);

            // Best-effort: cancel PI so customer can't pay for an order we can't reconcile.
            try {
                await stripe.paymentIntents.cancel(paymentIntent.id);
            } catch (cancelError) {
                console.error('Failed to cancel PaymentIntent after DB failure:', cancelError);
            }

            return NextResponse.json(
                { error: 'Store is temporarily offline. Please try again later.' },
                { status: 503 }
            );
        }

    } catch (error) {
        console.error('CRITICAL Checkout error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: `Internal server error: ${errorMessage}` },
            { status: 500 }
        );
    }
}
