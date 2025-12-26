# 4050 Simplified Architecture Document

**Version:** 2.3 (Operational Admin Update)  
**Date:** December 19, 2025  
**Status:** In Development  
**Project:** 4050 Homemade Kindness

---

## Introduction

This document outlines the simplified fullstack architecture for 4050, focused on a straightforward, heartfelt experience for sharing homemade goods from a PNW heritage garden.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-12-19 | 2.3 | Added Admin Order API routes and Search logic | James (Dev) |
| 2025-12-18 | 2.2 | Transitioned from "Voices" to "Seeds of Kindness" ($10 = 1 seed) | John (PM) |
| 2025-12-18 | 2.1 | Refocused terminology (Basket, Homemade Goods, Impact Tracker) | Mary (Analyst) |
| 2025-11-28 | 2.0 | Simplified architecture - removed EasyPost, Resend | Mary (Analyst) |

---

## High Level Architecture

### Technical Summary

4050 uses **Next.js 14+ (App Router)** deployed to Vercel, with **PostgreSQL + Prisma** for data, **Stripe** for payments, and **Vercel Blob** for image storage. The architecture prioritizes a solo stewardship vibe: minimalist UI, flat-rate shipping, and a "Seeds of Kindness" impact tracker for community visibility.

---

## Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| Frontend | Next.js 14+ (App Router) | Full-stack React framework |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS | Utility-first styling |
| Database | PostgreSQL | Data storage |
| ORM | Prisma | Type-safe database access |
| Storage | Vercel Blob | Product images |
| Payments | Stripe | Payment processing |
| Auth | NextAuth.js | Admin authentication (Google) |
| Emails | Resend | Transactional emails (Confirmation) |
| State | React Context + localStorage | Basket state |

---

## API Routes

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/products` | GET | Fetch public product list | No |
| `/api/products` | POST | Create new product | Yes (Admin) |
| `/api/products/[id]` | PUT/DELETE | Update/Delete product | Yes (Admin) |
| `/api/checkout` | POST | Initialize Stripe and Order | No |
| `/api/webhooks/stripe` | POST | Handle Stripe payment success/fail | No |
| `/api/admin/orders` | GET | Fetch all orders with items | Yes (Admin) |
| `/api/admin/orders/[id]` | PATCH | Update order status | Yes (Admin) |

---

## Data Models

### Product
- id, name, description, price, imageUrl, isAvailable, category

### Order
- id, customerName, customerEmail, customerPhone, shippingAddress (JSON), fulfillmentMethod
- **proceedsChoice**: Selected cause ID
- **extraSupportAmount**: "Sow Extra Seeds" amount (cents)
- **seedCount**: Calculated seeds sown (1 base + 1 per $10)
- shippingCost, subtotal, total, paymentStatus, fulfillmentStatus, stripePaymentIntentId

---

## Frontend Pages

### Public Pages
- `/` - Homepage (The Heritage Garden Story)
- `/shop` - From the Garden (Homemade Goods + Search)
- `/basket` - Your Basket
- `/checkout` - Guest Checkout (Hydration-safe)
- `/thank-you` - Thank You (Seeds Sown summary)
- `/about` - Our Story (PNW Backyard Heritage)

### Admin Pages
- `/admin/login` - Admin login (Google OAuth)
- `/admin` - Dashboard (Orders, Products, Impact Tracker)

---

## Key Workflows

### Customer Purchase Flow
1. Browse `/shop` → Search or Filter Homemade Goods.
2. Click `+` icon → Add to Basket (Toast feedback).
3. View `/basket` → Review items.
4. Click checkout → `/checkout` (Client-side hydration handled).
5. Fill form → Select pickup/shipping.
6. **Seeds of Kindness** → "Where would you like to plant your seeds today?"
7. **Sow Extra Seeds** → Optional voluntary gift.
8. Enter payment → Stripe processes (Server-side validation).
9. Success → `/thank-you` page showing seeds sown.

### Admin Order Fulfillment
1. Login → Navigate to `/admin`.
2. View **Seed Growth Tally** → Live percentages.
3. Review order list → **Click order** to see details.
4. Mark as fulfilled → Toggle status in modal or list.

---

## Deployment
- **Frontend/Backend:** Vercel
- **Database:** Supabase/Railway PostgreSQL
- **Storage:** Vercel Blob
- **Migrations:** `prisma migrate deploy`
