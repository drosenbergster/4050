import { prisma } from '@/lib/server/db';
import { Product } from '@/lib/types';
import ProductGridWithFilters from '@/app/components/product-grid-with-filters';
import { STATIC_PRODUCTS } from '@/lib/static-data';

async function getProducts(): Promise<(Product & { category: string })[]> {
  try {
    const dbProducts = await prisma.product.findMany({
      where: { isAvailable: true },
      orderBy: { name: 'asc' },
    });

    // Use category from database, fallback to 'Other' if not set
    return dbProducts.map((p: Product & { category?: string | null }) => ({
      ...p,
      category: p.category || 'Other',
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
    }));
  } catch (error) {
    console.error('Database connection failed, using static data:', error);
    return STATIC_PRODUCTS;
  }
}

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <main className="bg-[#FDF8F3] min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16 px-4">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-[#5C4A3D] mb-6">
            From the Garden
          </h1>
          <div className="w-24 h-px bg-[#5C4A3D] mx-auto mb-8 opacity-20"></div>
          <p className="text-xl text-[#636E72] font-serif italic leading-relaxed">
            The two heritage apple trees in our Pacific Northwest backyard don’t ask permission to be generous. Every season, they provide exactly what we need, and we make exactly what they provide. This is what’s on the counter today.
          </p>
        </div>
        <ProductGridWithFilters products={products} />
      </div>
    </main>
  );
}
