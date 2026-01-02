# 4050 Organization Management Enhancement PRD

**Version:** 1.0  
**Date:** January 2025  
**Status:** Draft  
**Project:** 4050 Homemade Kindness  
**Enhancement Type:** New Feature Addition

---

## Intro Project Analysis and Context

### Existing Project Overview

**Current Project State:**
4050 is an e-commerce platform selling homemade artisan products (applesauce, apple butter, jams, jellies) with a "Seeds of Kindness" system where customers direct profits to community organizations. The platform uses Next.js 16, TypeScript, PostgreSQL (Supabase), and Prisma ORM.

**Current Organization System:**
- Organizations are hardcoded in `lib/causes.ts` as `CURRENT_QUARTER_ORGS` array
- No database persistence for organizations
- No admin interface for managing organizations
- Nomination form exists on `/impact` page but is not functional (simulated submission only)
- Impact page displays "Q1 2025" hardcoded, suggesting quarterly cycles but no actual rotation system
- Orders store `proceedsChoice` (string ID) and `seedCount` (int) referencing hardcoded organization IDs

**Analysis Source:** IDE-based fresh analysis

### Available Documentation

- ✅ Tech Stack Documentation
- ✅ Source Tree/Architecture  
- ✅ Coding Standards
- ✅ API Documentation
- ✅ Technical Debt Documentation

### Enhancement Scope Definition

**Enhancement Type:**
- ✅ New Feature Addition

**Enhancement Description:**
Create a database-driven organization management system with seasonal rotation (November and May), an admin panel for managing active organizations and reviewing nominations, and a functional nomination workflow that allows community members to suggest new partner organizations.

**Impact Assessment:**
- ✅ Significant Impact (substantial existing code changes)
  - Requires new database schema (Organization model)
  - Migration from hardcoded `lib/causes.ts` to database-driven system
  - New admin UI page/component
  - New API endpoints for organizations and nominations
  - Updates to checkout, impact page, thank you page, and admin dashboard to use database instead of hardcoded data

### Goals and Background Context

**Goals:**
- Enable admins (user and their mom) to easily manage which organizations are active for each seasonal cycle
- Allow community members to nominate new organizations through a functional form
- Maintain historical data of organizations and their participation in past cycles
- Keep the admin interface extremely simple and focused - "just organizations" - so it's not overwhelming
- Support seasonal rotation (November and May) with flexibility for future cycle transition workflows

**Background Context:**
Currently, changing which organizations customers can select requires editing code in `lib/causes.ts`. This is not sustainable for a two-admin team (user and their mom) who need to manage organizations seasonally. The system needs to support:
1. A "pool" of approved organizations that can be activated/deactivated for cycles
2. A nomination workflow where community suggestions are reviewed and approved
3. Seasonal cycles (November and May) with the ability to rotate organizations
4. Historical tracking while keeping the interface minimal and simple

