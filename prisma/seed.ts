import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Product list from requirements
  const products = [
    {
      name: 'Applesauce',
      description: 'Homemade applesauce made from heritage apples, smooth and naturally sweet.',
      price: 0, // TBD - will be set later
      imageUrl: 'https://placehold.co/400x400/8B4513/FFFFFF?text=Applesauce',
      isAvailable: true,
    },
    {
      name: 'Sugar-Free Applesauce',
      description: 'Naturally sweet applesauce with no added sugar, perfect for those watching their sugar intake.',
      price: 0,
      imageUrl: 'https://placehold.co/400x400/8B4513/FFFFFF?text=Sugar-Free+Applesauce',
      isAvailable: true,
    },
    {
      name: 'Apple Rings',
      description: 'Dehydrated apple rings, a healthy and delicious snack made from heritage apples.',
      price: 0,
      imageUrl: 'https://placehold.co/400x400/8B4513/FFFFFF?text=Apple+Rings',
      isAvailable: true,
    },
    {
      name: 'Apple Butter',
      description: 'Smooth, spreadable apple butter made with heritage apples and warm spices.',
      price: 0,
      imageUrl: 'https://placehold.co/400x400/8B4513/FFFFFF?text=Apple+Butter',
      isAvailable: true,
    },
    {
      name: 'Apple Chips',
      description: 'Crispy apple chips, a crunchy snack made from thinly sliced heritage apples.',
      price: 0,
      imageUrl: 'https://placehold.co/400x400/8B4513/FFFFFF?text=Apple+Chips',
      isAvailable: true,
    },
    {
      name: 'Raspberry Jam',
      description: 'Sweet and tangy raspberry jam, perfect for toast, pastries, or as a gift.',
      price: 0,
      imageUrl: 'https://placehold.co/400x400/8B4513/FFFFFF?text=Raspberry+Jam',
      isAvailable: true,
    },
    {
      name: 'Blueberry Jam',
      description: 'Rich blueberry jam bursting with flavor, made with care and attention to detail.',
      price: 0,
      imageUrl: 'https://placehold.co/400x400/8B4513/FFFFFF?text=Blueberry+Jam',
      isAvailable: true,
    },
    {
      name: 'Apple Jam',
      description: 'Classic apple jam made from heritage apples, a versatile spread for any occasion.',
      price: 0,
      imageUrl: 'https://placehold.co/400x400/8B4513/FFFFFF?text=Apple+Jam',
      isAvailable: true,
    },
    {
      name: 'Pickled Green Beans',
      description: 'Crisp pickled green beans with a tangy flavor, perfect as a snack or side dish.',
      price: 0,
      imageUrl: 'https://placehold.co/400x400/8B4513/FFFFFF?text=Pickled+Green+Beans',
      isAvailable: true,
    },
    {
      name: 'Pickles',
      description: 'Traditional pickles made with care, crunchy and full of flavor.',
      price: 0,
      imageUrl: 'https://placehold.co/400x400/8B4513/FFFFFF?text=Pickles',
      isAvailable: true,
    },
  ];

  // Create products (skip if already exists)
  console.log('📦 Creating products...');
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
      console.log(`  ⊙ Skipped: ${product.name} (already exists)`);
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

