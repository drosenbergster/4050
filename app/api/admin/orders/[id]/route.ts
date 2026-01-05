import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';
import { getAuthSession } from '@/lib/server/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { fulfillmentStatus } = body;

    if (!fulfillmentStatus || !['PENDING', 'FULFILLED'].includes(fulfillmentStatus)) {
      return NextResponse.json({ error: 'Invalid fulfillment status' }, { status: 400 });
    }

    // Get current order with items to check if transitioning to FULFILLED
    const currentOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!currentOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // If transitioning from PENDING to FULFILLED, decrement inventory atomically
    if (currentOrder.fulfillmentStatus === 'PENDING' && fulfillmentStatus === 'FULFILLED') {
      // Use transaction to ensure atomic update of order + all inventory decrements
      const order = await prisma.$transaction(async (tx) => {
        // Track which products need aggregate quantity updates
        const productsToUpdate = new Set<string>();

        // Decrement quantity for each item (variant-aware)
        for (const item of currentOrder.items) {
          // Type assertion for variantKey which may be on the item
          const variantKey = (item as { variantKey?: string | null }).variantKey;
          
          // Skip items without productId (new hierarchy items use flavorId/sizeKey)
          if (!item.productId) {
            // TODO: Handle new hierarchy inventory decrement via ProductSize
            continue;
          }
          
          if (variantKey) {
            // Decrement from specific variant
            const variant = await tx.productVariant.findUnique({
              where: {
                productId_sizeKey: {
                  productId: item.productId,
                  sizeKey: variantKey,
                },
              },
              select: { id: true, quantity: true },
            });

            if (variant) {
              const newQuantity = Math.max(0, variant.quantity - item.quantity);
              await tx.productVariant.update({
                where: { id: variant.id },
                data: { quantity: newQuantity },
              });
              productsToUpdate.add(item.productId);
            }
          } else {
            // Fall back to product-level decrement (for products without variants)
            const product = await tx.product.findUnique({
              where: { id: item.productId },
              select: { quantity: true },
            });
            
            if (product) {
              const newQuantity = Math.max(0, product.quantity - item.quantity);
              await tx.product.update({
                where: { id: item.productId },
                data: { quantity: newQuantity },
              });
            }
          }
        }

        // Update aggregate product quantities for products with variants
        for (const productId of productsToUpdate) {
          const variants = await tx.productVariant.findMany({
            where: { productId, isActive: true },
            select: { quantity: true },
          });
          const totalQuantity = variants.reduce((sum, v) => sum + v.quantity, 0);
          await tx.product.update({
            where: { id: productId },
            data: { quantity: totalQuantity },
          });
        }

        // Update order status
        return tx.order.update({
          where: { id },
          data: { fulfillmentStatus },
        });
      });

      return NextResponse.json(order);
    }

    const order = await prisma.order.update({
      where: { id },
      data: { fulfillmentStatus },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Failed to update order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

