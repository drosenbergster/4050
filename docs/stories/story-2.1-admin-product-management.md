# Story 2.1: Admin Product Management UI

**Epic:** Epic 2 - Basic Admin  
**Status:** Completed  
**Story Points:** 5  
**Priority:** P1 (High)

---

## Story

As an **admin user**,  
I want **to add, edit, and delete products through the admin dashboard**,  
so that **I can manage my product catalog without using database tools directly**.

---

## Acceptance Criteria

- [x] AC1: Admin dashboard Products tab displays a list of all products from the database
- [x] AC2: Each product row shows: name, price, category, availability status, and action buttons
- [x] AC3: "Add Product" button opens a form/modal to create a new product
- [x] AC4: Product form includes: name, description, price, image URL, category, and isAvailable toggle
- [x] AC5: "Edit" button on each product opens pre-filled form to update product
- [x] AC6: "Delete" button removes product (with confirmation dialog)
- [x] AC7: All CRUD operations persist to the database via API routes
- [x] AC8: Form validation prevents submitting invalid data (required fields, price format)
- [x] AC9: Success/error messages display after each operation

---

## Tasks

### Task 1: Create Product API Routes (PUT/DELETE)
- [x] Add `PUT /api/products/[id]` route for updating products
- [x] Add `DELETE /api/products/[id]` route for deleting products
- [x] Add authentication check to both routes
- [x] Test with curl or Postman

### Task 2: Build Products List Component
- [x] Replace placeholder "coming soon" content in admin Products tab
- [x] Fetch products from `/api/products` on mount
- [x] Display products in a table/list with columns: Name, Price, Category, Status, Actions
- [x] Add loading and error states

### Task 3: Create Product Form Component
- [x] Build reusable form component for add/edit
- [x] Include all fields: name, description, price, imageUrl, category, isAvailable
- [x] Implement form validation (required fields, price as number)
- [x] Support both "create" and "edit" modes

### Task 4: Implement Add Product Flow
- [x] Wire up "Add Product" button to open form
- [x] Submit to POST `/api/products`
- [x] Show success/error toast
- [x] Refresh product list after success

### Task 5: Implement Edit Product Flow
- [x] Wire up "Edit" button to open pre-filled form
- [x] Submit to PUT `/api/products/[id]`
- [x] Show success/error toast
- [x] Refresh product list after success

### Task 6: Implement Delete Product Flow
- [x] Add confirmation dialog before delete
- [x] Submit to DELETE `/api/products/[id]`
- [x] Show success/error toast
- [x] Refresh product list after success

---

## Dev Notes

**Architecture Reference:**
- Admin routes defined in PRD: PUT/DELETE `/api/admin/products/[id]`
- Existing auth pattern in `lib/server/auth.ts` using NextAuth
- Product schema in `prisma/schema.prisma`

**Current State:**
- Admin page exists at `/admin` with login flow working
- Products tab shows placeholder "coming soon" message
- GET `/api/products` exists and works
- POST `/api/products` exists (needs category field)
- PUT/DELETE routes do NOT exist yet

**Key Decisions:**
- Use modal/slide-over for forms (simpler than separate pages)
- Price input in dollars, convert to cents on submit
- Image upload can be URL-based for MVP (direct upload can come later)
- Categories: Applesauce, Jams, Spreads, Dried Goods, Pickled

---

## Testing

### Manual Testing Checklist
- [ ] Navigate to `/admin`, log in, click Products tab
- [ ] Verify product list loads from database
- [ ] Click "Add Product", fill form, submit → verify new product appears
- [ ] Click "Edit" on a product, change values, save → verify changes persist
- [ ] Click "Delete", confirm → verify product removed
- [ ] Test form validation (submit empty form, invalid price)
- [ ] Verify unauthenticated requests to API routes return 401

### Automated Tests
None required for MVP (manual testing sufficient for admin UI).

---

## Handoff Notes for Architect

**What's Needed:**
1. API route structure for `PUT /api/products/[id]` and `DELETE /api/products/[id]`
2. Decision on form UI pattern (modal vs inline vs separate page)
3. Any state management approach (React state vs SWR/React Query for data fetching)
4. Confirmation on image handling (URL input vs file upload)

**Existing Patterns to Follow:**
- Auth pattern from `app/api/products/route.ts` (getAuthSession)
- Table styling from admin Orders list
- Form styling to match login page aesthetic

---

## Related

**Depends On:** Story 1.2 (Database setup)  
**Blocks:** None  
**References:** 
- PRD: FR7, Epic 2
- Architecture: API Routes section

---

## Change Log

| Date | Author | Changes |
|------|--------|---------|
| 2025-12-16 | John (PM) | Story created for handoff to Architect |
