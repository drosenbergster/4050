/**
 * Seed script for Seasonal Planner
 * Portland, OR (Zone 8b) crops and monthly production tasks
 * 
 * Run with: npx ts-node prisma/seed-seasonal-planner.ts
 */

import { PrismaClient, CropType } from '@prisma/client';

const prisma = new PrismaClient();

// Portland, OR Zone 8b Crops with accurate harvest windows
const PORTLAND_CROPS = [
  {
    name: "Apples",
    type: CropType.PERENNIAL,
    seedStartWeek: null,
    seedStartNotes: null,
    plantOutWeekStart: null,
    plantOutWeekEnd: null,
    directSow: false,
    harvestStart: 35,  // Sep 1
    harvestEnd: 46,    // Nov 15
    peakStart: 40,     // Oct 1
    peakEnd: 44,       // Oct 31
    color: "#C41E3A",
    notes: "Heritage varieties. Peak harvest in October. Late varieties store well into winter."
  },
  {
    name: "Tomatoes",
    type: CropType.ANNUAL,
    seedStartWeek: 5,   // Feb 1 (8 weeks before last frost ~Mar 15)
    seedStartNotes: "Start indoors 8 weeks before last frost (Feb 1)",
    plantOutWeekStart: 20, // May 15
    plantOutWeekEnd: 24,   // Jun 15
    directSow: false,
    harvestStart: 29,  // Jul 15
    harvestEnd: 41,    // Oct 15
    peakStart: 33,     // Aug 15
    peakEnd: 37,       // Sep 15
    color: "#E74C3C",
    notes: "Needs consistent summer heat. Protect from late blight in wet fall weather."
  },
  {
    name: "Cucumbers",
    type: CropType.ANNUAL,
    seedStartWeek: 15,  // Apr 15 (3-4 weeks before transplant)
    seedStartNotes: "Start indoors 3-4 weeks before transplant, or direct sow after soil warms",
    plantOutWeekStart: 20,
    plantOutWeekEnd: 24,
    directSow: true,   // Can direct sow OR start indoors
    harvestStart: 25,
    harvestEnd: 39,
    peakStart: 29,
    peakEnd: 35,
    color: "#27AE60",
    notes: "Succession plant every 2-3 weeks for continuous harvest. Great for pickles!"
  },
  {
    name: "Green Beans",
    type: CropType.ANNUAL,
    seedStartWeek: null, // Direct sow only
    seedStartNotes: null,
    plantOutWeekStart: 18, // May 1
    plantOutWeekEnd: 27,   // Jul 1
    directSow: true,
    harvestStart: 24,
    harvestEnd: 39,
    peakStart: 27,
    peakEnd: 31,
    color: "#2ECC71",
    notes: "Direct sow only - beans don't like transplanting. Multiple succession plantings for extended harvest."
  },
  {
    name: "Peppers",
    type: CropType.ANNUAL,
    seedStartWeek: 5,   // Feb 1
    seedStartNotes: "Start indoors 8-10 weeks before last frost (Feb 1). Peppers need warmth!",
    plantOutWeekStart: 20,
    plantOutWeekEnd: 24,
    directSow: false,
    harvestStart: 29,
    harvestEnd: 41,
    peakStart: 33,
    peakEnd: 39,
    color: "#F39C12",
    notes: "Need warm soil (60°F+). Similar timing to tomatoes. Great for pepper jelly and pickled peppers."
  },
  {
    name: "Blueberries",
    type: CropType.PERENNIAL,
    seedStartWeek: null,
    seedStartNotes: null,
    plantOutWeekStart: null,
    plantOutWeekEnd: null,
    directSow: false,
    harvestStart: 24,
    harvestEnd: 33,
    peakStart: 27,
    peakEnd: 30,
    color: "#3498DB",
    notes: "Pacific Northwest is prime blueberry country! Acidic soil preferred."
  },
  {
    name: "Raspberries",
    type: CropType.PERENNIAL,
    seedStartWeek: null,
    seedStartNotes: null,
    plantOutWeekStart: null,
    plantOutWeekEnd: null,
    directSow: false,
    harvestStart: 23,
    harvestEnd: 41,
    peakStart: 24,
    peakEnd: 30,
    color: "#E91E63",
    notes: "Summer varieties: Jun-Jul. Everbearing/fall varieties: Aug-Oct. Perfect for jam!"
  },
  {
    name: "Plums",
    type: CropType.PERENNIAL,
    seedStartWeek: null,
    seedStartNotes: null,
    plantOutWeekStart: null,
    plantOutWeekEnd: null,
    directSow: false,
    harvestStart: 29,
    harvestEnd: 37,
    peakStart: 32,
    peakEnd: 35,
    color: "#9B59B6",
    notes: "Timing varies by variety. Great for jam, butter, and fresh eating."
  },
  {
    name: "Peas",
    type: CropType.ANNUAL,
    seedStartWeek: null,
    seedStartNotes: null,
    plantOutWeekStart: 7,  // Feb 15
    plantOutWeekEnd: 20,   // May 15
    directSow: true,
    harvestStart: 16,
    harvestEnd: 26,
    peakStart: 18,
    peakEnd: 22,
    color: "#1ABC9C",
    notes: "Cool season crop - Portland's spring is perfect! Direct sow as early as Feb. Heat stops production."
  },
  {
    name: "Basil",
    type: CropType.ANNUAL,
    seedStartWeek: 11,  // Mar 15
    seedStartNotes: "Start indoors 6 weeks before last frost (mid-March)",
    plantOutWeekStart: 20,
    plantOutWeekEnd: 24,
    directSow: false,
    harvestStart: 22,
    harvestEnd: 41,
    peakStart: 29,
    peakEnd: 35,
    color: "#16A085",
    notes: "Frost sensitive! Wait until soil is warm. Make pesto and freeze for winter."
  },
  {
    name: "Parsley",
    type: CropType.BIENNIAL,
    seedStartWeek: 5,   // Feb 1
    seedStartNotes: "Start indoors 6 weeks before last frost, or direct sow in spring",
    plantOutWeekStart: 11, // Mar 15
    plantOutWeekEnd: 29,   // Jul 15
    directSow: true,
    harvestStart: 11,
    harvestEnd: 46,
    peakStart: null,
    peakEnd: null,
    color: "#27AE60",
    notes: "Nearly year-round in Portland's mild climate. Biennial - will bolt second year."
  },
  {
    name: "Sorrel",
    type: CropType.PERENNIAL,
    seedStartWeek: null,
    seedStartNotes: null,
    plantOutWeekStart: null,
    plantOutWeekEnd: null,
    directSow: false,
    harvestStart: 9,
    harvestEnd: 48,
    peakStart: 14,
    peakEnd: 20,
    color: "#2ECC71",
    notes: "Perennial! One of the first greens up in spring. Lemony flavor great for pesto and soups."
  }
];

