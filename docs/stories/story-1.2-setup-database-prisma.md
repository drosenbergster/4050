# Story 1.2: Set Up PostgreSQL Database and Prisma ORM

**Epic:** Epic 1 - Foundation & Core Infrastructure  
**Status:** Ready for Development  
**Story Points:** 3  
**Priority:** P0 (Blocker)

---

## Story

As a **developer**,  
I want **to configure PostgreSQL database and Prisma ORM with initial schema**,  
so that **the application can persist data and I can interact with the database using type-safe queries**.

---

## Acceptance Criteria

- [ ] AC1: PostgreSQL database provisioned (local for dev, Railway/Render/Vercel Postgres for production)
- [ ] AC2: Prisma installed and initialized in the project
- [ ] AC3: Database connection string configured via environment variables (`.env.local`)
- [ ] AC4: Initial Prisma schema created with at least a `User` model (for admin authentication)
- [ ] AC5: Prisma migration generated and applied successfully
- [ ] AC6: Prisma Client generated and can be imported in API routes
- [ ] AC7: Test database connection by running a simple query (e.g., `prisma db seed` or API route test)

---

## Tasks

### Task 1: Install Prisma
- [ ] Install Prisma CLI and Prisma Client as dependencies
- [ ] Verify Prisma version in package.json

### Task 2: Initialize Prisma
- [ ] Run `npx prisma init`
- [ ] Verify `prisma/schema.prisma` file created
- [ ] Verify `.env` file created with DATABASE_URL placeholder

### Task 3: Set Up PostgreSQL Database
- [ ] Choose database option (local Docker or Railway free tier)
- [ ] Start/provision PostgreSQL database
- [ ] Get database connection URL
- [ ] Update `.env.local` with DATABASE_URL

### Task 4: Create Initial Prisma Schema
- [ ] Define User model in schema.prisma with fields:
  - id (String, UUID, primary key)
  - email (String, unique)
  - passwordHash (String)
  - name (String)
  - createdAt (DateTime)
  - updatedAt (DateTime)
- [ ] Configure PostgreSQL as database provider
- [ ] Verify schema syntax is valid

### Task 5: Run First Migration
- [ ] Run `npx prisma migrate dev --name init`
- [ ] Verify migration files created in prisma/migrations/
- [ ] Verify Prisma Client generated successfully
- [ ] Confirm database tables created

### Task 6: Create Database Client Singleton
- [ ] Create `lib/server/db.ts` file
- [ ] Implement Prisma Client singleton pattern (prevent multiple instances in dev)
- [ ] Export prisma client for use in API routes

### Task 7: Test Database Connection
- [ ] Create simple test API route to query database
- [ ] Run test query to verify connection works
- [ ] Verify Prisma Client can be imported and used

---

## Dev Notes

**Architecture Reference:**
- See `docs/architecture.md` section "Database Architecture" and "Data Access Layer"
- Prisma schema structure defined in architecture

**Key Decisions:**
- Use PostgreSQL 15+ (per architecture)
- Use Prisma 5.7+ for ORM
- Use Railway free tier for development database (no local PostgreSQL needed)
- Implement singleton pattern to avoid "too many connections" in development

**Database Options:**
1. **Railway (Recommended for MVP):** Free tier, 500MB, auto-backups, easy setup
2. **Local Docker:** `docker run --name 4050-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15`
3. **Vercel Postgres:** Free tier available, tight integration with Vercel

**Important:**
- Never commit `.env.local` to Git (already in .gitignore)
- Use `.env.example` to document required environment variables
- Database URL format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`

---

## Testing

### Manual Testing Checklist
- [ ] `npx prisma studio` opens and shows User table
- [ ] Can create a test user record via Prisma Studio
- [ ] Test API route successfully queries database
- [ ] No Prisma Client errors in console
- [ ] `npx prisma migrate status` shows migrations applied

### Automated Tests
None required for this story (infrastructure setup). Will add database tests in later stories.

---

## Dev Agent Record

### Agent Model Used
- Model: _[To be filled by dev agent]_

### Implementation Log
_[Dev agent updates as work progresses]_

### Debug Log References
_[Link to debug log entries if issues encountered]_

### Completion Notes
_[Summary of what was implemented, any deviations from plan]_

### File List
**Files Created:**
- _[List new files]_

**Files Modified:**
- _[List modified files]_

**Files Deleted:**
- _[List deleted files]_

---

## Change Log

| Date | Author | Changes |
|------|--------|---------|
| 2025-11-28 | James (Dev) | Story file created |

---

## Related

**Depends On:** Story 1.1 (Next.js project must exist)  
**Blocks:** Story 1.3 (Admin authentication needs User model)  
**References:** 
- PRD: Epic 1, Story 1.2
- Architecture: Database Schema, Data Access Layer sections







