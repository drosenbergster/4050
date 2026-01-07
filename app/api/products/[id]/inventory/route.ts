import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';
import { getAuthSession } from '@/lib/server/auth';

// Dev mode check - only for localhost testing
const isDevMode = () => process.env.NODE_ENV === 'development';

/**
 * PATCH /api/products/[id]/inventory
 * Adjust product inventory (add or subtract)
 * Body: { adjustment: number } - positive to add, negative to subtract
 */
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getAuthSession();

    if (!session && !isDevMode()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await request.json();
        const { adjustment } = body;

        if (typeof adjustment !== 'number' || !Number.isInteger(adjustment)) {
            return NextResponse.json(
                { error: 'Adjustment must be an integer' },
                { status: 400 }
            );
        }

        // Get current product
        const product = await prisma.product.findUnique({
            where: { id },
            select: { quantity: true },
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Calculate new quantity (prevent negative)
        const newQuantity = Math.max(0, product.quantity + adjustment);

        const updated = await prisma.product.update({
            where: { id },
            data: { quantity: newQuantity },
        });

        return NextResponse.json({
            id: updated.id,
            quantity: updated.quantity,
            previousQuantity: product.quantity,
            adjustment,
        });
    } catch (error) {
        console.error('Failed to adjust inventory:', error);
        return NextResponse.json({ error: 'Failed to adjust inventory' }, { status: 500 });
    }
}