**Key Design Principles:**
- **Simplicity First:** Admin interface must be extremely simple - no overwhelming dashboards, graphs, or complex data visualizations
- **Mom-Friendly:** Designed for non-technical users (user's mom) to easily understand and use
- **One-Page Focus:** All organization management on a single page with collapsible sections
- **Minimal Historical Data:** Track history but don't overwhelm - show it's in the pool, maybe collapsible details

---

## Requirements

### Functional Requirements

**FR1:** Create a database schema for organizations with fields:
- id, name, shortDescription, description, category (food/garden/youth/community), website, logoUrl, imageUrl
- status (ACTIVE, IN_POOL, NOMINATED, PAST_PARTNER)
- createdAt, updatedAt
- Optional: contactPerson, contactEmail (for future use)

**FR2:** Create a database schema for nominations with fields:
- id, organizationName, website, missionDescription, reason, nominatorName, nominatorEmail
- status (PENDING, APPROVED, REJECTED)
- reviewedBy, reviewedAt, reviewNotes
- createdAt, updatedAt

**FR3:** Admin panel must display all organization management on a single page with three sections:
- **Top Section:** Concise table showing active organizations with seed count and money donated for current cycle
- **Middle Section:** Collapsible dropdown for "Organization Pool" showing all approved organizations with on/off toggle to activate/deactivate
- **Bottom Section:** Collapsible dropdown for "Pending Nominations" showing nominations awaiting review

**FR4:** Active organizations table must show:
- Organization name
- Category
- Seeds received this cycle (calculated from orders)
- Money donated this cycle (calculated from orders)
- Simple, clean table format - no graphs or complex visualizations

**FR5:** Organization Pool section must:
- Display all organizations with status IN_POOL or PAST_PARTNER
- Show simple on/off toggle for each organization to activate/deactivate
- When toggled ON, organization becomes ACTIVE and appears in active table
- When toggled OFF, organization returns to IN_POOL status
- Each organization can have collapsible details (click or hover to expand) showing: description, website, historical participation (minimal - just cycle names)

**FR6:** Pending Nominations section must:
- Display all nominations with status PENDING
- Show organization name, website, mission description, reason, nominator info
- Provide "Approve" and "Reject" buttons for each nomination
- When approved: nomination status → APPROVED, create new organization with status IN_POOL
- When rejected: nomination status → REJECTED (stored for reference but hidden from main view)
- Both admins can review and approve/reject nominations

**FR7:** Nomination form on `/impact` page must:
- Submit to API endpoint `/api/organizations/nominate`
- Store nomination in database with status PENDING
- Show success message after submission
- Fields: Organization Name (required), Website (optional), Mission/Description (required), Reason (required), Your Name (optional), Your Email (optional)
- No email notification to nominator when approved/rejected

**FR8:** System must migrate existing hardcoded organizations from `lib/causes.ts`:
- Create database records for all current `CURRENT_QUARTER_ORGS`
- Set their status to ACTIVE for initial cycle
- Maintain backward compatibility during migration period

**FR9:** All existing code that references `CURRENT_QUARTER_ORGS` or `CURRENT_CAUSES` must be updated to:
- Query database for active organizations instead
- Maintain same data structure/interface for compatibility
- Update: checkout page, impact page, thank you page, admin dashboard, order detail modal

**FR10:** Seasonal cycle management:
- System must support concept of "current cycle" (November or May)
- Active organizations are those with status ACTIVE for current cycle
- **Note:** Cycle transition process (ending one cycle, starting another) to be determined later - document as future work

**FR11:** Historical data tracking:
- System must track which organizations were active in which cycles
- Display minimal historical info (cycle names) in collapsible organization details
- Don't overwhelm admin interface with historical data

### Non-Functional Requirements

**NFR1:** Admin interface must load and respond within 2 seconds for typical use cases (viewing active orgs, toggling status)

**NFR2:** Database queries for active organizations must be optimized with proper indexes on status and cycle-related fields

**NFR3:** Admin interface must be responsive and work on tablet devices (for mom's ease of use)

**NFR4:** All organization data changes must be logged (who made change, when) for audit purposes

**NFR5:** System must maintain backward compatibility during migration - existing orders with hardcoded organization IDs must still display correctly

**NFR6:** Nomination form must validate input (URL format for website, required fields) before submission

**NFR7:** Admin interface must use existing design patterns from current admin dashboard (same styling, component patterns)

### Compatibility Requirements

**CR1:** Existing API compatibility - `/api/checkout` endpoint must continue to accept `proceedsChoice` as string ID, but now validates against database instead of hardcoded list

**CR2:** Database schema compatibility - New Organization and Nomination models must not conflict with existing Order, Product, User models. Use Prisma migrations.

**CR3:** UI/UX consistency - New admin organization management page must match existing admin dashboard styling, tab structure, and component patterns

**CR4:** Integration compatibility - Existing code importing from `lib/causes.ts` must be updated gradually, maintaining same exported interface during transition

---

## User Interface Enhancement Goals

### Integration with Existing UI

The new organization management interface will integrate with the existing admin dashboard as a new tab, following the same design patterns:
- Same header/navigation structure
- Same tab switching mechanism (currently: orders, shop, cogs, planner)
- Same styling (Tailwind CSS, existing color scheme)
- Same component patterns (tables, modals, buttons)

### Modified/New Screens and Views

**New Admin Page:** `/app/admin/organizations/page.tsx` (or new tab in existing admin dashboard)
- Single page with three collapsible sections as specified in FR3
- Uses existing admin layout and authentication

**Modified Pages:**
- `/app/impact/page.tsx` - Connect nomination form to API
- `/app/checkout/page.tsx` - Query database for active organizations
- `/app/thank-you/page.tsx` - Query database for organization details
- `/app/admin/page.tsx` - Add "Organizations" tab (or link to organizations page)
- `/app/admin/components/order-detail-modal.tsx` - Query database for organization name

### UI Consistency Requirements

- Use existing Tailwind color scheme: `#4A7C59` (green), `#5C4A3D` (brown), `#FDF8F3` (cream)
- Use existing Lucide React icons
- Follow existing table styling from admin orders page
- Use existing button and form styling patterns
- Maintain "simple and clean" aesthetic - no complex charts or graphs

---

## Technical Constraints and Integration Requirements

### Existing Technology Stack

**Languages:** TypeScript 5.x (strict mode)  
**Frameworks:** Next.js 16 (App Router), React  
**Database:** PostgreSQL (Supabase) with Prisma ORM  
**Infrastructure:** Vercel  
**External Dependencies:** NextAuth.js, Stripe, Resend

### Integration Approach

**Database Integration Strategy:**
- Add new Prisma models: `Organization` and `Nomination`
- Create migration to add tables with proper indexes
- Add relationship: Orders reference Organization (via proceedsChoice string ID)
- Migration script to seed initial organizations from `lib/causes.ts`

**API Integration Strategy:**
- Create `/api/admin/organizations` endpoint for CRUD operations
- Create `/api/organizations/nominate` endpoint for public nomination submission
- Create `/api/organizations/active` endpoint for public-facing active orgs list
- Update existing `/api/checkout` to validate organization ID against database

**Frontend Integration Strategy:**
- Create new admin page component following existing patterns
- Create utility function to replace `lib/causes.ts` exports (query database, return same structure)
- Update all components importing from `lib/causes.ts` to use new utility
- Keep `lib/causes.ts` as deprecated wrapper during transition

**Testing Integration Strategy:**
- Unit tests for organization status transitions
- Integration tests for nomination approval workflow
- E2E tests for admin toggling organization active status

### Code Organization and Standards

**File Structure Approach:**
- New models: `prisma/schema.prisma` (add Organization, Nomination)
- New API routes: `app/api/admin/organizations/route.ts`, `app/api/organizations/nominate/route.ts`, `app/api/organizations/active/route.ts`
- New admin page: `app/admin/organizations/page.tsx` (or add tab to existing admin page)
- New utility: `lib/server/organizations.ts` (database queries)
- Migration: `prisma/migrations/XXXXX_add_organizations/`

**Naming Conventions:**
- Follow existing patterns: PascalCase for components, camelCase for functions, kebab-case for routes
- Organization status enum: `ACTIVE | IN_POOL | NOMINATED | PAST_PARTNER`
- Nomination status enum: `PENDING | APPROVED | REJECTED`

**Coding Standards:**
- Follow existing TypeScript strict mode
- Use existing Prisma patterns for database queries
- Follow existing API route patterns (error handling, response format)
- Use existing admin component patterns

**Documentation Standards:**
- Update `docs/architecture.md` with new Organization model
- Document migration process from hardcoded to database-driven
- Add admin user guide for organization management

### Deployment and Operations

**Build Process Integration:**
- Prisma migrations run automatically on Vercel deployment
- No changes to existing build process

**Deployment Strategy:**
- Deploy database migration first
- Deploy API endpoints
- Deploy frontend changes
- Run data migration script to seed organizations

**Monitoring and Logging:**
- Log organization status changes (who, when, what)
- Log nomination approvals/rejections
- Monitor API endpoint performance

**Configuration Management:**
- No new environment variables required
- Use existing DATABASE_URL

### Risk Assessment and Mitigation

**Technical Risks:**
- **Risk:** Breaking existing checkout if organization IDs don't match during migration  
  **Mitigation:** Maintain mapping of old hardcoded IDs to new database IDs, support both during transition

- **Risk:** Performance issues if querying organizations on every page load  
  **Mitigation:** Cache active organizations, use database indexes, consider edge caching

**Integration Risks:**
- **Risk:** Existing orders reference hardcoded organization IDs that no longer exist  
  **Mitigation:** Keep historical organization records, never delete, only change status

- **Risk:** Admin interface too complex despite simplicity goals  
  **Mitigation:** User testing with mom, iterative simplification, remove any non-essential features

**Deployment Risks:**
- **Risk:** Data migration fails or corrupts existing data  
  **Mitigation:** Backup database before migration, test migration on staging, rollback plan

**Mitigation Strategies:**
- Phased rollout: Deploy database schema first, then API, then frontend
- Feature flag for new organization system (fallback to hardcoded during transition)
- Comprehensive testing of nomination → approval → activation workflow

---

## Epic and Story Structure

**Epic Structure Decision:** Single comprehensive epic "Organization Management System" because:
- All stories are tightly coupled (database → API → admin UI → public UI)
- Stories must be implemented in sequence (can't have admin UI without database)
- Single epic allows for cohesive testing and deployment
- Stories naturally build on each other

### Epic 1: Organization Management System

**Epic Goal:** Enable admins to manage partner organizations through a simple database-driven system with community nominations, replacing the hardcoded organization list with a flexible, seasonal rotation system.

**Integration Requirements:**
- Must maintain backward compatibility with existing orders
- Must preserve all existing organization data during migration
- Must integrate seamlessly with existing admin dashboard patterns
- Must not break existing checkout flow

#### Story 1.1: Database Schema and Models

**As an** admin,  
**I want** organizations and nominations stored in the database,  
**so that** we can manage them dynamically instead of editing code.

**Acceptance Criteria:**
1. Prisma schema includes Organization model with all required fields (name, descriptions, category, website, imageUrl, status, timestamps)
2. Prisma schema includes Nomination model with all required fields (organizationName, website, missionDescription, reason, nominator info, status, review fields, timestamps)
3. Organization status enum: ACTIVE, IN_POOL, NOMINATED, PAST_PARTNER
4. Nomination status enum: PENDING, APPROVED, REJECTED
5. Database migration runs successfully
6. Indexes created on status fields for performance
7. Seed script migrates existing hardcoded organizations from `lib/causes.ts` to database with ACTIVE status

**Integration Verification:**
- IV1: Verify existing Order model still works (no breaking changes)
- IV2: Verify database connection and Prisma client generation succeeds
- IV3: Verify seed script doesn't duplicate organizations if run multiple times

#### Story 1.2: Organization API Endpoints

**As an** admin,  
**I want** API endpoints to manage organizations,  
**so that** the admin interface can query and update organization data.

**Acceptance Criteria:**
1. `GET /api/admin/organizations` returns all organizations with their status
2. `GET /api/organizations/active` returns only ACTIVE organizations (public endpoint, no auth required)
3. `PATCH /api/admin/organizations/[id]` allows updating organization status (ACTIVE ↔ IN_POOL)
4. `POST /api/admin/organizations` allows creating new organizations (for approved nominations)
5. All admin endpoints require authentication (NextAuth session)
6. API returns data in same format as current `CURRENT_QUARTER_ORGS` structure for compatibility
7. Proper error handling and validation

**Integration Verification:**
- IV1: Verify authentication middleware works with existing NextAuth setup
- IV2: Verify API responses match expected format used by frontend
- IV3: Verify public active organizations endpoint is accessible without auth

#### Story 1.3: Nomination API Endpoint

**As a** community member,  
**I want** to submit organization nominations through the website,  
**so that** my suggestions are stored for admin review.

**Acceptance Criteria:**
1. `POST /api/organizations/nominate` accepts nomination form data
2. Validates required fields (organizationName, missionDescription, reason)
3. Validates website URL format if provided
4. Creates nomination record with status PENDING
5. Returns success response
6. No email notification sent (as per requirements)
7. Handles duplicate nominations gracefully (same org name within 30 days)

**Integration Verification:**
- IV1: Verify nomination form on impact page can successfully submit
- IV2: Verify nominations appear in database with correct status
- IV3: Verify form validation prevents invalid submissions

#### Story 1.4: Admin Organization Management UI

**As an** admin (user or their mom),  
**I want** a simple, single-page interface to manage organizations,  
**so that** I can easily see active orgs, manage the pool, and review nominations without being overwhelmed.

**Acceptance Criteria:**
1. New admin page (or tab) displays three sections as specified:
   - Top: Active organizations table with seeds and money
   - Middle: Collapsible Organization Pool section with on/off toggles
   - Bottom: Collapsible Pending Nominations section
2. Active organizations table shows: name, category, seeds this cycle, money this cycle
3. Seeds and money calculated from orders with proceedsChoice matching org ID for current cycle
4. Organization Pool shows all IN_POOL/PAST_PARTNER orgs with toggle switch
5. Toggling ON makes org ACTIVE and adds to active table
6. Toggling OFF makes org IN_POOL and removes from active table
7. Each org in pool has collapsible details (description, website, historical cycles)
8. Pending Nominations shows all PENDING nominations
9. Each nomination shows: org name, website, mission, reason, nominator info
10. Approve button creates organization (status IN_POOL) and updates nomination status
11. Reject button updates nomination status to REJECTED
12. All sections use collapsible dropdowns (can expand/collapse)
13. Interface matches existing admin dashboard styling
14. Responsive design works on tablets

**Integration Verification:**
- IV1: Verify admin authentication required to access page
- IV2: Verify toggling organization status updates database and refreshes display
- IV3: Verify approving nomination creates organization and updates nomination status
- IV4: Verify seeds/money calculations match existing admin dashboard calculations

#### Story 1.5: Update Frontend to Use Database

**As a** customer,  
**I want** the checkout and impact pages to show current active organizations from the database,  
**so that** I always see the most up-to-date list of organizations I can support.

**Acceptance Criteria:**
1. Create `lib/server/organizations.ts` utility that queries database for active orgs
2. Update `app/checkout/page.tsx` to use database query instead of `CURRENT_CAUSES`
3. Update `app/impact/page.tsx` to use database query instead of `CURRENT_QUARTER_ORGS`
4. Update `app/thank-you/page.tsx` to query database for organization details
5. Update `app/admin/page.tsx` (impact tracker) to query database
6. Update `app/admin/components/order-detail-modal.tsx` to query database
7. All updates maintain same data structure/interface (backward compatible)
8. Deprecate `lib/causes.ts` but keep as wrapper during transition
9. Nomination form on impact page successfully submits to API

**Integration Verification:**
- IV1: Verify checkout page still displays organizations correctly
- IV2: Verify customers can select organizations and complete checkout
- IV3: Verify impact page displays active organizations
- IV4: Verify thank you page shows correct organization name
- IV5: Verify admin dashboard impact tracker still works
- IV6: Verify existing orders with old organization IDs still display correctly

#### Story 1.6: Historical Data and Cycle Tracking

**As an** admin,  
**I want** to see minimal historical information about organizations,  
**so that** I can understand which organizations have been partners before without being overwhelmed by data.

**Acceptance Criteria:**
1. System tracks which cycle each organization was active (store cycle identifier: "Fall 2025", "Spring 2026", etc.)
2. Organization details in pool show collapsible "History" section
3. History shows: "Active in: Fall 2025, Spring 2026" (simple list, no graphs)
4. Historical data doesn't clutter main interface
5. Past partners can be easily reactivated for new cycles

**Integration Verification:**
- IV1: Verify cycle tracking doesn't impact performance
- IV2: Verify historical data displays correctly in collapsible section
- IV3: Verify reactivating past partner works correctly

---

## Future Work / Deferred Decisions

### Cycle Transition Process

**Status:** To be determined later

**Note:** As we get closer to the first cycle transition (November 2025), we need to determine:
- How to "end" a cycle and "start" a new one
- Whether to automatically deactivate all current organizations or keep some active
- How to calculate and distribute funds at cycle end
- Whether to show cycle summary/report to admins
- How to handle organizations that should stay active across cycles

This will be addressed in a future enhancement once we have experience with the first cycle.

---

## Change Log

| Change | Date | Version | Description | Author |
|--------|------|---------|-------------|--------|
| Initial PRD | January 2025 | 1.0 | Created comprehensive PRD for organization management system | PM Agent |

