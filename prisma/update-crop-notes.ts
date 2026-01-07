/**
 * Update existing crops with comprehensive growing notes
 * Portland, OR (Zone 8b/9a) specific information
 * 
 * Run with: npx ts-node prisma/update-crop-notes.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Updated crop information with comprehensive notes
const CROP_UPDATES = [
  {
    name: "Apples",
    seedStartNotes: null,
    notes: "🍎 PERENNIAL TREE | Heritage varieties from established trees. Harvest when fruit separates easily from branch with slight twist. Store at 32-40°F for 2-6 months depending on variety. Peak picking parties in October!"
  },
  {
    name: "Tomatoes",
    seedStartWeek: 6,
    seedStartNotes: "Start indoors 8-10 weeks before last frost (early Feb). Keep at 70-85°F.",
    plantOutWeekStart: 20,
    plantOutWeekEnd: 24,
    harvestStart: 28,
    harvestEnd: 42,
    peakStart: 32,
    peakEnd: 38,
    notes: "🌡️ Soil temp: 70-85°F for germination | ⏱️ Germination: 5-10 days | 📅 60-85 days from transplant to harvest. Transplant when night temps stay above 50°F. Protect from late blight in wet fall weather. Determinate varieties ripen all at once (great for sauce day!)."
  },
  {
    name: "Cucumbers",
    seedStartWeek: 16,
    seedStartNotes: "Start indoors 3-4 weeks before transplant OR direct sow after last frost when soil is 60°F+",
    plantOutWeekStart: 20,
    plantOutWeekEnd: 26,
    harvestStart: 25,
    harvestEnd: 38,
    peakStart: 28,
    peakEnd: 34,
    notes: "🌡️ Soil temp: 60-95°F, optimal 70-85°F | ⏱️ Germination: 3-10 days | 📅 50-70 days to harvest. Succession plant every 2-3 weeks. Pick at 2-4\" for cornichons, 4-6\" for pickles, 6-8\" for slicing. Don't let fruits get too large - reduces production!"
  },
  {
    name: "Green Beans",
    plantOutWeekStart: 18,
    plantOutWeekEnd: 28,
    harvestStart: 24,
    harvestEnd: 38,
    peakStart: 27,
    peakEnd: 32,
    notes: "🌡️ Soil temp: 60-85°F, optimal 70-80°F | ⏱️ Germination: 6-14 days | 📅 Bush: 50-60 days, Pole: 60-70 days. DIRECT SOW ONLY - beans hate transplanting! Plant 1\" deep, 3\" apart. Succession plant every 2-3 weeks May-July for continuous harvest. Pick when pencil-thick."
  },
  {
    name: "Peppers",
    seedStartWeek: 5,
    seedStartNotes: "Start indoors 8-10 weeks before last frost (late Jan-early Feb). Bottom heat helps - peppers need 80-90°F for germination!",
    plantOutWeekStart: 21,
    plantOutWeekEnd: 25,
    harvestStart: 28,
    harvestEnd: 42,
    peakStart: 32,
    peakEnd: 39,
    notes: "🌡️ Soil temp: 70-90°F, optimal 80-85°F | ⏱️ Germination: 10-21 days (SLOW - be patient!) | 📅 60-90 days from transplant. Wait for soil to reach 65°F before transplanting. Green peppers = immature; leave on plant for red/yellow. Great for pepper jelly!"
  },
  {
    name: "Blueberries",
    notes: "🫐 PERENNIAL SHRUB | Pacific Northwest is prime blueberry country! Needs acidic soil pH 4.5-5.5. Add sulfur if needed. Mulch heavily with pine needles or bark. Net to protect from birds during harvest. Berries ready when they fall off easily into your hand."
  },
  {
    name: "Raspberries",
    harvestStart: 23,
    harvestEnd: 40,
    notes: "🍇 PERENNIAL CANES | Summer-bearing: June-July. Everbearing: June-July + Sept-Oct. Harvest when berries pull off easily with slight tug. Pick every 2-3 days during peak. Prune summer-bearing after fruiting; leave everbearing fall canes until spring. Perfect for jam!"
  },
  {
    name: "Plums",
    notes: "🍑 PERENNIAL TREE | Japanese varieties ripen earlier (July) than European (Aug-Sep). Harvest when fruit gives slightly to pressure and separates from stem. Thin fruits in spring to 4-6\" apart for larger size. Excellent for jam, butter, and wine!"
  },
  {
    name: "Peas",
    plantOutWeekStart: 7,
    plantOutWeekEnd: 18,
    harvestStart: 14,
    harvestEnd: 26,
    notes: "🌡️ Soil temp: 40-75°F, optimal 55-65°F | ⏱️ Germination: 7-14 days | 📅 55-70 days to harvest. COOL SEASON - sow as early as soil can be worked! Tolerates light frost. Inoculate seeds with rhizobium for nitrogen fixing. Heat above 80°F stops production - get them in early!"
  },
  {
    name: "Basil",
    seedStartWeek: 10,
    seedStartNotes: "Start indoors 6-8 weeks before last frost (early March). Needs light to germinate - don't cover seeds!",
    plantOutWeekStart: 21,
    plantOutWeekEnd: 26,
    harvestStart: 24,
    harvestEnd: 40,
    peakStart: 28,
    peakEnd: 36,
    notes: "🌡️ Soil temp: 70°F minimum | ⏱️ Germination: 5-10 days | 📅 60-90 days to harvest. FROST SENSITIVE! Wait until night temps stay above 50°F. Pinch flower buds to extend harvest. Make pesto in bulk and freeze in ice cube trays for winter!"
  },
  {
    name: "Parsley",
    seedStartWeek: 6,
    seedStartNotes: "Start indoors 6-10 weeks before last frost. Soak seeds 24hrs to speed germination. VERY SLOW to sprout!",
    plantOutWeekStart: 12,
    plantOutWeekEnd: 30,
    harvestStart: 12,
    notes: "🌡️ Soil temp: 50-85°F, optimal 65-70°F | ⏱️ Germination: 14-28 days (VERY SLOW!) | 📅 70-90 days to harvest. Soak seeds 24hr before planting. Nearly year-round in Portland's mild climate. Biennial - flowers and goes to seed in year 2. Curly or flat-leaf varieties."
  },
  {
    name: "Sorrel",
    seedStartWeek: 10,
    seedStartNotes: "Start indoors in spring or direct sow. Easy to establish!",
    plantOutWeekStart: 12,
    plantOutWeekEnd: 20,
    directSow: true,
    notes: "🌡️ Soil temp: 60-70°F optimal | ⏱️ Germination: 7-14 days | 📅 45-60 days from seed. PERENNIAL - returns every year! One of first greens in spring. Harvest outer leaves, leaving crown to regrow. Lemony/tart flavor. Great for pesto, soups, sauces. Tolerates partial shade."
  }
];

async function main() {
  console.log('🌱 Updating crop notes with comprehensive Zone 8b/9a information...\n');

  for (const update of CROP_UPDATES) {
    const { name, ...data } = update;
    
    const crop = await prisma.crop.findFirst({ where: { name } });
    
    if (!crop) {
      console.log(`  ⚠️  ${name} not found in database`);
      continue;
    }

    await prisma.crop.update({
      where: { id: crop.id },
      data: data
    });
    
    console.log(`  ✅ Updated ${name}`);
  }

  console.log('\n✨ All crops updated with comprehensive growing information!');
  console.log('   Includes: soil temperature, germination time, days to harvest');
}

main()
  .catch((e) => {
    console.error('❌ Update failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });




