import { Product } from '@/lib/types';
// import { prisma } from '@/lib/db'; // Commented out until DB is ready

// Mock data until DB is connected
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Applesauce',
    description: 'Homemade applesauce made from fresh orchard apples.',
    price: 0, // TBD
    imageUrl: 'https://placehold.co/600x400/png?text=Applesauce',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Sugar-Free Applesauce',
    description: 'All the flavor of our classic applesauce, with no added sugar.',
    price: 0,
    imageUrl: 'https://placehold.co/600x400/png?text=Sugar-Free+Applesauce',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'Apple Rings',
    description: 'Dried apple rings, perfect for snacking.',
    price: 0,
    imageUrl: 'https://placehold.co/600x400/png?text=Apple+Rings',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    name: 'Apple Butter',
    description: 'Rich, spiced apple spread slow-cooked to perfection.',
    price: 0,
    imageUrl: 'https://placehold.co/600x400/png?text=Apple+Butter',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    name: 'Apple Chips',
    description: 'Crispy, crunchy dried apple slices.',
    price: 0,
    imageUrl: 'https://placehold.co/600x400/png?text=Apple+Chips',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '6',
    name: 'Raspberry Jam',
    description: 'Sweet and tart raspberry jam.',
    price: 0,
    imageUrl: 'https://placehold.co/600x400/png?text=Raspberry+Jam',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '7',
    name: 'Blueberry Jam',
    description: 'Classic blueberry jam bursting with flavor.',
    price: 0,
    imageUrl: 'https://placehold.co/600x400/png?text=Blueberry+Jam',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '8',
    name: 'Apple Jam',
    description: 'A unique preserve highlighting the essence of apples.',
    price: 0,
    imageUrl: 'https://placehold.co/600x400/png?text=Apple+Jam',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '9',
    name: 'Pickled Green Beans',
    description: 'Crunchy, savory pickled green beans (Dilly Beans).',
    price: 0,
    imageUrl: 'https://placehold.co/600x400/png?text=Pickled+Green+Beans',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '10',
    name: 'Pickles',
    description: 'Traditional cucumber pickles with our signature spice blend.',
    price: 0,
    imageUrl: 'https://placehold.co/600x400/png?text=Pickles',
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

async function getProducts(): Promise<Product[]> {
  // return await prisma.product.findMany({
  //   where: { isAvailable: true },
  //   orderBy: { name: 'asc' },
  // });
  return MOCK_PRODUCTS;
}

import ProductGrid from '@/app/components/product-grid';

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-serif font-bold mb-8 text-center text-[#2C3E50]">Our Harvest</h1>
      <ProductGrid products={products} />
    </main>
  );
}

