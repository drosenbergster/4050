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
          orderBy: { sortOrder: 'asc' },
          include: {
            sizes: {
              orderBy: { sizeOz: 'asc' },
            },
            cogsRecipe: {
              include: {
                ingredients: {
                  include: { ingredient: true }
                }
              }
            }
          },
        },
      },
    });

    // Yield unit conversions (to oz)
    const yieldToOzConversions: Record<string, number> = {
      oz: 1, cup: 8, cups: 8, pint: 16, pints: 16,
      quart: 32, quarts: 32, gallon: 128, gallons: 128,
      lb: 16, lbs: 16, jar: 8, jars: 8,
    };

    // Add computed fields including cost calculations
    const catalogWithComputed = categories.map((category) => ({
      ...category,
      flavors: category.flavors.map((flavor) => {
        const totalQuantity = flavor.sizes.reduce((sum, size) => sum + size.quantity, 0);
        const prices = flavor.sizes.map((s) => s.unitPrice);
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

        // Calculate batch cost from recipe if linked
        let costPerOz = 0;
        if (flavor.cogsRecipe) {
          const recipe = flavor.cogsRecipe;
          const batchIngredientCost = recipe.ingredients.reduce((sum, ri) => {
            const cost = ri.ingredient.source === 'GARDEN' ? 0 : ri.ingredient.unitCost * ri.quantity;
            return sum + cost;
          }, 0);

          // Get batch yield in oz
          const batchYieldValue = recipe.batchYield || 1;
          const yieldUnit = recipe.containerType?.toLowerCase().replace(/\d+oz\s*/i, '').trim() || 'jar';
          const ozPerUnit = yieldToOzConversions[yieldUnit] || 8;
          const batchYieldInOz = batchYieldValue * ozPerUnit;

          costPerOz = batchYieldInOz > 0 ? batchIngredientCost / batchYieldInOz : 0;
        }

        // Add cost breakdown to each size
        const sizesWithCosts = flavor.sizes.map((size) => {
          const ingredientCost = costPerOz * size.sizeOz;
          const labelCost = (size as { labelCost?: number }).labelCost ?? 15;
          const containerCost = (size as { containerCost?: number }).containerCost ?? 100;
          const cogs = ingredientCost + (labelCost / 100) + (containerCost / 100);
          const suggestedPrice = cogs / 0.6; // 40% margin
          const margin = size.unitPrice > 0 ? ((size.unitPrice / 100 - cogs) / (size.unitPrice / 100)) * 100 : 0;

          return {
            ...size,
            ingredientCost: Math.round(ingredientCost * 100), // in cents
            labelCost,
            containerCost,
            cogs: Math.round(cogs * 100), // in cents
            suggestedPrice: Math.round(suggestedPrice * 100), // in cents
            margin: Math.round(margin),
          };
        });

        return {
          ...flavor,
          fullName: `${flavor.name} ${category.name}`.trim(),
          totalQuantity,
          minPrice,
          maxPrice,
          hasStock: totalQuantity > 0,
          costPerOz: Math.round(costPerOz * 100), // in cents
          sizes: sizesWithCosts,
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


