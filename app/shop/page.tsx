import { prisma } from '@/lib/server/db';
import { Product } from '@/lib/types';
import ProductGrid from '@/app/components/product-grid';

async function getProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { isAvailable: true },
    orderBy: { name: 'asc' },
  });
  
  return products.map(p => ({
    ...p,
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt),
  }));
}

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-serif font-bold mb-8 text-center text-[#2C3E50]">Our Harvest</h1>
      <ProductGrid products={products} />
    </main>
  );
}
