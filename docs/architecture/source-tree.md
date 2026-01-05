# Source Tree

High-level map of the repository to help contributors find things quickly.

**Last Updated:** January 4, 2026

## Top-level
- `app/`: Next.js App Router routes (pages + API routes)
- `lib/`: Shared utilities and server helpers (Prisma client, auth helpers, mail, unit conversions)
- `prisma/`: Prisma schema + migrations + seed scripts
- `docs/`: Documentation (organized into subdirectories)
- `public/`: Static assets

## Documentation (`docs/`)
- `docs/architecture/`: Technical architecture docs (source-tree, tech-stack, coding-standards)
- `docs/stories/`: User stories for features
- `docs/setup/`: Setup guides (Google OAuth, Vercel, database)
- `docs/archive/`: Historical summaries and completed milestone docs
- `docs/prd.md`: Product requirements
- `docs/brief.md`: Project brief
- `docs/security-audit.md`: Security audit report (✅ all issues resolved)
- `docs/development-status.md`: Current development status

## App Router (`app/`)
- `app/page.tsx`: Home
- `app/shop/page.tsx`: Product catalog (uses ProductFlavor hierarchy)
- `app/product/[id]/page.tsx`: Product detail page (flavor with size selection)
- `app/basket/page.tsx`: Basket
- `app/checkout/page.tsx`: 3-step checkout (Details → Plant Your Seeds → Payment)
- `app/thank-you/page.tsx`: Post-checkout confirmation page
- `app/about/page.tsx`: About page
- `app/impact/page.tsx`: Impact/causes page
- `app/privacy/page.tsx`: Privacy policy

### Admin Pages (`app/admin/`)
- `app/admin/page.tsx`: Main admin dashboard (Orders, Shop, Kitchen, Garden Planner, Organizations tabs)
- `app/admin/dev/page.tsx`: Dev-mode admin (localhost only, no auth)
- `app/admin/login/page.tsx`: Google OAuth login
- `app/admin/orders/[id]/`: Order detail views (packing slip, address label)
- `app/admin/components/`:
  - `catalog-manager.tsx`: **Product Catalog UI** - Hierarchical view of categories/flavors/sizes with:
    - Collapsible category sections
    - Inline flavor name/description editing
    - Size management with inventory tracking
    - Visibility toggles per flavor
  - `cookbook.tsx`: **Kitchen UI** with 3-tab workflow:
    - 💡 **Dreaming Up**: Recipe experiments (create, edit, cost)
    - ✨ **Almost There**: Recipes ready for final review
    - 🏪 **Ready to Sell**: Published recipes with store sync
    - Publish modal with category selection/creation
  - `garden-planner.tsx`: Garden Planner with:
    - **Growing Calendar**: Visual crop timeline with phases
    - **Potential Harvest**: Yield calculator ("What Could the Garden Give Us?")
  - `layout-sandbox.tsx`: Interactive garden layout canvas (Konva.js)
    - Drag-and-drop raised beds with rotation
    - Crop placement with spacing circles
    - Save/load multiple named layouts
  - `organization-manager.tsx`: Seeds of Kindness beneficiary management
  - `order-detail-modal.tsx`: Order fulfillment modal
  - `delete-confirm-modal.tsx`: Delete confirmation dialog
  - `ingredient-text-input.tsx`: Two-field ingredient input with autocomplete
  - `product-list.tsx`: *Legacy* - replaced by catalog-manager.tsx
  - `product-form-modal.tsx`: *Legacy* - product add/edit form

### API routes (`app/api/`)

#### Public APIs
- `app/api/products/route.ts`: GET all available products (legacy)
- `app/api/products/[id]/route.ts`: GET single product (legacy)
- `app/api/catalog/route.ts`: GET full catalog hierarchy (categories + flavors + sizes)
- `app/api/checkout/route.ts`: POST creates order + Stripe PaymentIntent
- `app/api/webhooks/stripe/route.ts`: Stripe webhook for order updates + email
- `app/api/organizations/route.ts`: GET active organizations for checkout
- `app/api/organizations/nominate/route.ts`: POST nomination submissions

#### Catalog APIs (Product Hierarchy)
- `app/api/catalog/route.ts`: GET full catalog with aggregates
- `app/api/catalog/categories/route.ts`: GET/POST categories
- `app/api/catalog/flavors/route.ts`: GET/POST flavors
- `app/api/catalog/flavors/[id]/route.ts`: GET/PUT/DELETE single flavor
- `app/api/catalog/flavors/[id]/sizes/route.ts`: GET/POST sizes for a flavor
- `app/api/catalog/sizes/[id]/route.ts`: GET/PUT/DELETE single size
- `app/api/catalog/sizes/[id]/inventory/route.ts`: PATCH adjust inventory (+/-)
- `app/api/catalog/batches/route.ts`: GET/POST production batches

#### Admin APIs
- `app/api/admin/orders/route.ts`: GET/POST orders
- `app/api/admin/orders/[id]/route.ts`: GET/PATCH/DELETE single order
- `app/api/admin/products/from-recipe/route.ts`: POST create product from recipe (publishes to store)
- `app/api/admin/organizations/route.ts`: GET/POST organizations
- `app/api/admin/organizations/[id]/route.ts`: GET/PATCH/DELETE single organization
- `app/api/admin/nominations/route.ts`: GET nominations
- `app/api/admin/nominations/[id]/route.ts`: PATCH approve/reject nomination

