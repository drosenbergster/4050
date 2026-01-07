/**
 * Seed script to migrate existing hardcoded organizations from lib/causes.ts
 * to the database Organization model.
 * 
 * Run with: npx tsx prisma/seed-organizations.ts
 */

import { PrismaClient, OrganizationCategory, OrganizationStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Existing organizations from lib/causes.ts (hardcoded data to migrate)
const EXISTING_ORGS = [
  {
    id: 'helping-hands-food-bank',
    name: 'Helping Hands Food Bank',
    shortDescription: 'Providing fresh meals and pantry staples to families in need.',
    description: 'Helping Hands Food Bank has been serving our community for over 15 years, providing nutritious meals and emergency food assistance to families facing food insecurity. They distribute over 50,000 pounds of food monthly through their network of community partners.',
    category: 'FOOD' as OrganizationCategory,
    website: 'https://example.com/helping-hands',
    imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&h=300&fit=crop&q=80',
  },
  {
    id: 'greenway-community-gardens',
    name: 'Greenway Community Gardens',
    shortDescription: 'Expanding shared growing spaces across our neighborhoods.',
    description: 'Greenway Community Gardens transforms vacant lots into thriving garden spaces where neighbors come together to grow food, share knowledge, and build community. They currently maintain 8 gardens across the area, providing plots to over 200 families.',
    category: 'GARDEN' as OrganizationCategory,
    website: 'https://example.com/greenway',
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop&q=80',
  },
  {
    id: 'sprouts-youth-program',
    name: 'Sprouts Youth Program',
    shortDescription: 'Connecting kids with nature and teaching life skills.',
    description: 'Sprouts Youth Program offers after-school and summer programs that get kids outdoors, teaching them about gardening, cooking, and environmental stewardship. Their hands-on approach has reached over 500 children, fostering a love for nature and healthy eating.',
    category: 'YOUTH' as OrganizationCategory,
    website: 'https://example.com/sprouts',
    imageUrl: 'https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?w=400&h=300&fit=crop&q=80',
  },
  {
    id: 'neighbors-helping-neighbors',
    name: 'Neighbors Helping Neighbors',
    shortDescription: 'Direct assistance to families facing unexpected hardship.',
    description: 'Neighbors Helping Neighbors provides emergency assistance to local families facing unexpected hardship—whether it\'s help with utilities, rent, medical expenses, or other urgent needs. They believe that community takes care of its own.',
    category: 'COMMUNITY' as OrganizationCategory,
    website: 'https://example.com/neighbors',
    imageUrl: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400&h=300&fit=crop&q=80',
  },
];

async function main() {
  console.log('🌱 Seeding organizations...');

  for (const org of EXISTING_ORGS) {
    // Check if organization already exists (by ID to maintain backward compatibility with orders)
    const existing = await prisma.organization.findUnique({
      where: { id: org.id },
    });

    if (existing) {
      console.log(`  ⏭️  Organization "${org.name}" already exists, skipping...`);
      continue;
    }

    await prisma.organization.create({
      data: {
        id: org.id, // Keep the same ID for backward compatibility with existing orders
        name: org.name,
        shortDescription: org.shortDescription,
        description: org.description,
        category: org.category,
        website: org.website,
        imageUrl: org.imageUrl,
        status: OrganizationStatus.ACTIVE, // Set as active for initial cycle
        activeCycles: ['Spring 2025'], // Mark as active in current cycle
      },
    });

    console.log(`  ✅ Created organization: ${org.name}`);
  }

  console.log('\n✨ Organization seeding complete!');
  
  // Show summary
  const count = await prisma.organization.count();
  const activeCount = await prisma.organization.count({
    where: { status: OrganizationStatus.ACTIVE },
  });
  console.log(`   Total organizations: ${count}`);
  console.log(`   Active organizations: ${activeCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding organizations:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


