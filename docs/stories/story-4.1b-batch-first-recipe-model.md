# Story 4.1b: Batch-First Recipe Model

## Overview
**Epic:** Cookbook & Recipe Management
**Status:** ✅ Complete
**Created:** December 28, 2025
**Completed:** December 28, 2025
**Depends On:** Story 4.1a (Natural Ingredient Entry)

## User Story
As Ilene (Mom), I want to enter recipes based on how I actually cook—in batches—so I can record "20 lbs of apples made 12 jars" and have the system figure out the per-jar costs.

## Problem Statement
The current recipe model is **per-jar focused**: you enter what goes into ONE jar. But Ilene works in **batches**: she makes a big pot of applesauce, then fills jars. She wants to:

1. Record the total ingredients for the whole batch
2. Specify how many jars it made (when she knows)
3. Have the system calculate per-jar costs automatically

Sometimes she doesn't know the jar count until after she's done canning. The yield field needs to be **optional** — she should be able to save the recipe and add the jar count later.

## Acceptance Criteria

### Batch Yield Field
- [x] Add "Yield" field to recipe form: "How many jars did this make?"
- [x] Field is **optional** — recipe can be saved without it
- [x] Placeholder text: `(optional)`
- [x] Accepts whole numbers only (no partial jars)
- [x] Minimum value: 1 (if provided)

### Batch-Based Ingredient Quantities
- [x] Ingredient quantities represent **total batch amounts** (not per-jar)
- [x] UI labels clarify this: "Ingredients (for the whole batch)"
- [x] No change to how user enters quantities — just mental model shift

### Per-Jar Cost Calculations
- [x] When yield IS provided:
  - Calculate per-jar ingredient cost: `batchIngredientsCost / yield`
  - Add container, label, energy costs (these are already per-jar)
  - Show per-jar breakdown in cost preview
  - Show profit per jar and margin
- [x] When yield is NOT provided:
  - Show batch ingredient cost total only
  - Show message: "Add yield to see per-jar costs"
  - Container/label/energy costs still shown (they're per-jar)
  - Disable margin calculation (can't calculate without yield)

### Recipe Card Display Updates
- [x] Show yield on recipe cards: "Makes 12 jars" or "Yield: not set"
- [x] Batch calculator in expanded view uses yield for scaling
- [x] If no yield, batch calculator shows: "Set yield to calculate batches"

### Edit Existing Recipes
- [x] Existing recipes (created before this change) continue to work
- [x] Existing recipes have `batchYield = null` (treated as per-jar mode for backward compatibility)
- [ ] When editing old recipe, show note: "This recipe is in per-jar mode..." (deferred to future story)
- [ ] Option to convert: "Switch to batch mode" (deferred to future story)

## Technical Implementation

### Schema Changes

**`prisma/schema.prisma`**

```prisma
model CogsRecipe {
  id            String                 @id @default(cuid())
  name          String
  description   String?
  containerType String                 @default("Quart Jar")
  containerCost Float                  @default(1.30)
  labelCost     Float                  @default(0.20)
  energyCost    Float                  @default(0.30)
  retailPrice   Float                  @default(10.00)
  notes         String?
  status        RecipeStatus           @default(IDEA)
  batchYield    Int?                   // Number of jars this batch makes (null = per-jar mode)
  ingredients   CogsRecipeIngredient[]
  product       Product?
  createdAt     DateTime               @default(now())
  updatedAt     DateTime               @updatedAt

  @@map("cogs_recipes")
}
```

### Files Modified

| File | Changes |
|------|---------|
| `prisma/schema.prisma` | Already had `batchYield` field |
| `prisma/migrations/manual_batch_yield.sql` | Migration already existed |
| `app/admin/components/cookbook.tsx` | Updated cost calculations, added yield field, updated displays |
| `app/admin/components/ingredient-text-input.tsx` | Updated label to "(for the whole batch)" |
| `app/api/admin/cogs/recipes/route.ts` | Already accepts `batchYield` in POST |
| `app/api/admin/cogs/recipes/[id]/route.ts` | Already accepts `batchYield` in PATCH |

## Definition of Done

- [x] `batchYield` field added to schema and migrated
- [x] Recipe form includes optional yield field
- [x] Cost calculations adapt to yield presence/absence
- [x] UI clearly shows batch vs per-jar context
- [x] Existing recipes continue to work (null yield = per-jar mode)
- [x] Recipe cards display yield or "not set"
- [x] Batch calculator respects yield
- [x] API accepts batchYield on create/update

## Change Log

| Date | Change |
|------|--------|
| 2025-12-28 | Implemented batch-first recipe model with optional yield field |

## Dev Agent Record

### Completion Notes
- Schema and API already had `batchYield` support from earlier work
- Updated `calculateRecipeCosts()` to return `RecipeCosts` interface with batch/per-jar support
- Added "Batch Yield" input field with "(optional)" placeholder and helper text
- Updated ingredients label to "Ingredients (for the whole batch)"
- Recipe cards now show "Makes X jars" or "Yield: not set" in amber
- Cost preview shows batch total always, per-jar breakdown only when yield is set
- Batch calculator shows warning when no yield is set
- All null checks added for type safety with nullable costs
