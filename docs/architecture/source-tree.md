# Source Tree

High-level map of the repository to help contributors find things quickly.

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
- `app/shop/page.tsx`: Product list (falls back to static data if DB is offline)
- `app/basket/page.tsx`: Basket
- `app/checkout/page.tsx`: 3-step checkout (Details → Plant Your Seeds → Payment)
- `app/thank-you/page.tsx`: Post-checkout confirmation page
- `app/about/page.tsx`: About page
- `app/impact/page.tsx`: Impact/causes page

### Admin Pages (`app/admin/`)
- `app/admin/page.tsx`: Main admin dashboard (Orders, Cookbook, Garden Planner tabs)
- `app/admin/dev/page.tsx`: Dev-mode admin (localhost only, no auth)
- `app/admin/login/page.tsx`: Google OAuth login
- `app/admin/orders/[id]/`: Order detail views (packing slip, address label)
- `app/admin/components/`:
  - `cookbook.tsx`: Cookbook UI with 3-tab workflow:
    - 💡 **Ideas**: Recipe experiments (create, edit, cost)
    - ✨ **Ready**: Recipes ready for final review before publishing
    - 🏪 **Selling**: Live products with in-stock toggles, editing, batch calculator
  - `garden-planner.tsx`: Garden Planner with:
    - **Growing Calendar**: Visual crop timeline with phases
    - **Potential Harvest**: Yield calculator ("What Could the Garden Give Us?")
  - `layout-sandbox.tsx`: Interactive garden layout canvas (Konva.js)
    - Drag-and-drop raised beds with rotation
    - Crop placement with spacing circles
    - Save/load multiple named layouts
  - `product-list.tsx`: Product management with inline editing & category management
  - `product-form-modal.tsx`: Product add/edit form with category manager
  - `order-detail-modal.tsx`: Order fulfillment modal
  - `delete-confirm-modal.tsx`: Delete confirmation dialog
  - `ingredient-text-input.tsx`: Two-field ingredient input with autocomplete

### API routes (`app/api/`)

#### Public APIs
- `app/api/products/route.ts`: GET all available products
- `app/api/products/[id]/route.ts`: GET/PUT single product
- `app/api/checkout/route.ts`: POST creates order + Stripe PaymentIntent
- `app/api/webhooks/stripe/route.ts`: Stripe webhook for order updates + email

#### Admin APIs
- `app/api/admin/orders/route.ts`: GET/POST orders
- `app/api/admin/orders/[id]/route.ts`: GET/PATCH/DELETE single order
- `app/api/admin/products/[id]/route.ts`: GET/PUT/DELETE single product
- `app/api/admin/products/from-recipe/route.ts`: POST create product from recipe (sets status to PUBLISHED)

#### Cookbook APIs (formerly COGS)
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
- `lib/types.ts`: Shared TS types (Product, Order, Ingredient, CogsRecipe, Crop, SeasonalTask, GardenLayout)
- `lib/causes.ts`: Seeds of Kindness cause definitions
- `lib/format.ts`: Formatting utilities (price, date)
- `lib/shipping.ts`: Shipping cost calculations
- `lib/static-data.ts`: Fallback product data for offline mode
- `lib/product-details.ts`: Static registry for product variants (sizes, ingredients, allergens)
- `lib/unit-conversions.ts`: Unit conversion system for ingredient costing:
  - Converts between purchase units (lb, oz, gallon) and recipe units (cup, tbsp, tsp)
  - Ingredient-specific density factors (sugar, flour, etc.)
  - Auto-calculates cost per recipe unit from purchase info
- `lib/ingredient-parser.ts`: Natural language ingredient parsing (amount/unit extraction)
- `lib/server/db.ts`: Prisma singleton client
- `lib/server/auth.ts`: Admin auth/session utilities (NextAuth + `getAuthSession()` helper)
- `lib/server/mail.ts`: Resend email templates/sender

## Database (`prisma/`)
- `prisma/schema.prisma`: Database schema including:
  - **Core**: User, Product, Order, OrderItem
  - **Cookbook**: Ingredient (with purchase tracking + source enum), CogsRecipe (with status enum), CogsRecipeIngredient
  - **Garden Planner**: Crop (with yield tracking), SeasonalTask, GardenLayout
- `prisma/seed.ts`: Main seed script
- `prisma/seed-cogs.ts`: Cookbook seed data (45 ingredients, 16 recipes)
- `prisma/seed-seasonal-planner.ts`: Garden planner seed data (13 crops, monthly tasks)
- `prisma/seed-purchase-data.ts`: Purchase tracking data for pantry ingredients
- `prisma/link-crops-to-ingredients.ts`: Links crops to matching ingredients
- `prisma/migrate-products-to-cookbook.ts`: Migration script for existing products
- `prisma/migrations/`: Database migrations
  - `manual_enable_rls.sql`: Row Level Security policies for Supabase
  - `manual_garden_layout_sandbox.sql`: Garden layout canvas feature
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
- `PUBLISHED`: Live in store

### IngredientSource
- `GARDEN`: Homegrown produce (cost = $0)
- `PANTRY`: Store-bought pantry items
- `PACKAGING`: Jars, lids, labels, etc.

### CropType
- `ANNUAL`: Replanted yearly
- `PERENNIAL`: Returns each year
- `BIENNIAL`: Two-year lifecycle
