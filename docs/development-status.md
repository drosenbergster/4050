# Development Status

## Completed
- [x] Project initialization (Next.js 14+, TypeScript, Tailwind).
- [x] Prisma setup and schema definition (User, Product, Order).
- [x] **Kindness Refocus (Dec 2025)**:
  - Renamed "Cart" to "Basket" everywhere. 🧺
  - Refactored into a single **HomemadeCard** with "Kitchen Journal" styling. 🍎
  - Implemented **Seeds of Kindness** voting system ($10 = 1 seed). 🌱
  - Implemented **Sow Extra Seeds** (voluntary gifts) in checkout. 🤝
  - Updated all brand copy to reflect **Heritage Trees** and **PNW Backyard**. 🌲
  - Updated **Admin Dashboard** with Seed Growth Tracker. 📈
- [x] Admin Authentication (NextAuth.js Google OAuth).
- [x] Admin Product Management (UI + API).
- [x] API Routes for Products, Auth, and Checkout.
- [x] Database: Fixed naming to snake_case and added missing columns for Seeds system.
- [x] **Operational & Admin Enhancements (Dec 19, 2025)**:
  - **Admin Order Detail View**: Implemented full modal view for order fulfillment. 📦
  - **Fulfillment API**: Created real API routes for fetching and updating orders.
  - **Search & Filters**: Added product search and category filtering to Shop Page. 🔍
  - **Security Audit**: Hardened checkout validation and server-side recalculations. 🔐
  - **Database Seeding**: Fixed `npm run db:seed` script; now fully reliable. 🌱
  - **Technical Debt**: Removed deprecated components and fixed hydration/LCP errors.
  - **Transactional Emails**: Implemented Resend integration and Stripe Webhooks. 📧
- [x] **Admin Fulfillment Printing (Dec 27, 2025)**:
  - Added printable **packing slip** page from the Admin order modal.
  - Added printable **address label (no postage)** page for shipping orders.
  - Defaulted Admin landing to **Products** tab (catalog-first).
  - Fixed orders list: clicking the fulfillment pill no longer opens the detail modal.
- [x] **Admin UX Improvements (Dec 27, 2025)**:
  - **Products Tab**: Added ON/OFF toggles for availability, labeled Edit/Delete buttons, dimmed unavailable products.
  - **Edit Modal**: Added image preview, warm "Kitchen Journal" styling, helpful field hints.
  - **Delete Modal**: Shows product being deleted, friendly "Keep It" / "Yes, Remove It" buttons, tip about using toggle instead.
  - **Orders Tab**: Added pending count badge, "Pending Only" / "All Orders" filter buttons, "Today's Tasks" summary box.
  - **Admin Layout**: Hidden public navbar/footer in admin for focused experience.
  - **Dev Testing**: Added `/admin/dev` page for localhost-only testing without OAuth.
- [x] **Recipe Costing Feature (Dec 27, 2025)**:
  - **New Admin Tab**: "Recipe Costing" for planning product costs and margins. 📊
  - **Ingredient Library**: 45+ ingredients across 3 categories:
    - **Garden** 🌱 - Homegrown produce (apples, tomatoes, herbs, squash, etc.)
    - **Pantry** 🛒 - Purchased items (sugar, spices, vinegar, etc.)
    - **Packaging** 📦 - Containers (mason jars, bags, labels, lids)
  - **Recipe Cards**: 16 pre-loaded recipes with full cost breakdowns
  - **Live Cost Calculator**: Shows Cost, Price, Profit (You Earn), and Margin %
  - **Margin Color Coding**: Visual indicators (green = excellent, amber = review)
  - **Full CRUD**: Add/edit/delete ingredients and recipes from admin UI
  - **Database Persistence**: All changes saved to PostgreSQL via Prisma
  - **API Routes**: Complete REST API for ingredients and recipes
  - **UX Polish**: Friendly copy, "You Earn" instead of "Profit", mom-friendly interface
- [x] **Seasonal Planner Feature (Dec 27, 2025)**: 🌱📅
  - **New Admin Tab**: "Seasonal Planner" for production calendar and task management.
  - **Crop Calendar**: Visual year timeline showing:
    - Seed start (indoors), transplant, direct sow phases
    - Harvest windows with peak season highlighting
    - Brand-aligned color palette with consistent phase colors
    - Urgency-based sorting (upcoming activities first)
  - **12 Portland OR Crops** pre-seeded (Zone 8b):
    - Apples, Tomatoes, Cucumbers, Green Beans, Peppers
    - Blueberries, Raspberries, Plums, Peas, Basil, Parsley, Sorrel
  - **Add/Edit Crops**: Modal with quick-add presets and month-based pickers
  - **Crop Detail Panel**: Shows full lifecycle, planting notes, linked recipes
  - **Seasonal Tasks**: Monthly checklist with year-over-year archiving
  - **Print Feature**: Print-friendly views of calendar and task list
  - **Full API**: CRUD endpoints for crops and tasks
- [x] **Category Management (Dec 27, 2025)**: 📂
  - **Product Categories**: Applesauces, Jams, Spreads, Dried Goods, Pickled Goods
  - **Manage Categories Modal**: 
    - View all categories with product counts
    - Expandable to show products under each category
    - Edit/delete any category (including defaults)
    - Add new categories
  - **Inline Editing**: Click product description or price to edit in-place
  - **Clean Product Table**: Icon-only actions, category dropdown under name

## Pending / Blocked
- [ ] **Stripe Live Mode**: Awaiting live API keys for production testing.
- [ ] **COGS → Product Publishing**: "Publish to Store" flow from recipes (story 3.1 scope)
- [ ] **Price Sync Prompts**: Alert when recipe price changes for linked products

## Next Steps
1. **Complete Story 3.1**: Implement "Publish to Store" flow from Recipe Costing tab.
2. **End-to-End Visual Polish**: Final pass on typography and spacing for mobile checkout.
3. **Product Content Pass**: Refine heritage descriptions for the current harvest.

## Known Issues
- `prisma.config.ts` causes build noise but deployment works.
- Hydration errors in Checkout (FIXED - using `mounted` state).
