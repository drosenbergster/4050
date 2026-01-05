import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';
import { getAuthSession } from '@/lib/server/auth';

// Dev mode check - only for localhost testing
const isDevMode = () => process.env.NODE_ENV === 'development';

/**
 * GET /api/products/[id]/variants
 * List all variants for a product
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const variants = await prisma.productVariant.findMany({
            where: { productId: id },
            orderBy: [{ sortOrder: 'asc' }, { sizeOz: 'asc' }],
        });

        return NextResponse.json(variants);
    } catch (error) {
        console.error('Failed to fetch variants:', error);
        return NextResponse.json({ error: 'Failed to fetch variants' }, { status: 500 });
    }
}

/**
 * POST /api/products/[id]/variants
 * Create a new variant for a product
 * Body: { sizeKey, sizeLabel, sizeOz, unitPrice, quantity?, sku?, sortOrder? }
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getAuthSession();

    if (!session && !isDevMode()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id: productId } = await params;
        const body = await request.json();
        const { sizeKey, sizeLabel, sizeOz, unitPrice, quantity = 0, sku, sortOrder = 0 } = body;

        // Validate required fields
        if (!sizeKey || typeof sizeKey !== 'string') {
            return NextResponse.json({ error: 'sizeKey is required' }, { status: 400 });
        }
        if (!sizeLabel || typeof sizeLabel !== 'string') {
            return NextResponse.json({ error: 'sizeLabel is required' }, { status: 400 });
        }
        if (typeof sizeOz !== 'number' || sizeOz <= 0) {
            return NextResponse.json({ error: 'sizeOz must be a positive number' }, { status: 400 });
        }
        if (typeof unitPrice !== 'number' || unitPrice < 0) {
            return NextResponse.json({ error: 'unitPrice must be a non-negative number' }, { status: 400 });
        }

        // Check product exists
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Check for duplicate sizeKey
        const existing = await prisma.productVariant.findUnique({
            where: { productId_sizeKey: { productId, sizeKey } },
        });
        if (existing) {
            return NextResponse.json({ error: `Variant with size key "${sizeKey}" already exists` }, { status: 409 });
        }

        const variant = await prisma.productVariant.create({
            data: {
                productId,
                sizeKey: sizeKey.toLowerCase().replace(/\s+/g, '-'),
                sizeLabel,
                sizeOz,
                unitPrice,
                quantity: Math.max(0, quantity),
                sku: sku || null,
                sortOrder,
            },
        });

        // Update product's aggregate quantity
        await updateProductQuantity(productId);

        return NextResponse.json(variant, { status: 201 });
    } catch (error) {
        console.error('Failed to create variant:', error);
        return NextResponse.json({ error: 'Failed to create variant' }, { status: 500 });
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

