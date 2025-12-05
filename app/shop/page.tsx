import { prisma } from '@/lib/server/db';
import { Product } from '@/lib/types';
import ProductGrid from '@/app/components/product-grid';

// Fallback mock data for when database is unreachable (IPv6 issues locally)
const MOCK_PRODUCTS: Product[] = [
  { id: 'prod_1', name: 'Applesauce', description: 'Homemade applesauce made from fresh orchard apples.', price: 0, imageUrl: 'https://placehold.co/600x400/png?text=Applesauce', isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'prod_2', name: 'Sugar-Free Applesauce', description: 'All the flavor, no added sugar.', price: 0, imageUrl: 'https://placehold.co/600x400/png?text=Sugar-Free+Applesauce', isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'prod_3', name: 'Apple Rings', description: 'Chewy, dried apple rings.', price: 0, imageUrl: 'https://placehold.co/600x400/png?text=Apple+Rings', isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'prod_4', name: 'Apple Butter', description: 'Rich, spiced apple spread.', price: 0, imageUrl: 'https://placehold.co/600x400/png?text=Apple+Butter', isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'prod_5', name: 'Apple Chips', description: 'Crispy dried apple slices.', price: 0, imageUrl: 'https://placehold.co/600x400/png?text=Apple+Chips', isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'prod_6', name: 'Raspberry Jam', description: 'Sweet and tart raspberry jam.', price: 0, imageUrl: 'https://placehold.co/600x400/png?text=Raspberry+Jam', isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'prod_7', name: 'Blueberry Jam', description: 'Classic blueberry jam.', price: 0, imageUrl: 'https://placehold.co/600x400/png?text=Blueberry+Jam', isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'prod_8', name: 'Apple Jam', description: 'A unique apple preserve.', price: 0, imageUrl: 'https://placehold.co/600x400/png?text=Apple+Jam', isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'prod_9', name: 'Pickled Green Beans', description: 'Crunchy dilly beans.', price: 0, imageUrl: 'https://placehold.co/600x400/png?text=Pickled+Green+Beans', isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'prod_10', name: 'Pickles', description: 'Traditional cucumber pickles.', price: 0, imageUrl: 'https://placehold.co/600x400/png?text=Pickles', isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
];

async function getProducts(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: { isAvailable: true },
      orderBy: { name: 'asc' },
    });
    
    return products.map(p => ({
      ...p,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
    }));
  } catch (error) {
    console.error('Database connection failed, using mock data:', error);
    // Return mock data when database is unreachable (e.g., local dev without IPv6)
    return MOCK_PRODUCTS;
  }
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