#### Kitchen APIs (Recipe Costing)
- `app/api/admin/cogs/ingredients/route.ts`: GET/POST ingredients (with purchase tracking)
- `app/api/admin/cogs/ingredients/[id]/route.ts`: GET/PATCH/DELETE single ingredient
- `app/api/admin/cogs/recipes/route.ts`: GET/POST recipes (with status filter: IDEA/READY/PUBLISHED)
- `app/api/admin/cogs/recipes/[id]/route.ts`: GET/PATCH/DELETE single recipe (auto-syncs price to product)

#### Garden Planner APIs
- `app/api/admin/crops/route.ts`: GET/POST crops (includes yield tracking + ingredient links)
- `app/api/admin/crops/[id]/route.ts`: GET/PATCH/DELETE single crop
- `app/api/admin/tasks/route.ts`: GET/POST seasonal tasks (with year filter)
- `app/api/admin/tasks/[id]/route.ts`: GET/PATCH/DELETE single task
- `app/api/admin/tasks/archive/route.ts`: POST archive tasks by year
- `app/api/admin/layouts/route.ts`: GET/POST garden layouts (canvas JSON)
- `app/api/admin/layouts/[id]/route.ts`: GET/PATCH/DELETE single layout

## Shared code (`lib/`)
- `lib/types.ts`: Shared TS types organized by domain:
  - **Product Hierarchy**: ProductCategory, ProductFlavor, ProductSize, ProductBatch
  - **Legacy Products**: Product, ProductVariant (for backwards compatibility)
  - **Orders**: Order, OrderItem, Cart types
  - **Kitchen**: Ingredient, CogsRecipe, RecipeCostBreakdown
  - **Garden**: Crop, SeasonalTask, GardenLayout, GardenBed, PlacedPlant
- `lib/causes.ts`: Seeds of Kindness cause definitions
- `lib/format.ts`: Formatting utilities (price, date)
- `lib/shipping.ts`: Shipping cost calculations
- `lib/static-data.ts`: Fallback product data for offline mode
- `lib/product-details.ts`: *Legacy* - Static registry for product variants
- `lib/unit-conversions.ts`: Unit conversion system for ingredient costing:
  - Converts between purchase units (lb, oz, gallon) and recipe units (cup, tbsp, tsp)
  - Ingredient-specific density factors (sugar, flour, etc.)
  - Auto-calculates cost per recipe unit from purchase info
- `lib/ingredient-parser.ts`: Natural language ingredient parsing (amount/unit extraction)
- `lib/server/db.ts`: Prisma singleton client
- `lib/server/auth.ts`: Admin auth/session utilities (NextAuth + `getAuthSession()` helper)
- `lib/server/mail.ts`: Resend email templates/sender
- `lib/server/organizations.ts`: Organization data access helpers

## Database (`prisma/`)
- `prisma/schema.prisma`: Database schema including:
  - **Product Hierarchy**: ProductCategory, ProductFlavor, ProductSize, ProductBatch
  - **Legacy Products**: Product, ProductVariant (marked for deprecation)
  - **Orders**: Order, OrderItem (supports both hierarchy and legacy references)
  - **Kitchen**: Ingredient, CogsRecipe, CogsRecipeIngredient
  - **Garden Planner**: Crop, SeasonalTask, GardenLayout
  - **Organizations**: Organization, Nomination
  - **Auth**: User
- `prisma/seed.ts`: Main seed script
- `prisma/seed-cogs.ts`: Kitchen seed data (50 ingredients, recipes)
- `prisma/seed-organizations.ts`: Organization seed data
- `prisma/seed-seasonal-planner.ts`: Garden planner seed data (crops, monthly tasks)
- `prisma/seed-purchase-data.ts`: Purchase tracking data for pantry ingredients
- `prisma/seed-product-variants.ts`: Product variant seed data
- `prisma/link-crops-to-ingredients.ts`: Links crops to matching ingredients
- `prisma/migrate-products-to-cookbook.ts`: Migration script for existing products
- `prisma/migrate-to-hierarchy.ts`: Migration script for product hierarchy
- `prisma/migrations/`: Database migrations
  - `manual_product_hierarchy.sql`: Product hierarchy tables
  - `manual_enable_rls.sql`: Row Level Security policies for Supabase
  - Other manual migrations for incremental features

## Security
- **Row Level Security (RLS)**: Enabled on all Supabase tables
- **Security Headers**: Configured in `next.config.ts` (HSTS, X-Frame-Options, etc.)
- **Authentication**: NextAuth.js with Google OAuth, email whitelist for admin
- **API Protection**: All admin routes require authenticated session

## Key Enums

### RecipeStatus
- `IDEA`: Work in progress, experimenting
- `READY`: Ready to share, awaiting final review  
- `PUBLISHED`: Live in store (linked to ProductFlavor)

### IngredientSource
- `GARDEN`: Homegrown produce (cost = $0)
- `PANTRY`: Store-bought pantry items
- `PACKAGING`: Jars, lids, labels, etc.

### CropType
- `ANNUAL`: Replanted yearly
- `PERENNIAL`: Returns each year
- `BIENNIAL`: Two-year lifecycle

### OrganizationCategory
- `FOOD`: Food security organizations
- `GARDEN`: Community garden/agriculture
- `YOUTH`: Youth programs
- `COMMUNITY`: General community support

### OrganizationStatus
- `ACTIVE`: Currently available for customer selection
- `IN_POOL`: Approved but not currently active
- `PAST_PARTNER`: Previously active (can be reactivated)
