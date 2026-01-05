# Architecture Review: Database Schema Analysis

**Date:** January 4, 2026  
**Reviewer:** Winston (Architect)  
**Status:** ✅ Clean - Minor cleanup recommended

---

## Executive Summary

The database schema is **well-structured** with a clear hierarchical product model. The codebase successfully implements a four-level product hierarchy (Category → Flavor → Size → Batch) that aligns with artisan food product requirements. Some legacy models remain for backwards compatibility and should be deprecated once migration is complete.

---

## Schema Analysis

### ✅ Strengths

#### 1. Clear Product Hierarchy
```
ProductCategory → ProductFlavor → ProductSize → ProductBatch
```
- **ProductCategory**: Clean grouping (Jams, Pickles, etc.)
- **ProductFlavor**: Primary product entity with Kitchen integration
- **ProductSize**: Inventory tracked at correct granularity
- **ProductBatch**: Production tracking for traceability

#### 2. Proper Indexing
All frequently-queried fields have appropriate indexes:
- `ProductFlavor`: `categoryId`, `isAvailable`
- `ProductSize`: `flavorId`, `quantity`, `sizeOz`
- `ProductBatch`: `batchDate`, `flavorId`
- `Order`: Implicit on primary key
- `Ingredient`: `name`, `category`, `source`

#### 3. Cascade Deletes
Properly configured to maintain referential integrity:
- Deleting a Category cascades to Flavors → Sizes → Batches
- Deleting a Flavor cascades to Sizes and Batches
- OrderItems preserve history (SET NULL on flavor deletion)

#### 4. Kitchen Integration
`ProductFlavor.cogsRecipeId` properly links products to cost recipes with unique constraint, ensuring 1:1 relationship.

### ⚠️ Areas for Attention

#### 1. Legacy Models (Low Priority)

**Current State:**
```prisma
// LEGACY: Keeping for migration
model Product { ... }
model ProductVariant { ... }
```

**Recommendation:** These can be removed after confirming:
- [ ] No OrderItems reference legacy `productId` in production
- [ ] All static fallback data uses new hierarchy
- [ ] Shop page fully migrated to ProductFlavor

**Migration Path:**
1. Run query to check for legacy references in OrderItems
2. Update `lib/static-data.ts` if still using legacy format
3. Remove `Product` and `ProductVariant` models
4. Remove legacy relations from `OrderItem` and `CogsRecipe`

#### 2. OrderItem Dual References (Expected - Transitional)

**Current State:**
```prisma
model OrderItem {
  // New hierarchy
  flavorId    String?
  sizeKey     String?
  // Legacy
  productId   String?
  variantKey  String?
}
```

**Status:** This is intentional for backwards compatibility. Historic orders maintain their original references.

**Recommendation:** Keep as-is. Do NOT remove legacy fields - they preserve order history.

#### 3. Missing Direct FK to ProductSize in OrderItem

**Current State:** OrderItem uses `sizeKey` (string) instead of `sizeId` (FK).

**Analysis:** This is acceptable because:
- Order snapshots should be immutable
- String key allows historical orders to remain valid even if sizes are deleted
- Prevents cascade issues with fulfilled orders

**Recommendation:** Keep current design. If FK is desired, add optional `sizeId` alongside `sizeKey`.

---

## Code Cleanup Recommendations

### High Priority

1. **Remove unused `product-list.tsx`** (replaced by `catalog-manager.tsx`)
   - File: `app/admin/components/product-list.tsx`
   - Status: Can be deleted after confirming no imports

2. **Update `lib/product-details.ts`**
   - Currently contains hardcoded product size data
   - Should be deprecated or removed once all products use database

### Medium Priority

3. **Consolidate Legacy Product API Routes**
   - `app/api/products/` routes may be redundant with `/api/catalog/`
   - Keep for backwards compatibility with any external integrations
   - Document as legacy in route files

4. **Clean up types.ts**
   - Move legacy types to a `legacy-types.ts` file
   - Keep main file focused on current hierarchy

### Low Priority

5. **Database Cleanup Migration**
   - Create migration to remove `Product` and `ProductVariant` tables
   - Only execute after full production validation

---

## Entity Relationship Summary

```
┌─────────────────┐
│ ProductCategory │
│ (Jams, Pickles) │
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────┐       ┌──────────────┐
│  ProductFlavor  │──────▶│  CogsRecipe  │
│  (Raspberry,    │ 1:1   │  (Kitchen)   │
│   Classic)      │       └──────────────┘
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────┐
│   ProductSize   │◀──────── Inventory tracked here
│ (8oz, 16oz jar) │
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────┐
│  ProductBatch   │ ◀──── Production tracking
│ (Jan 4, 2026)   │
└─────────────────┘

┌─────────────────┐       ┌──────────────┐
│     Order       │──────▶│  OrderItem   │
│                 │ 1:N   │ (flavorId,   │
│                 │       │  sizeKey)    │
└─────────────────┘       └──────────────┘
```

---

## Verification Checklist

### Schema Integrity ✅
- [x] All foreign keys properly defined
- [x] Unique constraints prevent duplicates
- [x] Indexes on query-heavy fields
- [x] Cascade deletes maintain consistency
- [x] Enum types for constrained values

### API Alignment ✅
- [x] Catalog API matches schema hierarchy
- [x] Kitchen API links recipes to flavors
- [x] Inventory API operates at size level
- [x] Order API supports both legacy and new references

### Type Safety ✅
- [x] `lib/types.ts` mirrors Prisma schema
- [x] Legacy types clearly marked
- [x] Computed properties documented

---

## Conclusion

The schema is **production-ready** with a clean, well-thought-out hierarchy. The presence of legacy models is appropriate for a system in transition. 

**Recommended Actions (in order):**
1. ✅ Documentation updated (this review)
2. 🔄 Delete unused `product-list.tsx` component
3. 🔄 Add deprecation comments to legacy API routes
4. ⏳ Plan legacy model removal for future sprint

No urgent changes required. The architecture supports the business requirements effectively.
