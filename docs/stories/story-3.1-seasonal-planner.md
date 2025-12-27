# Story 3.1: Seasonal Planner Tab

## Story

**As an** admin managing 4050's production  
**I want** a Seasonal Planner tab in the admin dashboard  
**So that** I can visualize what's growing when, plan production around harvest windows, track seasonal tasks, and seamlessly create products from costed recipes

---

## Status: In Progress (MVP Complete)

---

## Acceptance Criteria

### 1. Crops Management ✅ COMPLETE
- [x] New "Crops" data model with full lifecycle tracking
- [x] Pre-seeded with **12 Portland, OR (Zone 8b)** crops:
  - Apples, Tomatoes, Cucumbers, Green Beans, Peppers
  - Blueberries, Raspberries, Plums, Peas
  - Basil, Parsley, Sorrel
- [x] Each crop tracks:
  - Type (Annual/Perennial/Biennial)
  - Seed start window (week range, for annuals)
  - Plant/transplant window (week range)
  - Direct sow flag
  - Harvest window (start/end weeks)
  - Peak period (optional)
  - Color for calendar display (now using consistent phase colors)
  - Notes
- [x] Admin can **add, edit, delete** crops
- [x] Crops can optionally link to existing COGS Ingredients

### 2. Seasonal Calendar View ✅ COMPLETE
- [x] **Year view**: 12-month horizontal timeline showing all crops
  - Harvest windows displayed as colored bars
  - Peak periods highlighted (terracotta overlay)
  - Current week indicator
  - Urgency-based sorting (upcoming activities first)
