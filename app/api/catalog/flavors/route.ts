import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';
import { getAuthSession } from '@/lib/server/auth';

/**
 * GET /api/catalog/flavors
 * List all product flavors with their category and sizes
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const includeOutOfStock = searchParams.get('includeOutOfStock') === 'true';

    const flavors = await prisma.productFlavor.findMany({
      where: {
        ...(categoryId ? { categoryId } : {}),
        ...(includeOutOfStock ? {} : { isAvailable: true }),
      },
      orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
      include: {
        category: true,
        sizes: {
          where: includeOutOfStock ? {} : { isActive: true },
          orderBy: { sizeOz: 'asc' },
        },
      },
    });

    // Add computed fields
    const flavorsWithComputed = flavors.map((flavor) => {
      const totalQuantity = flavor.sizes.reduce((sum, size) => sum + size.quantity, 0);
      const prices = flavor.sizes.map((s) => s.unitPrice);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

      return {
        ...flavor,
        fullName: `${flavor.name} ${flavor.category.name}`.trim(),
        totalQuantity,
        minPrice,
        maxPrice,
        hasStock: totalQuantity > 0,
      };
    });

    return NextResponse.json(flavorsWithComputed);
  } catch (error) {
    console.error('Failed to fetch flavors:', error);
    return NextResponse.json({ error: 'Failed to fetch flavors' }, { status: 500 });
  }
}

/**
 * POST /api/catalog/flavors
 * Create a new product flavor
 */
export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { categoryId, name, description, imageUrl, sortOrder } = body;

    if (!categoryId || !name?.trim()) {
      return NextResponse.json({ error: 'Category ID and name are required' }, { status: 400 });
    }

    const flavor = await prisma.productFlavor.create({
      data: {
        categoryId,
        name: name.trim(),
        description: description || null,
        imageUrl: imageUrl || null,
        sortOrder: sortOrder ?? 0,
        isAvailable: true,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      ...flavor,
      fullName: `${flavor.name} ${flavor.category.name}`.trim(),
    }, { status: 201 });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Flavor already exists in this category' }, { status: 400 });
    }
    console.error('Failed to create flavor:', error);
    return NextResponse.json({ error: 'Failed to create flavor' }, { status: 500 });
  }
}


