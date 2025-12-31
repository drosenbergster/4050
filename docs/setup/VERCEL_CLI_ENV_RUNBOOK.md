# Vercel CLI Env Runbook (Pick Up Later)

This document captures the current state and the exact steps to finish setting `DATABASE_URL` + `DIRECT_URL` on Vercel via CLI.

---

## Current Status (as of this change set)

### Checkout
- Checkout is now **3-step**: **Details → Plant Your Seeds → Payment** (`app/checkout/page.tsx`).
- “Seeds of Kindness” math is aligned to:
  - **1 seed always + 1 more per $10**
  - **Shipping does not count**
  - **“Sow Extra Seeds” does count** (extra support increases seeds).
- Copy is softened to **“Plant Your Seeds”** (no “Impact” language).

### Checkout backend hardening (important)
- `app/api/checkout/route.ts` is hardened so it **will not return a Stripe `clientSecret` unless the Order is persisted and linked**.
- Stripe webhook (`app/api/webhooks/stripe/route.ts`) prefers `paymentIntent.metadata.orderId` to find the Order.

### Types & Prisma
- `lib/types.ts` updated to include `proceedsChoice`, `extraSupportAmount`, `seedCount` and allow `createdAt/updatedAt` as `Date | string`.
- `prisma/schema.prisma` now has `directUrl = env("DIRECT_URL")` enabled again.
- Prisma client sometimes needed regeneration to reflect schema: `npx prisma generate`.

### Docs
- BMAD “always load” architecture docs were missing; created:
  - `docs/architecture/coding-standards.md`
  - `docs/architecture/tech-stack.md`
  - `docs/architecture/source-tree.md`
- Updated env docs:
  - `VERCEL_ENV_SETUP.md`
  - `VERCEL_DATABASE_FIX.md`
  - `docs/ENVIRONMENT-FIX-SUMMARY.md` (added build-time note)

---

## Verified locally

- `npm run lint` passes (warnings only).
- `npm run build` passes.
  - Build logs still show `FATAL: Tenant or user not found` if local DB env is misconfigured; `/shop` has a static fallback so build completes.

---

## Remaining lint warnings (non-blocking)

These do not fail lint/build, but can be cleaned up later:
- `app/admin/components/product-list.tsx`: `<img>` warning (should use `next/image`)
- `app/admin/login/page.tsx`: unused `router`
- `app/admin/page.tsx`: unused `Heart` import
- `app/api/checkout/route.ts`: unused `CheckoutItemInput` type
- `app/api/test-db/route.ts`: unused `getAuthSession`
- `middleware.ts`: unused `req`
- `tools/google-cloud-sdk/**`: unused vars (best excluded from lint or ignored)

---

## Vercel CLI setup (what we need)

### Known project linkage
- Vercel project is already linked in repo via `.vercel/project.json`.
- Project name: `4050`
- Team slug: `david-rosenbergs-projects-4a669732`
- Team id: `team_qopuYENqKkWsqCZmsL1HDiXN`

### Required environment variables on Vercel
Set these for **Production**, **Preview**, **Development**:

- `DATABASE_URL` (pooler, IPv4, 6543):
  - username must be `postgres.<PROJECT_REF>`
  - must include `?pgbouncer=true&connection_limit=1`
- `DIRECT_URL` (direct, 5432) for Prisma migrations/introspection

### Sensitive values handling
Do **not** paste secrets into chat.
Preferred method:
- store Vercel CLI token in `.env.vercel-token` (local-only) and keep app env vars in `.env.local`
- use CLI with stdin redirection from local files (so the secret doesn’t land in shell history).

---

## Pick-up steps (CLI) — safe, repeatable

### Step 0: Add Vercel token locally
Create a Vercel token and add it to `.env.vercel-token`:

```bash
VERCEL_TOKEN=...your token...
```

### Step 1: Ensure local env has both DB URLs
We expect:
- `.env` contains `DATABASE_URL` and `DIRECT_URL`
- `.env.local` may override them if needed

### Step 2: Create temporary secret files (prevents shell history leaks)
This reads your env vars and writes them to locked-down files.

```bash
set -euo pipefail
set -a
source .env
test -f .env.local && source .env.local || true
set +a

umask 077
printf "%s" "$DATABASE_URL" > .tmp.vercel.DATABASE_URL.txt
printf "%s" "$DIRECT_URL"   > .tmp.vercel.DIRECT_URL.txt
```

### Step 3: Login (token-based, non-interactive)
Use `VERCEL_TOKEN` so the CLI can authenticate without prompting:

```bash
set -a
source .env.vercel-token
set +a
```

### Step 4: Install/run the CLI
If you don’t already have `vercel` installed globally, you can run:

```bash
npx --yes vercel --version
```

### Step 5: Link to the correct team/project (if needed)
If the repo is already linked, this should be a no-op.

```bash
npx --yes vercel link --yes --scope david-rosenbergs-projects-4a669732
```

### Step 6: Set env vars for each environment
Vercel CLI does not have a universal “overwrite” flag for `env add`. The most reliable scripted pattern is:
1) remove existing var
2) add it back from the file via stdin

Run for **each** environment: `production`, `preview`, `development`.

```bash
for env in production preview development; do
  npx --yes vercel env rm DATABASE_URL "$env" --yes --scope david-rosenbergs-projects-4a669732 || true
  npx --yes vercel env rm DIRECT_URL   "$env" --yes --scope david-rosenbergs-projects-4a669732 || true

  npx --yes vercel env add DATABASE_URL "$env" --scope david-rosenbergs-projects-4a669732 < .tmp.vercel.DATABASE_URL.txt
  npx --yes vercel env add DIRECT_URL   "$env" --scope david-rosenbergs-projects-4a669732 < .tmp.vercel.DIRECT_URL.txt
done
```

> Note: If your CLI version doesn’t accept `env rm NAME ENV`, use interactive removal (`vercel env rm`) or remove without the env argument, then re-add per env.

### Step 7: Cleanup temp secret files
```bash
rm -f .tmp.vercel.DATABASE_URL.txt .tmp.vercel.DIRECT_URL.txt
```

### Step 8: Redeploy + verify
After setting env vars, redeploy and verify:
- `/api/products` works (no 500/503)
- checkout can create order + payment intent
- webhook updates order to PAID

---

## Common failure: `FATAL: Tenant or user not found`

This is almost always one of:
- pooler username missing tenant prefix (`postgres.<PROJECT_REF>`)
- wrong port (should be 6543 for Vercel runtime)
- missing `pgbouncer=true` or `connection_limit=1`

---





