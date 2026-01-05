import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';

/**
 * GET /api/catalog
 * Returns the full product catalog organized by category → flavor → size
 * Includes computed fields like fullName and totalQuantity
 */
export async function GET() {
  try {
    const categories = await prisma.productCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        flavors: {
          where: { isAvailable: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            sizes: {
              where: { isActive: true },
              orderBy: { sizeOz: 'asc' },
            },
          },
        },
      },
    });

    // Add computed fields
    const catalogWithComputed = categories.map((category) => ({
      ...category,
      flavors: category.flavors.map((flavor) => {
        const totalQuantity = flavor.sizes.reduce((sum, size) => sum + size.quantity, 0);
        const prices = flavor.sizes.map((s) => s.unitPrice);
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

        return {
          ...flavor,
          fullName: `${flavor.name} ${category.name}`.trim(),
          totalQuantity,
          minPrice,
          maxPrice,
          hasStock: totalQuantity > 0,
        };
      }),
    }));

    // Filter out categories with no in-stock flavors (for shop display)
    const catalogWithStock = catalogWithComputed.map((category) => ({
      ...category,
      flavors: category.flavors.filter((f) => f.hasStock),
    }));

    return NextResponse.json({
      categories: catalogWithComputed,
      categoriesWithStock: catalogWithStock.filter((c) => c.flavors.length > 0),
    });
  } catch (error) {
    console.error('Failed to fetch catalog:', error);
    return NextResponse.json({ error: 'Failed to fetch catalog' }, { status: 500 });
  }
}

