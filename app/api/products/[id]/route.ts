import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';
import { getAuthSession } from '@/lib/server/auth';

// Dev mode check - only for localhost testing
const isDevMode = () => process.env.NODE_ENV === 'development';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getAuthSession();

    // Allow in dev mode OR with valid session
    if (!session && !isDevMode()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await request.json();
        const { name, description, price, imageUrl, category, isAvailable } = body;

        const product = await prisma.product.update({
            where: { id },
            data: {
                name,
                description,
                price,
                imageUrl,
                category,
                isAvailable,
            },
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error('Failed to update product:', error);
        const errorMessage = process.env.NODE_ENV === 'production'
            ? 'Failed to update product'
            : error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getAuthSession();

    // Allow in dev mode OR with valid session
    if (!session && !isDevMode()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;

        await prisma.product.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete product:', error);
        const errorMessage = process.env.NODE_ENV === 'production'
            ? 'Failed to delete product'
            : error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
