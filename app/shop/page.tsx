import { prisma } from '@/lib/server/db';
import { Product } from '@/lib/types';
import ProductGridWithFilters from '@/app/components/product-grid-with-filters';

// Product data with categories and prices from Figma design
const PRODUCTS_DATA: (Product & { category: string })[] = [
  { id: 'prod_1', name: 'Classic Applesauce', description: 'Our signature smooth applesauce made from fresh-picked apples. Traditional recipe with natural sweetness.', price: 899, imageUrl: 'https://placehold.co/400x400/F5EDE4/8B7355?text=Classic+Applesauce', isAvailable: true, createdAt: new Date(), updatedAt: new Date(), category: 'Applesauce' },
  { id: 'prod_2', name: 'Sugar-Free Applesauce', description: 'Pure applesauce with no added sugar. Just the natural sweetness of homegrown apples.', price: 899, imageUrl: 'https://placehold.co/400x400/F5EDE4/8B7355?text=Sugar-Free+Applesauce', isAvailable: true, createdAt: new Date(), updatedAt: new Date(), category: 'Applesauce' },
  { id: 'prod_3', name: 'Apple Rings', description: 'Delicately dried apple rings. Perfect for snacking or adding to your favorite recipes.', price: 799, imageUrl: 'https://placehold.co/400x400/F5EDE4/8B7355?text=Apple+Rings', isAvailable: true, createdAt: new Date(), updatedAt: new Date(), category: 'Dried Goods' },
  { id: 'prod_4', name: 'Apple Butter', description: 'Rich, creamy apple butter slow-cooked to perfection. Spread it on toast or enjoy by the spoonful.', price: 1099, imageUrl: 'https://placehold.co/400x400/F5EDE4/8B7355?text=Apple+Butter', isAvailable: true, createdAt: new Date(), updatedAt: new Date(), category: 'Spreads' },
  { id: 'prod_5', name: 'Apple Chips', description: 'Crispy, naturally sweet apple chips. A healthy snack made from orchard-fresh apples.', price: 699, imageUrl: 'https://placehold.co/400x400/F5EDE4/8B7355?text=Apple+Chips', isAvailable: true, createdAt: new Date(), updatedAt: new Date(), category: 'Dried Goods' },
  { id: 'prod_6', name: 'Raspberry Jam', description: 'Vibrant raspberry jam bursting with fresh berry flavor. Perfect for your morning toast.', price: 1199, imageUrl: 'https://placehold.co/400x400/F5EDE4/8B7355?text=Raspberry+Jam', isAvailable: true, createdAt: new Date(), updatedAt: new Date(), category: 'Jams' },
  { id: 'prod_7', name: 'Blueberry Jam', description: 'Sweet blueberry jam made with handpicked berries. A family favorite for generations.', price: 1199, imageUrl: 'https://placehold.co/400x400/F5EDE4/8B7355?text=Blueberry+Jam', isAvailable: true, createdAt: new Date(), updatedAt: new Date(), category: 'Jams' },
  { id: 'prod_8', name: 'Apple Jam', description: "Unique apple jam with hints of cinnamon. Ilene's special recipe passed down through generations.", price: 1099, imageUrl: 'https://placehold.co/400x400/F5EDE4/8B7355?text=Apple+Jam', isAvailable: true, createdAt: new Date(), updatedAt: new Date(), category: 'Jams' },
  { id: 'prod_9', name: 'Pickled Green Beans', description: 'Crisp, tangy pickled green beans. A delicious addition to any meal or charcuterie board.', price: 999, imageUrl: 'https://placehold.co/400x400/F5EDE4/8B7355?text=Pickled+Green+Beans', isAvailable: true, createdAt: new Date(), updatedAt: new Date(), category: 'Pickled' },
  { id: 'prod_10', name: 'Classic Dill Pickles', description: 'Crunchy dill pickles with the perfect balance of tangy and savory flavors.', price: 999, imageUrl: 'https://placehold.co/400x400/F5EDE4/8B7355?text=Dill+Pickles', isAvailable: true, createdAt: new Date(), updatedAt: new Date(), category: 'Pickled' },
];

async function getProducts(): Promise<(Product & { category: string })[]> {
  try {
    const dbProducts = await prisma.product.findMany({
      where: { isAvailable: true },
      orderBy: { name: 'asc' },
    });
    
    // Map DB products to include category based on name
    return dbProducts.map((p: Product) => {
      const matchedProduct = PRODUCTS_DATA.find(pd => pd.name.toLowerCase().includes(p.name.toLowerCase().split(' ')[0]));
      return {
        ...p,
        price: matchedProduct?.price || p.price,
        category: matchedProduct?.category || 'Other',
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      };
    });
  } catch (error) {
    console.error('Database connection failed, using static data:', error);
    return PRODUCTS_DATA;
  }
}

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <main className="bg-[#FDF8F3] min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#5C4A3D] mb-4">
            Our Products
          </h1>
          <p className="text-lg text-[#636E72] max-w-2xl mx-auto">
            Each jar is handcrafted with care using traditional methods and the finest homegrown ingredients.
          </p>
        </div>
        <ProductGridWithFilters products={products} />
      </div>
    </main>
  );
}
