# Story 4.2: Kitchen-Shop Separation

## Status: Ready for Review

## Story
As an admin user, I want the Kitchen to be purely focused on food and recipes (no costs visible), and the Shop to handle all business concerns (sizing, pricing, inventory), so that recipe creation feels natural and productization is clearly separated.

## Acceptance Criteria
- [ ] Kitchen has only 2 tabs: "💡 Dreaming Up" and "✨ Almost There" (no "Ready to Sell")
- [ ] Kitchen shows NO cost information anywhere (remove "Show Costs" toggle and all cost displays)
- [ ] "Put on Shelf" from "Almost There" collects: category, description, photo, first size
- [ ] Size selection auto-populates container type (4oz → bag, 8/16/32oz → jar)
- [ ] Shop displays products with auto-calculated COGS and suggested retail price
- [ ] Shop shows small "View recipe →" link on each product
- [ ] Editing a published recipe's ingredients shows warning about Shop cost impact
- [ ] Shop prices auto-update when recipe costs change, with visual flag

## Dev Notes

### Yield Unit Conversion (for cost calculations)
```
oz: 1
cup: 8
pint: 16
quart: 32
gallon: 128
lb: 16
```

### Container Type Auto-Population
- 4oz → "bag"
- 8oz, 16oz, 32oz → "jar"

### Cost Calculation Formula
```
batchCostPerOz = batchIngredientCost / batchYieldInOz
ingredientCostForSize = batchCostPerOz × sizeOz
COGS = ingredientCostForSize + containerCost + labelCost
suggestedPrice = COGS / (1 - targetMargin)  // e.g., 0.4 for 40% margin
```

### Default Costs (can be overridden per size)
- Label cost: $0.15 (global default, editable per product/size)
- Container costs: Set per size in Shop
- Target margin for suggestions: 40%

### Files to Modify
- `app/admin/components/cookbook.tsx` - Remove Ready to Sell tab, remove cost displays
- `app/admin/components/catalog-manager.tsx` - Add cost calculations, recipe link, price suggestions
- `app/api/admin/cogs/recipes/[id]/route.ts` - Add warning logic for published recipe edits
- `prisma/schema.prisma` - May need fields for label cost, container cost per size

## Tasks

- [x] 1. Remove "Ready to Sell" tab from Kitchen
  - [x] 1.1. Remove `published` from `CookbookTab` type and tabs array in `cookbook.tsx`
  - [x] 1.2. Update `recipeCounts` to only track `ideas` and `ready`
  - [x] 1.3. Remove all UI code specific to `activeTab === 'published'` 
  - [x] 1.4. Update "Put on Shelf" to change status to PUBLISHED but recipe stays in Kitchen's "Almost There" view until shelf action completes

- [x] 2. Remove all cost displays from Kitchen
  - [x] 2.1. Remove "Show Costs" toggle button from Kitchen header
  - [x] 2.2. Remove `showCosts` state and all conditional cost rendering
  - [x] 2.3. Remove cost columns from ingredient lists
  - [x] 2.4. Remove profit/margin calculations display
  - [x] 2.5. Remove `calculateRecipeCosts` function usage in Kitchen UI (keep function for backend use)
  - [x] 2.6. Keep batch yield input (needed for cost calculations in Shop)

- [x] 3. Update "Put on Shelf" modal flow
  - [x] 3.1. Add first size selection dropdown (4oz, 8oz, 16oz, 32oz)
  - [x] 3.2. Auto-populate container type based on size (4oz → bag, others → jar)
  - [x] 3.3. Ensure modal collects: category, description, photo, first size
  - [x] 3.4. On submit, create ProductFlavor AND first ProductSize with calculated price
  - [x] 3.5. Move recipe status to PUBLISHED on successful shelf placement

- [x] 4. Add cost calculation engine to Shop
  - [x] 4.1. Add yield unit conversion utility (oz, cup, pint, quart, gallon, lb → oz)
  - [x] 4.2. Create function to calculate COGS per size from recipe batch cost
  - [x] 4.3. Add suggested price calculation (COGS / (1 - margin))
  - [x] 4.4. Display COGS breakdown on size rows (ingredient + container + label)
  - [x] 4.5. Show margin percentage when retail price differs from suggested

