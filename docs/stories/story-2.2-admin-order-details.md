# Story 2.2: Admin Order Detail View

**Epic:** Epic 2 - Basic Admin  
**Status:** Ready for Review  
**Story Points:** 3  
**Priority:** P2 (Medium)

---

## Story

As an **admin user**,  
I want **to view the specific items and customer details for each order**,  
so that **I can fulfill the order accurately and understand the impact sown**.

---

## Acceptance Criteria

- [x] AC1: Clicking an order in the Admin Dashboard opens a detailed view (modal or expanded row)
- [x] AC2: Detailed view shows customer contact info (Email, Phone)
- [x] AC3: Detailed view shows shipping address (if applicable)
- [x] AC4: Detailed view lists all items in the order: Name, Quantity, Unit Price, Line Total
- [x] AC5: Detailed view shows the "Seeds of Kindness" summary for that order
- [x] AC6: Detailed view shows the selected cause and any "Extra Support" sown

---

## Tasks

### Task 1: Update Admin Dashboard to support expanded order view
- [x] Add state for selected order in `AdminDashboard`
- [x] Implement a Modal or Expandable section to show order details
- [x] Use `order.items` (which are already included in the API response) to display item list

### Task 2: Build Order Details UI
- [x] Create a clean, "Kitchen Journal" style detail layout
- [x] Display Customer Information section
- [x] Display Order Items table
- [x] Display Impact Summary (Seeds + Extra Support)

### Task 3: Refine Fulfillment Toggle location
- [x] Ensure the "Mark as Fulfilled" button is easily accessible from the detail view

---

## Dev Agent Record

### Agent Model Used
- gemini-3-flash-preview

### Debug Log
- [2025-12-19 02:30] Initializing story.
- [2025-12-19 02:35] Fixed deprecated `ProductCardNew` usage in `app/components/product-preview.tsx`.
- [2025-12-19 02:36] Deleted `app/components/product-card-new.tsx`.

### Completion Notes
- None yet.

### File List
- `app/admin/page.tsx` (to be modified)
- `docs/stories/story-2.2-admin-order-details.md` (new)

### Change Log
| Date | Author | Changes |
|------|--------|---------|
| 2025-12-19 | James (Dev) | Story created and initialized |

---

## Related

**Depends On:** Story 2.1 (Admin UI)  
**Blocks:** None  
**References:** 
- PRD: FR7
- Architecture: Admin Order Fulfillment section

