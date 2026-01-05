import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';
import { getAuthSession } from '@/lib/server/auth';

// Dev mode check - only for localhost testing
const isDevMode = () => process.env.NODE_ENV === 'development';

/**
 * PATCH /api/products/[id]/variants/[variantId]/inventory
 * Adjust variant inventory (add or subtract)
 * Body: { adjustment: number } - positive to add, negative to subtract
 */
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string; variantId: string }> }
) {
    const session = await getAuthSession();

    if (!session && !isDevMode()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id: productId, variantId } = await params;
        const body = await request.json();
        const { adjustment } = body;

        if (typeof adjustment !== 'number' || !Number.isInteger(adjustment)) {
            return NextResponse.json(
                { error: 'Adjustment must be an integer' },
                { status: 400 }
            );
        }

        // Get current variant
        const variant = await prisma.productVariant.findFirst({
            where: { id: variantId, productId },
            select: { quantity: true },
        });

        if (!variant) {
            return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
        }

        // Calculate new quantity (prevent negative)
        const newQuantity = Math.max(0, variant.quantity + adjustment);

        const updated = await prisma.productVariant.update({
            where: { id: variantId },
            data: { quantity: newQuantity },
        });

        // Update product's aggregate quantity
        await updateProductQuantity(productId);

        return NextResponse.json({
            id: updated.id,
            sizeKey: updated.sizeKey,
            sizeLabel: updated.sizeLabel,
            quantity: updated.quantity,
            previousQuantity: variant.quantity,
            adjustment,
        });
    } catch (error) {
        console.error('Failed to adjust variant inventory:', error);
        return NextResponse.json({ error: 'Failed to adjust inventory' }, { status: 500 });
    }
}

// Helper: Update product.quantity to sum of all variant quantities
async function updateProductQuantity(productId: string) {
    const variants = await prisma.productVariant.findMany({
        where: { productId, isActive: true },
        select: { quantity: true },
    });

    const totalQuantity = variants.reduce((sum, v) => sum + v.quantity, 0);

    await prisma.product.update({
        where: { id: productId },
        data: { quantity: totalQuantity },
    });
}