- [x] 5. Add label/container cost management to Shop
  - [x] 5.1. Add `labelCost` and `containerCost` fields to ProductSize model if not present
  - [x] 5.2. Default label cost to $0.15 for new sizes
  - [x] 5.3. Make label cost and container cost editable per size in Shop
  - [x] 5.4. Recalculate COGS when costs change

- [x] 6. Add "View recipe" link in Shop
  - [x] 6.1. Fetch recipe ID linked to each ProductFlavor
  - [x] 6.2. Add small, subtle "View recipe →" link on each product card
  - [x] 6.3. Link scrolls/navigates to Kitchen with that recipe expanded

- [x] 7. Add recipe edit warning system
  - [x] 7.1. When editing ingredients on a PUBLISHED recipe, check if it has linked products
  - [x] 7.2. Show confirmation modal: "This will update costs for [Product Name] (X sizes). Continue?"
  - [x] 7.3. On confirm, save recipe changes and trigger Shop cost recalculation
  - [x] 7.4. Add `costUpdatedAt` timestamp to ProductFlavor to track when costs changed
  - [x] 7.5. Show "💰 Costs updated" badge in Shop for products with recent cost changes
  - [x] 7.6. Badge clears when user views/edits the product

## Testing Requirements
- Verify Kitchen only shows 2 tabs
- Verify no cost information visible anywhere in Kitchen
- Verify "Put on Shelf" creates product with first size and correct container type
- Verify Shop calculates COGS correctly from recipe batch cost
- Verify suggested price uses 40% margin formula
- Verify editing published recipe shows warning
- Verify Shop costs auto-update after recipe edit
- Verify "View recipe" link works

## Dev Agent Record

### Agent Model Used
Claude Opus 4.5 (via Cursor)

### Completion Notes
- Kitchen now has only 2 tabs: "💡 Dreaming Up" and "✨ Almost There"
- All cost displays removed from Kitchen - focused purely on food/recipes
- "Put on Shelf" modal now collects first size (4/8/16/32oz) with auto-container type
- Shop displays COGS breakdown, margin %, and suggested price per size
- "View recipe" link added to Shop for navigating to Kitchen
- Recipe edit warning modal shows when editing published recipes
- "💰 Costs updated" badge appears in Shop for 7 days after recipe changes
- Cost calculation uses yield unit conversion (oz/cup/pint/quart/gallon/lb)
- Default costs: $0.15 label, $0.30-$1.30 container based on size

### Change Log
1. Removed "Ready to Sell" tab and all published recipe UI from Kitchen
2. Removed cost displays, profit calculator, and showCosts toggle from Kitchen
3. Updated PublishToStoreModal to collect first size with auto container type
4. Added cost calculation engine to catalog API
5. Added COGS/margin columns to Shop size table
6. Added "View recipe" link with cross-tab navigation
7. Added warning modal for editing published recipes
8. Added costUpdatedAt tracking and "Costs updated" badge

### File List
**Modified:**
- `app/admin/components/cookbook.tsx` - Removed published tab, cost displays, added recipe edit warning
- `app/admin/components/catalog-manager.tsx` - Added COGS display, margin, "View recipe" link, cost updated badge
- `app/admin/page.tsx` - Added recipe navigation event handling
- `app/api/catalog/route.ts` - Added cost calculation engine with recipe data
- `app/api/admin/products/from-recipe/route.ts` - Updated to accept firstSizeOz, calculate price from COGS
- `app/api/admin/cogs/recipes/[id]/route.ts` - Added costUpdatedAt update on ingredient changes
- `prisma/schema.prisma` - Added labelCost, containerCost to ProductSize; costUpdatedAt to ProductFlavor

**Created:**
- `prisma/migrations/manual_shop_cost_fields.sql` - Migration for new cost fields

### Debug Log
- Prisma client needed regeneration after schema changes (`npx prisma generate`)