// Monthly production tasks based on the Heritage Orchard guide
const SEASONAL_TASKS = [
  // MARCH - Prep & Planning
  { month: 3, title: "Order jars, lids, labels in bulk (400-500 units)", sortOrder: 1 },
  { month: 3, title: "Apply for summer farmers markets", sortOrder: 2 },
  { month: 3, title: "Test recipes, finalize product line for the year", sortOrder: 3 },
  { month: 3, title: "Design/update labels with mission story", sortOrder: 4 },
  { month: 3, title: "Check licenses/permits (Cottage Food License)", sortOrder: 5 },

  // APRIL - Early Season
  { month: 4, title: "Start tomato and pepper seeds indoors (if not done in Feb)", sortOrder: 1 },
  { month: 4, title: "Direct sow peas if not done in Feb/Mar", sortOrder: 2 },
  { month: 4, title: "Harvest early sorrel for fresh sales", sortOrder: 3 },
  { month: 4, title: "Make sorrel pesto - freeze for later", sortOrder: 4 },

  // MAY - Spring Planting
  { month: 5, title: "Transplant tomatoes, peppers, basil after May 15", sortOrder: 1 },
  { month: 5, title: "Direct sow beans and cucumbers", sortOrder: 2 },
  { month: 5, title: "Start attending farmers markets with fresh herbs", sortOrder: 3 },
  { month: 5, title: "Pea harvest - pickled snap peas production", sortOrder: 4 },
  { month: 5, title: "Begin basil pesto production - freeze portions", sortOrder: 5 },

  // JUNE - Berry Season Begins
  { month: 6, title: "Blueberry harvest begins - start jam production", weekOfMonth: 2, sortOrder: 1 },
  { month: 6, title: "Raspberry harvest begins", weekOfMonth: 2, sortOrder: 2 },
  { month: 6, title: "First cucumber harvest - test pickle recipe", sortOrder: 3 },
  { month: 6, title: "Continue basil pesto production", sortOrder: 4 },
  { month: 6, title: "Markets: 2x/week with fresh berries + jams", sortOrder: 5 },

  // JULY - Peak Summer Production
  { month: 7, title: "🥒 PICKLE DAY: Dill pickles + pickled beans (50-75 jars)", weekOfMonth: 1, sortOrder: 1 },
  { month: 7, title: "🫐 JAM DAY: Raspberry jam, mixed berry jam", weekOfMonth: 2, sortOrder: 2 },
  { month: 7, title: "🌿 PESTO DAY: Freeze 30-40 portions for fall/winter", weekOfMonth: 3, sortOrder: 3 },
  { month: 7, title: "Second pickle batch if cucumbers abundant", weekOfMonth: 3, sortOrder: 4 },
  { month: 7, title: "Begin CSA partnership deliveries if applicable", sortOrder: 5 },
  { month: 7, notes: "Peak season: 25-35 hrs/week production", title: "⚠️ Peak production month - schedule help if needed", sortOrder: 6 },

  // AUGUST - Late Summer Push
  { month: 8, title: "🍅 BIG TOMATO DAY: Sauce, marinara, salsa (100+ jars)", weekOfMonth: 1, sortOrder: 1 },
  { month: 8, title: "Plum harvest - jam and butter production", weekOfMonth: 2, sortOrder: 2 },
  { month: 8, title: "Final pickle batch", sortOrder: 3 },
  { month: 8, title: "🌶️ Pickled peppers and pepper jelly production", sortOrder: 4 },
  { month: 8, title: "Continue tomato processing as harvest continues", sortOrder: 5 },

  // SEPTEMBER - Transition Month
  { month: 9, title: "Finish remaining summer products", sortOrder: 1 },
  { month: 9, title: "Begin apple chip production (dehydrator)", sortOrder: 2 },
  { month: 9, title: "Test applesauce recipe with early apples", sortOrder: 3 },
  { month: 9, title: "Plan apple picking party dates and recruit volunteers", sortOrder: 4 },
  { month: 9, title: "Clean and prep equipment for apple season", sortOrder: 5 },

  // OCTOBER - Apple Harvest Peak
  { month: 10, title: "🍎 PICKING PARTY #1: Harvest 300-400 lbs", weekOfMonth: 1, sortOrder: 1 },
  { month: 10, title: "🍎 PICKING PARTY #2: Harvest remaining 600 lbs", weekOfMonth: 2, sortOrder: 2 },
  { month: 10, title: "APPLESAUCE DAYS: Process 200-300 lbs (80-100 quart jars)", weekOfMonth: 2, sortOrder: 3 },
  { month: 10, title: "APPLE BUTTER DAY: Process 100 lbs (60-80 8oz jars)", weekOfMonth: 3, sortOrder: 4 },
  { month: 10, title: "Run dehydrator 24/7 for apple chips", sortOrder: 5 },
  { month: 10, title: "Markets: 2x/week selling summer products + fresh apples", sortOrder: 6 },
  { month: 10, notes: "Peak apple season: 30-40 hrs/week ⚠️", title: "⚠️ Peak apple production - this is the big push!", sortOrder: 7 },

  // NOVEMBER - Finish & Holiday Prep
  { month: 11, title: "Final applesauce and apple butter batches", weekOfMonth: 1, sortOrder: 1 },
  { month: 11, title: "Start apple scrap vinegar (ready in 2-3 months)", sortOrder: 2 },
  { month: 11, title: "Finish apple chip production", sortOrder: 3 },
  { month: 11, title: "📦 Assemble gift boxes and holiday bundles", weekOfMonth: 3, sortOrder: 4 },
  { month: 11, title: "Photograph products for online sales", sortOrder: 5 },
  { month: 11, title: "Prep wholesale and corporate gift orders", sortOrder: 6 },
  { month: 11, title: "Last farmers markets of season", sortOrder: 7 },

  // DECEMBER - Holiday Sales
  { month: 12, title: "🎄 Holiday markets and fairs", sortOrder: 1 },
  { month: 12, title: "Corporate gift deliveries", sortOrder: 2 },
  { month: 12, title: "Gift set assembly and shipping", sortOrder: 3 },
  { month: 12, title: "Light production - thaw frozen pesto for sales", sortOrder: 4 },

  // JANUARY - Planning
  { month: 1, title: "Calculate total annual impact/donations", sortOrder: 1 },
  { month: 1, title: "Indoor markets if available", sortOrder: 2 },
  { month: 1, title: "Catch up on bookkeeping", sortOrder: 3 },
  { month: 1, title: "Plan next year's garden and product line", sortOrder: 4 },
  { month: 1, title: "Order seeds and supplies", sortOrder: 5 },
  { month: 1, title: "Bottle apple scrap vinegar (if started in Nov)", sortOrder: 6 },

  // FEBRUARY - Seed Starting
  { month: 2, title: "Start tomato seeds indoors (Week 1)", weekOfMonth: 1, sortOrder: 1 },
  { month: 2, title: "Start pepper seeds indoors (Week 1)", weekOfMonth: 1, sortOrder: 2 },
  { month: 2, title: "Start parsley seeds indoors", weekOfMonth: 2, sortOrder: 3 },
  { month: 2, title: "Direct sow peas outdoors (after mid-Feb if soil workable)", weekOfMonth: 3, sortOrder: 4 },
  { month: 2, title: "Review and update product pricing", sortOrder: 5 },
  { month: 2, title: "Finalize farmers market applications", sortOrder: 6 },
];

