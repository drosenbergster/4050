import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/server/db';
import { sendOrderConfirmationEmail } from '@/lib/server/mail';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'mock_key', {
  apiVersion: '2025-12-15.clover' as Stripe.LatestApiVersion,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get('stripe-signature');

  let event: Stripe.Event;

  try {
    if (!sig || !endpointSecret) {
      // In development without a secret, we might skip verification
      // BUT for security, we should never do this in production.
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Missing Stripe Webhook Secret');
      }
      event = JSON.parse(body);
    } else {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`❌ Webhook Error: ${message}`);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`💰 PaymentIntent succeeded: ${paymentIntent.id}`);
      
      try {
        // 1. Update the order in the database
        // Prefer linking by metadata.orderId (more robust than relying solely on stripePaymentIntentId)
        const orderId = paymentIntent.metadata?.orderId;
        const updatedOrder = await prisma.order.update({
          where: orderId ? { id: orderId } : { stripePaymentIntentId: paymentIntent.id },
          data: {
            paymentStatus: 'PAID',
            stripePaymentIntentId: paymentIntent.id,
          },
          include: { items: true },
        });

        // 2. Send the confirmation email
        console.log(`📧 Sending confirmation email to ${updatedOrder.customerEmail}`);
        await sendOrderConfirmationEmail(updatedOrder);

      } catch (dbError) {
        console.error(`❌ Database Error updating order:`, dbError);
      }
      break;

    case 'payment_intent.payment_failed':
      const failedIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`❌ Payment failed: ${failedIntent.id}`);
      
      try {
        const orderId = failedIntent.metadata?.orderId;
        await prisma.order.update({
          where: orderId ? { id: orderId } : { stripePaymentIntentId: failedIntent.id },
          data: {
            paymentStatus: 'FAILED',
            stripePaymentIntentId: failedIntent.id,
          },
        });
      } catch (dbError) {
        console.error(`❌ Database Error updating failed payment order:`, dbError);
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

