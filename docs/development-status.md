# Development Status

## Completed

### Foundation (Dec 2025)
- [x] Project initialization (Next.js 14+, TypeScript, Tailwind)
- [x] Prisma setup and schema definition
- [x] Admin Authentication (NextAuth.js Google OAuth)
- [x] Admin Product Management (UI + API)
- [x] API Routes for Products, Auth, and Checkout
- [x] Database: Fixed naming to snake_case

### Kindness Refocus (Dec 2025)
- [x] Renamed "Cart" to "Basket" everywhere 🧺
- [x] Refactored into HomemadeCard with "Kitchen Journal" styling 🍎
- [x] Implemented Seeds of Kindness voting system ($10 = 1 seed) 🌱
- [x] Implemented Sow Extra Seeds (voluntary gifts) in checkout 🤝
- [x] Updated all brand copy to reflect Heritage Trees and PNW Backyard 🌲

### Operational & Admin Enhancements (Dec 19, 2025)
- [x] Admin Order Detail View: Full modal for order fulfillment 📦
- [x] Fulfillment API: Real API routes for fetching and updating orders
- [x] Search & Filters: Product search and category filtering 🔍
- [x] Security Audit: Hardened checkout validation 🔐
- [x] Database Seeding: Reliable `npm run db:seed` script 🌱
- [x] Transactional Emails: Resend integration and Stripe Webhooks 📧

### Admin Fulfillment Printing (Dec 27, 2025)
- [x] Printable packing slip page from Admin order modal
- [x] Printable address label (no postage) page
- [x] Fixed orders list interaction

### Admin UX Improvements (Dec 27, 2025)
- [x] Products Tab: ON/OFF toggles, labeled buttons, dimmed unavailable products
- [x] Edit Modal: Image preview, warm styling, field hints
- [x] Delete Modal: Shows product, friendly buttons, toggle tip
- [x] Orders Tab: Pending badge, filter buttons, "Today's Tasks" box
- [x] Admin Layout: Hidden public navbar/footer
- [x] Dev Testing: `/admin/dev` page for localhost testing

### Cookbook Feature (Dec 27-28, 2025) 📖
**Replaced "Recipe Costing" with full Cookbook workflow:**

- [x] **3-Tab Workflow**:
  - 💡 **Ideas**: Recipe experiments with cost calculator
  - ✨ **Ready**: Recipes ready for final review
  - 🏪 **Selling**: Live products on the store shelf

- [x] **Ingredient Library**:
  - 45+ ingredients across 3 categories (Produce, Pantry, Packaging)
  - Clean list view (just names, click to edit)
  - Purchase tracking: size, unit, cost (e.g., "4 lb bag @ $4")
  - Unit conversion system for auto-calculating recipe costs
  - Garden/produce ingredients have $0 cost

- [x] **Recipe → Product Flow**:
  - "Ready to Share" button moves recipe from Ideas to Ready
  - "Put on Shelf" button creates product and sets status to PUBLISHED
  - Price sync: Recipe price changes auto-update linked product
  - "Remove from Shelf" moves back to Ready status

- [x] **On the Shelf Management**:
  - In-stock toggle for each product
  - Edit product details (name, description, image, category)
  - Batch Calculator for planning batches
  - View Store link

- [x] **UX Polish** (Dec 28):
  - Emoji tabs (💡 Ideas, ✨ Ready, 🏪 Selling)
  - "+ New Idea" button always visible
  - "💰 Profit" label instead of "You Earn"

### Garden Planner Feature (Dec 27-28, 2025) 🌱
**Renamed from "Seasonal Planner" with new features:**

- [x] **Growing Calendar Tab**:
  - Visual year timeline with crop phases
  - Color-coded: Start Indoors, Transplant, Direct Sow, Harvest, Peak
  - 13 Portland OR crops (Zone 8b)
  - Add/edit crops with month pickers
  - Monthly task checklists with archiving

- [x] **Potential Harvest Tab** (NEW):
  - "What Could the Garden Give Us?" calculator
  - Editable plant counts and yield per unit (0.25 increments)
  - Card-based layout with result prominently displayed
  - Total expected harvest summary (~690 lbs)
  - Crops linked to ingredients for "What You Could Make" section

- [x] **UX Improvements**:
  - Renamed "Garden" category to "Produce"
  - Cleaner card layout for yield entries
  - Dynamic labels (Plants/Bushes/Trees)

### Category Management (Dec 27, 2025) 📂
- [x] Product Categories: Applesauces, Jams, Spreads, Dried Goods, Pickled Goods
- [x] Manage Categories Modal with product counts
- [x] Inline Editing: Click description or price to edit
- [x] Clean Product Table: Icon-only actions

### Code Cleanup (Dec 28, 2025) 🧹
- [x] Removed orphaned `cogs-calculator.tsx` (replaced by `cookbook.tsx`)
- [x] Removed orphaned `seasonal-planner.tsx` (replaced by `garden-planner.tsx`)
- [x] Updated source-tree.md documentation
- [x] Products tab removed from admin nav (merged into Cookbook)

### Security Hardening (Dec 30, 2025) 🔐
- [x] **API Authentication**: Fixed `/api/products` POST endpoint (now requires auth)
- [x] **Security Headers**: Added X-XSS-Protection, Permissions-Policy, HSTS, etc.
- [x] **npm Vulnerabilities**: Fixed all (0 vulnerabilities)
- [x] **Supabase RLS**: Enabled Row Level Security on all 10 tables
- [x] **RLS Policies**: Public read for products, service-role-only for admin tables
- [x] **Function Security**: Fixed search_path warning

### Documentation Cleanup (Dec 30, 2025) 📚
- [x] Reorganized root .md files into `docs/setup/` and `docs/archive/`
- [x] Removed unused `tools/` directory
- [x] Updated security-audit.md with completed fixes
- [x] Updated source-tree.md with current structure

## Pending / Recommended
- [ ] **Stripe Live Mode**: Awaiting live API keys for production testing
- [ ] **Privacy Policy**: Create `/privacy` page (legal recommendation)
- [ ] **Rate Limiting**: Consider for auth endpoints (security recommendation)

## Next Steps
1. **"What Can I Make" Feature**: Show recipes you can make from expected harvest
2. **End-to-End Visual Polish**: Final pass on typography and spacing
3. **Product Content Pass**: Refine heritage descriptions for current harvest

## Known Issues
- None currently blocking
