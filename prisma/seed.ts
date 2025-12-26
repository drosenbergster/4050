import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function main() {
  console.log('🌱 Starting seed...');

  // Product list from requirements - Updated with prices and categories matching shop page
  const products = [
    {
      name: 'Classic Applesauce',
      description: "The heritage trees at 4050 don't ask for permission to be generous. This is the smooth, honest taste of a PNW autumn—pure, sun-ripened apples and nothing else.",
      price: 899, // $8.99
      category: 'Applesauces',
      imageUrl: 'https://placehold.co/400x400/F5EDE4/5C4A3D?text=Classic+Applesauce',
      isAvailable: true,
    },
    {
      name: 'Sugar-Free Applesauce',
      description: 'Exactly as the garden provided. No extra sweetness needed when the morning mist and afternoon sun have already done the work. Just heritage apples, slow-simmered.',
      price: 899, // $8.99
      category: 'Applesauces',
      imageUrl: 'https://placehold.co/400x400/F5EDE4/5C4A3D?text=Sugar-Free+Applesauce',
      isAvailable: true,
    },
    {
      name: 'Apple Rings',
      description: 'Thinly sliced memories of the orchard, dried slowly by the kitchen window. A concentrated crunch of the Pacific Northwest autumn, perfect for sharing over a fence.',
      price: 799, // $7.99
      category: 'Dried Goods',
      imageUrl: 'https://placehold.co/400x400/F5EDE4/5C4A3D?text=Apple+Rings',
      isAvailable: true,
    },
    {
      name: 'Apple Butter',
      description: "A concentrated harvest. We take the abundance of our two oldest trees and slow-cook it until it's dark, rich, and carries the deep essence of the 4050 backyard.",
      price: 1099, // $10.99
      category: 'Spreads',
      imageUrl: 'https://placehold.co/400x400/F5EDE4/5C4A3D?text=Apple+Butter',
      isAvailable: true,
    },
    {
      name: 'Apple Chips',
      description: 'Crispy, sun-kissed slices of our backyard bounty. Simple and honest, like a conversation on a porch swing. No additives, just air and orchard-fresh flavor.',
      price: 699, // $6.99
      category: 'Dried Goods',
      imageUrl: 'https://placehold.co/400x400/F5EDE4/5C4A3D?text=Apple+Chips',
      isAvailable: true,
    },
    {
      name: 'Raspberry Jam',
      description: 'From the wild brambles that insisted on growing over the garden fence. Bright, tart, and bursting with the vibrant energy of a PNW summer morning.',
      price: 1199, // $11.99
      category: 'Jams',
      imageUrl: 'https://placehold.co/400x400/F5EDE4/5C4A3D?text=Raspberry+Jam',
      isAvailable: true,
    },
    {
      name: 'Blueberry Jam',
      description: "The garden was particularly kind this July. We've preserved that generosity in every jar—fat, sun-warmed berries turned into a sweet morning tradition.",
      price: 1199, // $11.99
      category: 'Jams',
      imageUrl: 'https://placehold.co/400x400/F5EDE4/5C4A3D?text=Blueberry+Jam',
      isAvailable: true,
    },
    {
      name: 'Apple Jam',
      description: "A different way to celebrate what the heritage trees gave us this year. Ilene's secret recipe, spiked with a touch of cinnamon and a lot of gratitude.",
      price: 1099, // $10.99
      category: 'Jams',
      imageUrl: 'https://placehold.co/400x400/F5EDE4/5C4A3D?text=Apple+Jam',
      isAvailable: true,
    },
    {
      name: 'Pickled Green Beans',
      description: 'The garden gave us more beans than we could eat fresh, so we honored their crunch with a tangy brine. A sharp, savory snap from the 4050 soil.',
      price: 999, // $9.99
      category: 'Pickled Goods',
      imageUrl: 'https://placehold.co/400x400/F5EDE4/5C4A3D?text=Pickled+Green+Beans',
      isAvailable: true,
    },
    {
      name: 'Classic Dill Pickles',
      description: 'Straight from the dark PNW soil to the pickling jar. Honest, crunchy, and packed with the herbs that grow between our heritage apple trees.',
      price: 999, // $9.99
      category: 'Pickled Goods',
      imageUrl: 'https://placehold.co/400x400/F5EDE4/5C4A3D?text=Classic+Dill+Pickles',
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

