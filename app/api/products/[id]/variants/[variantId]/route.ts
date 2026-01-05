import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';
import { getAuthSession } from '@/lib/server/auth';

// Dev mode check - only for localhost testing
const isDevMode = () => process.env.NODE_ENV === 'development';

/**
 * GET /api/products/[id]/variants/[variantId]
 * Get a specific variant
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string; variantId: string }> }
) {
    try {
        const { id: productId, variantId } = await params;

        const variant = await prisma.productVariant.findFirst({
            where: { id: variantId, productId },
        });

        if (!variant) {
            return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
        }

        return NextResponse.json(variant);
    } catch (error) {
        console.error('Failed to fetch variant:', error);
        return NextResponse.json({ error: 'Failed to fetch variant' }, { status: 500 });
    }
}

/**
 * PUT /api/products/[id]/variants/[variantId]
 * Update a variant
 * Body: { sizeLabel?, sizeOz?, unitPrice?, quantity?, sku?, isActive?, sortOrder? }
 */
export async function PUT(
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

        // Verify variant exists and belongs to product
        const existing = await prisma.productVariant.findFirst({
            where: { id: variantId, productId },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
        }

        // Build update data
        const updateData: Record<string, unknown> = {};
        if (body.sizeLabel !== undefined) updateData.sizeLabel = body.sizeLabel;
        if (body.sizeOz !== undefined) updateData.sizeOz = body.sizeOz;
        if (body.unitPrice !== undefined) updateData.unitPrice = body.unitPrice;
        if (body.quantity !== undefined) updateData.quantity = Math.max(0, body.quantity);
        if (body.sku !== undefined) updateData.sku = body.sku || null;
        if (body.isActive !== undefined) updateData.isActive = body.isActive;
        if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder;

        const variant = await prisma.productVariant.update({
            where: { id: variantId },
            data: updateData,
        });

        // Update product's aggregate quantity
        await updateProductQuantity(productId);

        return NextResponse.json(variant);
    } catch (error) {
        console.error('Failed to update variant:', error);
        return NextResponse.json({ error: 'Failed to update variant' }, { status: 500 });
    }
}

/**
 * DELETE /api/products/[id]/variants/[variantId]
 * Delete a variant
 */
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string; variantId: string }> }
) {
    const session = await getAuthSession();

    if (!session && !isDevMode()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id: productId, variantId } = await params;

        // Verify variant exists and belongs to product
        const existing = await prisma.productVariant.findFirst({
            where: { id: variantId, productId },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
        }

        await prisma.productVariant.delete({
            where: { id: variantId },
        });

        // Update product's aggregate quantity
        await updateProductQuantity(productId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete variant:', error);
        return NextResponse.json({ error: 'Failed to delete variant' }, { status: 500 });
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