async function main() {
  const currentYear = new Date().getFullYear();
  
  console.log('🌱 Seeding Seasonal Planner data for Portland, OR (Zone 8b)...\n');

  // Seed crops
  console.log('📅 Seeding crops...');
  for (const crop of PORTLAND_CROPS) {
    const existing = await prisma.crop.findFirst({ where: { name: crop.name } });
    if (existing) {
      console.log(`  ⏭️  Skipping ${crop.name} (already exists)`);
      continue;
    }
    
    await prisma.crop.create({ data: crop });
    console.log(`  ✅ Created ${crop.name}`);
  }

  // Seed tasks for current year
  console.log(`\n📋 Seeding seasonal tasks for ${currentYear}...`);
  
  // Check if tasks already exist for this year
  const existingTasks = await prisma.seasonalTask.count({ where: { year: currentYear } });
  if (existingTasks > 0) {
    console.log(`  ⏭️  Tasks already exist for ${currentYear} (${existingTasks} tasks). Skipping.`);
  } else {
    for (const task of SEASONAL_TASKS) {
      await prisma.seasonalTask.create({
        data: {
          ...task,
          year: currentYear,
        },
      });
    }
    console.log(`  ✅ Created ${SEASONAL_TASKS.length} tasks for ${currentYear}`);
  }

  // Summary
  const cropCount = await prisma.crop.count();
  const taskCount = await prisma.seasonalTask.count({ where: { year: currentYear } });
  
  console.log('\n✨ Seed complete!');
  console.log(`   📅 ${cropCount} crops in database`);
  console.log(`   📋 ${taskCount} tasks for ${currentYear}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

