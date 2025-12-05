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

  // Product list from requirements - Updated with better stock images
  const products = [
    {
      name: 'Applesauce',
      description: 'Homemade applesauce made from heritage apples, smooth and naturally sweet.',
      price: 0, // TBD - will be set later
      imageUrl: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&h=400&fit=crop',
      isAvailable: true,
    },
    {
      name: 'Sugar-Free Applesauce',
      description: 'Naturally sweet applesauce with no added sugar, perfect for those watching their sugar intake.',
      price: 0,
      imageUrl: 'https://images.unsplash.com/photo-1619546952812-320e9c0e4b26?w=400&h=400&fit=crop',
      isAvailable: true,
    },
    {
      name: 'Apple Rings',
      description: 'Dehydrated apple rings, a healthy and delicious snack made from heritage apples.',
      price: 0,
      imageUrl: 'https://images.unsplash.com/photo-1590005354167-6da97870c757?w=400&h=400&fit=crop',
      isAvailable: true,
    },
    {
      name: 'Apple Butter',
      description: 'Smooth, spreadable apple butter made with heritage apples and warm spices.',
      price: 0,
      imageUrl: 'https://images.unsplash.com/photo-1603309977775-bdc8c4dd4e01?w=400&h=400&fit=crop',
      isAvailable: true,
    },
    {
      name: 'Apple Chips',
      description: 'Crispy apple chips, a crunchy snack made from thinly sliced heritage apples.',
      price: 0,
      imageUrl: 'https://images.unsplash.com/photo-1606312617524-c6c61bf79a0b?w=400&h=400&fit=crop',
      isAvailable: true,
    },
    {
      name: 'Raspberry Jam',
      description: 'Sweet and tangy raspberry jam, perfect for toast, pastries, or as a gift.',
      price: 0,
      imageUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=400&fit=crop',
      isAvailable: true,
    },
    {
      name: 'Blueberry Jam',
      description: 'Rich blueberry jam bursting with flavor, made with care and attention to detail.',
      price: 0,
      imageUrl: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400&h=400&fit=crop',
      isAvailable: true,
    },
    {
      name: 'Apple Jam',
      description: 'Classic apple jam made from heritage apples, a versatile spread for any occasion.',
      price: 0,
      imageUrl: 'https://images.unsplash.com/photo-1603312675949-d4e18f6a1f5a?w=400&h=400&fit=crop',
      isAvailable: true,
    },
    {
      name: 'Pickled Green Beans',
      description: 'Crisp pickled green beans with a tangy flavor, perfect as a snack or side dish.',
      price: 0,
      imageUrl: 'https://images.unsplash.com/photo-1592870449490-29d5c982b2de?w=400&h=400&fit=crop',
      isAvailable: true,
    },
    {
      name: 'Pickles',
      description: 'Traditional pickles made with care, crunchy and full of flavor.',
      price: 0,
      imageUrl: 'https://images.unsplash.com/photo-1589621316382-008455b857cd?w=400&h=400&fit=crop',
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
        },
      });
      console.log(`  ↻ Updated: ${product.name} (new image & description)`);
    }
  }

  console.log('✅ Seed completed!');
  console.log(`\n📊 Created ${products.length} products`);
  console.log('💡 Note: Product prices are set to $0.00 (TBD) - update via admin panel when ready');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

