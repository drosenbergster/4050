import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['query', 'error', 'warn'],
});

async function main() {
  console.log('🌱 Starting seed...');

  // Product list from requirements - Updated with prices and categories matching shop page
  const products = [
    {
      name: 'Classic Applesauce',
      description: 'Our signature smooth applesauce made from fresh-picked apples. Traditional recipe with natural sweetness.',
      price: 899, // $8.99
      category: 'Applesauce',
      imageUrl: 'https://placehold.co/400x400/F5EDE4/8B7355?text=Classic+Applesauce',
      isAvailable: true,
    },
    {
      name: 'Sugar-Free Applesauce',
      description: 'Pure applesauce with no added sugar. Just the natural sweetness of homegrown apples.',
      price: 899, // $8.99
      category: 'Applesauce',
      imageUrl: 'https://placehold.co/400x400/F5EDE4/8B7355?text=Sugar-Free+Applesauce',
      isAvailable: true,
    },
    {
      name: 'Apple Rings',
      description: 'Delicately dried apple rings. Perfect for snacking or adding to your favorite recipes.',
      price: 799, // $7.99
      category: 'Dried Goods',
      imageUrl: 'https://placehold.co/400x400/F5EDE4/8B7355?text=Apple+Rings',
      isAvailable: true,
    },
    {
      name: 'Apple Butter',
      description: 'Rich, creamy apple butter slow-cooked to perfection. Spread it on toast or enjoy by the spoonful.',
      price: 1099, // $10.99
      category: 'Spreads',
      imageUrl: 'https://placehold.co/400x400/F5EDE4/8B7355?text=Apple+Butter',
      isAvailable: true,
    },
    {
      name: 'Apple Chips',
      description: 'Crispy, naturally sweet apple chips. A healthy snack made from orchard-fresh apples.',
      price: 699, // $6.99
      category: 'Dried Goods',
      imageUrl: 'https://placehold.co/400x400/F5EDE4/8B7355?text=Apple+Chips',
      isAvailable: true,
    },
    {
      name: 'Raspberry Jam',
      description: 'Vibrant raspberry jam bursting with fresh berry flavor. Perfect for your morning toast.',
      price: 1199, // $11.99
      category: 'Jams',
      imageUrl: 'https://placehold.co/400x400/F5EDE4/8B7355?text=Raspberry+Jam',
      isAvailable: true,
    },
    {
      name: 'Blueberry Jam',
      description: 'Sweet blueberry jam made with handpicked berries. A family favorite for generations.',
      price: 1199, // $11.99
      category: 'Jams',
      imageUrl: 'https://placehold.co/400x400/F5EDE4/8B7355?text=Blueberry+Jam',
      isAvailable: true,
    },
    {
      name: 'Apple Jam',
      description: "Unique apple jam with hints of cinnamon. Ilene's special recipe passed down through generations.",
      price: 1099, // $10.99
      category: 'Jams',
      imageUrl: 'https://placehold.co/400x400/F5EDE4/8B7355?text=Apple+Jam',
      isAvailable: true,
    },
    {
      name: 'Pickled Green Beans',
      description: 'Crisp, tangy pickled green beans. A delicious addition to any meal or charcuterie board.',
      price: 999, // $9.99
      category: 'Pickled',
      imageUrl: 'https://placehold.co/400x400/F5EDE4/8B7355?text=Pickled+Green+Beans',
      isAvailable: true,
    },
    {
      name: 'Classic Dill Pickles',
      description: 'Crunchy dill pickles with the perfect balance of tangy and savory flavors.',
      price: 999, // $9.99
      category: 'Pickled',
      imageUrl: 'https://placehold.co/400x400/F5EDE4/8B7355?text=Classic+Dill+Pickles',
      isAvailable: true,
    },
  ];

  // Create or update products
  console.log('📦 Creating/updating products...');
  for (const product of products) {
    const existing = await prisma.product.findFirst({
      where: { name: product.name },
    });
    
    if (!existing) {
      await prisma.product.create({
        data: product,
      });
      console.log(`  ✓ Created: ${product.name}`);
    } else {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          imageUrl: product.imageUrl,
          description: product.description,
          price: product.price,
          category: product.category,
        },
      });
      console.log(`  ↻ Updated: ${product.name} (price, category, image & description)`);
    }
  }

  console.log('✅ Seed completed!');
  console.log(`\n📊 Created/updated ${products.length} products with prices and categories`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

