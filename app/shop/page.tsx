import { prisma } from '@/lib/server/db';
import ProductGridWithFilters from '@/app/components/product-grid-with-filters';

// Shop product type - includes category name and computed fields
export interface ShopProduct {
  id: string;
  name: string;
  fullName: string;
  description: string;
  imageUrl: string;
  categoryId: string;
  categoryName: string;
  isAvailable: boolean;
  sizes: {
    id: string;
    sizeKey: string;
    sizeLabel: string;
    sizeOz: number;
    unitPrice: number;
    quantity: number;
  }[];
  totalQuantity: number;
  minPrice: number;
  maxPrice: number;
}

interface ShopPageProps {
  searchParams: Promise<{ category?: string }>;
}

async function getProducts(): Promise<ShopProduct[]> {
  try {
    // Fetch flavors with in-stock sizes from the new hierarchy
    const flavors = await prisma.productFlavor.findMany({
      where: {
        isAvailable: true,
        sizes: {
          some: {
            isActive: true,
            quantity: { gt: 0 },
          },
        },
      },
      include: {
        category: true,
        sizes: {
          where: {
            isActive: true,
            quantity: { gt: 0 },
          },
          orderBy: { sizeOz: 'asc' },
        },
      },
      orderBy: [
        { category: { sortOrder: 'asc' } },
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    });

    return flavors.map((flavor) => {
      const prices = flavor.sizes.map((s) => s.unitPrice);
      const totalQuantity = flavor.sizes.reduce((sum, s) => sum + s.quantity, 0);

      return {
        id: flavor.id,
        name: flavor.name,
        fullName: flavor.name,
        description: flavor.description || '',
        imageUrl: flavor.imageUrl || flavor.category.imageUrl || '',
        categoryId: flavor.categoryId,
        categoryName: flavor.category.name,
        isAvailable: flavor.isAvailable,
        sizes: flavor.sizes.map((s) => ({
          id: s.id,
          sizeKey: s.sizeKey,
          sizeLabel: s.sizeLabel,
          sizeOz: s.sizeOz,
          unitPrice: s.unitPrice,
          quantity: s.quantity,
        })),
        totalQuantity,
        minPrice: prices.length > 0 ? Math.min(...prices) : 0,
        maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
      };
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    return [];
  }
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const products = await getProducts();
  const params = await searchParams;
  const initialCategory = params.category || 'All';

  return (
    <main className="bg-[#FDF8F3] min-h-screen py-6 md:py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-8 px-4">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#5C4A3D] mb-3">
            From the Garden
          </h1>
          <div className="w-16 h-px bg-[#5C4A3D] mx-auto mb-4 opacity-20"></div>
          <p className="text-base md:text-lg text-[#636E72] font-serif italic leading-relaxed">
            The two heritage apple trees in our Pacific Northwest backyard don&apos;t ask permission to be generous. Every season, they provide exactly what we need, and we make exactly what they provide.
          </p>
        </div>
        <ProductGridWithFilters products={products} initialCategory={initialCategory} />
      </div>
    </main>
  );
}