- [x] Visual legend for phases with brand-aligned colors:
  - 🌱 Seed Start (indoors) - Light Sage Green (#A8C6A8)
  - 🌿 Transplant - Brand Green (#4A7C59)
  - 💧 Direct Sow - Teal (#20B2AA)
  - 🍎 Harvest - Harvest Amber (#D4915C)
  - ⭐ Peak - Terracotta (#B87333)
- [x] Annuals show all applicable phases; Perennials show harvest only
- [ ] **Month view**: Click a month to zoom (simplified - not implemented)
- [ ] **Week view**: Click a week for detailed view (simplified - not implemented)

### 3. Crop Detail Panel ✅ COMPLETE
- [x] Clicking a crop bar or name opens a detail panel/modal
- [x] Detail panel shows:
  - Full crop information (all lifecycle dates, notes)
  - Planting tips/notes
  - Linked COGS ingredient (if any)
  - Recipes that use this crop's ingredient
  - Products linked to those recipes
- [x] Quick action: "View Recipes" link to recipes

### 4. Production Checklist ✅ COMPLETE
- [x] New "Seasonal Tasks" data model
- [x] Pre-seeded with key monthly tasks from production guide
- [x] Admin can add, edit, delete tasks
- [x] Each task has:
  - Title
  - Month (and optional week)
  - Completion status
  - Year tracking
  - Notes
- [x] Checklist UI grouped by month
- [x] Check/uncheck to mark complete (persists with timestamp)
- [x] **Year archiving**: Completed tasks archived by year
  - Can view past years' completion history
  - New year starts fresh

### 5. COGS → Product Integration ⏳ PENDING
- [ ] New "Publish to Store" button on COGS recipe cards
- [ ] Publish flow:
  1. Click "Publish to Store" on a recipe
  2. Modal opens with pre-filled fields:
     - Name (from recipe name) - editable
     - Price (from recipe retail price) - editable
     - Description - **manual entry required**
     - Image URL - **manual entry required**
     - Category - manual selection
     - Availability toggle
  3. On save: Creates Product linked to CogsRecipe
- [ ] Products list shows margin indicator for recipe-linked products
- [ ] **Price sync prompt**: When recipe retail price changes:
  - If product is linked, prompt: "Recipe price changed to $X. Update product price?"
  - Admin can accept, decline, or edit
- [ ] Recipe cards show "Published ✓" badge if linked to active product

### 6. Additional Features Implemented ✅ BONUS
- [x] **Print Feature**: Print-friendly CSS for calendar and task views
- [x] **Add Crop Modal**: Simplified with quick-add presets for common crops
- [x] **Month-based Pickers**: User-friendly date selection (vs raw week numbers)
- [x] **Consistent Phase Colors**: Brand-aligned palette for all crops
- [x] **Opacity/Layering**: Semi-transparent bars for clean overlapping phases

---

## Data Model Changes

### New: Crop Model
```prisma
model Crop {
  id              String   @id @default(uuid())
  name            String
  type            CropType @default(ANNUAL)
  
  // Planting Phase (for annuals/biennials)
  seedStartWeek   Int?     // Week to start indoors (null = direct sow or perennial)
  seedStartNotes  String?  // e.g., "8 weeks before last frost"
  plantOutWeekStart Int?   // First week to plant/transplant outdoors
  plantOutWeekEnd   Int?   // Last week to plant outdoors
  directSow       Boolean  @default(false)
  
  // Harvest Phase
  harvestStart    Int      // Week of year (1-52)
  harvestEnd      Int      // Week of year (1-52)
  peakStart       Int?     // Optional peak period start
  peakEnd         Int?     // Optional peak period end
  
  // Display
  color           String   @default("#4A7C59")
  notes           String?
  
  // Relations
  ingredientId    String?  
  ingredient      Ingredient? @relation(fields: [ingredientId], references: [id])
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@map("crops")
}

enum CropType {
  ANNUAL
  PERENNIAL
  BIENNIAL
}
```

### New: SeasonalTask Model
```prisma
model SeasonalTask {
  id          String    @id @default(uuid())
  title       String
  month       Int       // 1-12
  weekOfMonth Int?      // Optional: 1-4 for specific week
  isCompleted Boolean   @default(false)
  completedAt DateTime?
  year        Int       // Year this completion applies to
  notes       String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([year, month])
  @@map("seasonal_tasks")
}
```

### Updated: Product Model
```prisma
model Product {
  // ... existing fields ...
  
  cogsRecipeId String?   @unique
  cogsRecipe   CogsRecipe? @relation(fields: [cogsRecipeId], references: [id])
}
```

### Updated: CogsRecipe Model
```prisma
model CogsRecipe {
  // ... existing fields ...
  
  product Product?
}
```

### Updated: Ingredient Model
```prisma
model Ingredient {
  // ... existing fields ...
  
  crops Crop[]
}
```

---

## Pre-seeded Data

### Portland, OR Crops (Zone 8b)

| Crop | Type | Seed Start | Plant Out | Harvest | Peak | Color |
|------|------|------------|-----------|---------|------|-------|
| Apples | Perennial | — | — | Week 35-46 (Sep-Nov) | Week 40-44 (Oct) | #C41E3A |
| Tomatoes | Annual | Week 5 (Feb) | Week 20-24 (May-Jun) | Week 29-41 (Jul-Oct) | Week 33-37 (Aug-Sep) | #E74C3C |
| Cucumbers | Annual | Week 15 (Apr)* | Week 20-24 (May-Jun) | Week 25-39 (Jun-Sep) | Week 29-35 (Jul-Aug) | #27AE60 |
| Green Beans | Annual | — | Week 18-27 (May-Jul)* | Week 24-39 (Jun-Sep) | Week 27-31 (Jul) | #2ECC71 |
| Peppers | Annual | Week 5 (Feb) | Week 20-24 (May-Jun) | Week 29-41 (Jul-Oct) | Week 33-39 (Aug-Sep) | #F39C12 |
| Blueberries | Perennial | — | — | Week 24-33 (Jun-Aug) | Week 27-30 (Jul) | #3498DB |
| Raspberries | Perennial | — | — | Week 23-41 (Jun-Oct) | Week 24-30 (Jun-Jul) | #E91E63 |
| Plums | Perennial | — | — | Week 29-37 (Jul-Sep) | Week 32-35 (Aug) | #9B59B6 |
| Peas | Annual | — | Week 7-20 (Feb-May)* | Week 16-26 (Apr-Jun) | Week 18-22 (May) | #1ABC9C |
| Basil | Annual | Week 11 (Mar) | Week 20-24 (May-Jun) | Week 22-41 (Jun-Oct) | Week 29-35 (Jul-Aug) | #16A085 |
| Parsley | Biennial | Week 5 (Feb) | Week 11-29 (Mar-Jul) | Week 11-46 (Mar-Nov) | — | #27AE60 |
| Sorrel | Perennial | — | — | Week 9-48 (Mar-Nov) | Week 14-20 (Apr-May) | #2ECC71 |

*Direct sow

### Monthly Tasks (Examples)

**March**
- Order jars, lids, labels in bulk (400-500 units)
- Apply for summer farmers markets
- Test recipes, finalize product line

**April**
- Start tomato and pepper seeds indoors
- Direct sow peas if not done in Feb/Mar

**May**
- Transplant tomatoes, peppers, basil after May 15
- Direct sow beans and cucumbers
- Start attending farmers markets with fresh herbs

**June**
- Berry harvest begins - Blueberry jam production
- First pickle batches (cucumbers)
- Pesto production - freeze basil for winter

**July**
- PICKLE DAY: Dill pickles, pickled beans (50-75 jars)
- JAM DAY: Raspberry jam, mixed berry jam
- PESTO DAY: Freeze 30-40 portions for fall/winter
- Peak summer production - 25-35 hrs/week

**August**
- BIG TOMATO DAY: Sauce, marinara, salsa (100+ jars)
- Plum jam and plum butter production
- Continue pickle production

**September**
- Finish summer products
- Begin apple chip production (dehydrator)
- Transition to fall season

**October**
- PICKING PARTIES: Harvest 1,000 lbs apples
- APPLESAUCE DAYS: Process 200-300 lbs
- APPLE BUTTER DAY: Process 100 lbs
- Dehydrator running 24/7 for apple chips
- Peak apple season - 30-40 hrs/week

**November**
- Final applesauce and apple butter batches
- Start apple scrap vinegar
- Assemble gift boxes and holiday bundles
- Photograph products for online sales

**December**
- Holiday markets and fairs
- Corporate gift deliveries
- Light production mode

---

## UI Components

### Seasonal Planner Tab Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ 🌱 Seasonal Planner                                             │
│                                                                 │
│ [Calendar] [Checklist] [Crops]                    [Manage Crops]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ◀ 2025 ▶                              [Year] [Month] [Week]    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │    J   F   M   A   M   J   J   A   S   O   N   D        │   │
│  │                            ▼ NOW                         │   │
│  │ 🍎 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████████████  Apples │   │
│  │ 🍅 ██░░░░░░░░░░░░████░░░░░░████████████░░░░░░░  Tomatoes│   │
│  │ 🥒 ░░░░░░░░░░██░░████░░░░██████████████░░░░░░░  Cucumbers│  │
│  │ 🫐 ░░░░░░░░░░░░░░░░░░░░░░████████░░░░░░░░░░░░░  Blueberry│  │
│  │ ...                                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Legend: ██ Seed (indoor)  ██ Plant (outdoor)  ██ Harvest      │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  October 2025 Tasks                              [Add Task]     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ☑ First picking party (Week 1)                          │   │
│  │ ☑ Second picking party (Week 2)                         │   │
│  │ ☐ Process applesauce - 200-300 lbs                      │   │
│  │ ☐ Apple butter production day                           │   │
│  │ ☐ Run dehydrator for apple chips                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  📦 Recipes Ready for Current Harvest                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🍎 Applesauce (Quart)                                   │   │
│  │    Cost: $2.14 | Price: $16.00 | Margin: 87%            │   │
│  │    [Publish to Store]                     Published ✓   │   │
│  │                                                          │   │
│  │ 🍎 Apple Butter (8oz)                                   │   │
│  │    Cost: $2.12 | Price: $10.00 | Margin: 79%            │   │
│  │    [Publish to Store]                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Crop Detail Panel (on click)

```
┌─────────────────────────────────────────────────────────────────┐
│ 🍎 Apples                                              [Edit] X │
├─────────────────────────────────────────────────────────────────┤
│ Type: Perennial                                                 │
│                                                                 │
│ 📅 Growing Calendar                                             │
│ ┌─────────────────────────────────────────────────────────┐    │
│ │ Harvest: September 1 - November 15                      │    │
│ │ Peak:    October 1 - October 31                         │    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│ 📝 Notes                                                        │
│ Heritage varieties, late season storage apples                  │
│                                                                 │
│ 🧪 Linked Ingredient                                            │
│ Apples (Garden) - $0.00/lb                                      │
│                                                                 │
│ 📦 Recipes Using This Ingredient                                │
│ ├─ Applesauce (Quart) - 87% margin        [View] [Publish]     │
│ ├─ Apple Butter (8oz) - 79% margin        [View] [Publish]     │
│ └─ Apple Chips (4oz) - 87% margin         [View] [Publish]     │
│                                                                 │
│ 🛒 Published Products                                           │
│ └─ Classic Applesauce - $16.00            [View in Store]      │
└─────────────────────────────────────────────────────────────────┘
```

### Publish to Store Modal

```
┌─────────────────────────────────────────────────────────────────┐
│ Publish Recipe to Store                                       X │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Recipe: Applesauce (Quart)                                      │
│ Cost: $2.14 | Suggested Price: $16.00 | Margin: 87%             │
│                                                                 │
│ ─────────────────────────────────────────────────────────────── │
│                                                                 │
│ Product Name *                                                  │
│ ┌─────────────────────────────────────────────────────────┐    │
│ │ Classic Applesauce                                      │    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│ Price *                                                         │
│ ┌──────────┐                                                   │
│ │ $ 16.00  │                                                   │
│ └──────────┘                                                   │
│                                                                 │
│ Description *                                                   │
│ ┌─────────────────────────────────────────────────────────┐    │
│ │ Homemade applesauce from heritage orchard apples...     │    │
│ │                                                          │    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│ Image URL *                                                     │
│ ┌─────────────────────────────────────────────────────────┐    │
│ │ https://...                                              │    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│ Category                                                        │
│ ┌─────────────────────────────────────────────────────────┐    │
│ │ Applesauces                                          ▼  │    │
│ └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│ ☑ Available in store immediately                                │
│                                                                 │
│                              [Cancel]  [Publish to Store]       │
└─────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### Crops
- `GET /api/admin/crops` - List all crops
- `POST /api/admin/crops` - Create crop
- `GET /api/admin/crops/[id]` - Get crop with related recipes/products
- `PATCH /api/admin/crops/[id]` - Update crop
- `DELETE /api/admin/crops/[id]` - Delete crop

### Seasonal Tasks
- `GET /api/admin/tasks?year=2025` - List tasks for year
- `POST /api/admin/tasks` - Create task
- `PATCH /api/admin/tasks/[id]` - Update task (including completion)
- `DELETE /api/admin/tasks/[id]` - Delete task
- `POST /api/admin/tasks/archive` - Archive year and start fresh

### Product Publishing
- `POST /api/admin/products/from-recipe` - Create product from COGS recipe
- `PATCH /api/admin/products/[id]/sync-price` - Sync price from linked recipe

---

## Dev Notes

### Technical Considerations
- Calendar component: Build custom with Tailwind (avoid heavy libraries)
- Week numbers: Use ISO week calculation (1-52)
- Responsive: Desktop-first, but functional on tablet
- Performance: Calendar data is relatively small, can load all at once

### Migration Strategy
1. Create new tables (Crop, SeasonalTask)
2. Add optional fields to Product and CogsRecipe
3. Run seed script for Portland crops and sample tasks
4. Deploy schema, then deploy UI

### Testing Priorities
- Calendar rendering across year boundaries
- Week number accuracy for Portland dates
- Publish flow creates correct product
- Price sync prompt appears when recipe changes
- Task completion persists correctly
- Year archiving works

---

## Out of Scope (Future Stories)
- Volunteer event planning
- Inventory/quantity tracking
- Production scheduling with batch sizes
- Weather integration
- Mobile-optimized views
- Email/notification reminders
- Multi-location support (other climate zones)

---

## Definition of Done
- [x] Crops pre-seeded with Portland data (12 crops)
- [x] Tasks pre-seeded with sample monthly tasks
- [x] Calendar displays correctly (year view)
- [x] Responsive on desktop and tablet
- [x] No console errors
- [ ] Publish flow creates working products (pending)
- [ ] Price sync prompt functional (pending)
- [ ] All acceptance criteria met (Section 5 pending)
- [ ] Code reviewed

---

## Change Log
| Date | Change | Author |
|------|--------|--------|
| 2025-12-27 | Initial draft | PM |
| 2025-12-27 | MVP implementation: Crop calendar, tasks, detail panel, add/edit crops | Dev |
| 2025-12-27 | UX refinements: Consistent phase colors, urgency sorting, print feature | Dev |
| 2025-12-27 | Simplified Add Crop modal with quick-add presets | Dev |
| 2025-12-27 | Added distinct Transplant vs Direct Sow phases | Dev |


