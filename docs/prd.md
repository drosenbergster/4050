# 4050 Product Requirements Document (PRD)

**Version:** 1.1  
**Date:** November 28, 2025  
**Status:** Ready for Architecture  
**Project:** 4050 E-commerce Platform

---

## Goals and Background Context

### Goals

- Enable customers to browse and purchase heritage apple products online through a simple, intuitive e-commerce experience
- Support both online shipping and local pickup fulfillment options
- Provide secure payment processing with Stripe integration
- Enable admin to manage product inventory and fulfill orders efficiently
- Communicate the brand story, heritage apple differentiation, and charitable mission clearly
- Deliver a mobile-responsive experience that works seamlessly across all devices
- Launch MVP within 3-4 months to begin generating revenue and community impact
- Create a maintainable system that can be managed without full-time developer support

### Background Context

4050 transforms a long-standing tradition of gifting homemade heritage apple products into a social enterprise e-commerce platform. The business sells artisan products (applesauce, apple butter, jams, jellies) made from heritage apples grown on-site, with profits donated to support local communities through food banks, educational programs, and community centers.

The target audience includes conscious consumers aged 30-65 who value quality, authenticity, and social responsibility, as well as local community members who prefer supporting neighborhood businesses. The MVP focuses on core e-commerce functionality—product catalog, shopping cart, checkout, payment processing, and basic admin tools—while keeping the technical architecture simple and cost-effective for a bootstrap budget and solo operation.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-11-28 | 1.1 | Added User Journeys section, PM Checklist results, improved Story 2.1 seed data details | John (PM) |
| 2025-11-28 | 1.0 | Initial PRD created from Project Brief | John (PM) |

---

## Requirements

### Functional

**FR1:** The system shall display a product catalog showing all available apple products with high-quality photos, product names, descriptions, ingredients, pricing, and availability status.

**FR2:** The system shall allow customers to add products to a shopping cart, specifying quantity for each product.

**FR3:** The system shall allow customers to view their shopping cart, update quantities, remove items, and see the cart subtotal.

**FR4:** The system shall provide a checkout flow that collects customer information (name, email, phone, shipping/billing address).

**FR5:** The system shall allow customers to select either shipping or local pickup as their fulfillment method during checkout.

**FR6:** The system shall calculate real-time shipping costs based on customer location, order weight, and selected shipping method when shipping is selected.

**FR7:** The system shall integrate with Stripe to securely process credit and debit card payments.

**FR8:** The system shall send an email confirmation to customers after successful order placement, including order details, fulfillment method, and next steps.

**FR9:** The system shall provide an admin interface for managing products (create, read, update, delete) including photos, descriptions, pricing, and inventory quantities.

**FR10:** The system shall allow admin to mark products as "sold out" or "available" to control visibility and purchasing.

**FR11:** The system shall provide an admin interface to view all orders with customer details, order contents, fulfillment method, payment status, and fulfillment status.

**FR12:** The system shall allow admin to mark orders as "fulfilled" once shipped or ready for pickup.

**FR13:** The system shall include an "About" page that tells the story of 4050, heritage apples, the production process, and the charitable mission.

**FR14:** The system shall include a "Contact" or "FAQ" page with pickup location details, shipping information, and contact methods.

**FR15:** The system shall display local pickup instructions and location details when customers select local pickup.

**FR16:** The system shall validate customer input during checkout (valid email format, required fields, valid address).

**FR17:** The system shall handle payment failures gracefully and allow customers to retry payment.

**FR18:** The system shall prevent customers from purchasing products that are sold out or have insufficient inventory.

**FR19:** The system shall display a privacy policy and terms of service accessible from the footer.

**FR20:** The system shall track inventory and decrement quantities when orders are placed successfully.

### Non-Functional

**NFR1:** The system shall load pages in under 3 seconds on average broadband connections.

**NFR2:** The system shall be fully responsive and functional on mobile phones, tablets, and desktop computers.

**NFR3:** The system shall support modern browsers (Chrome, Safari, Firefox, Edge - last 2 versions) and mobile browsers (iOS Safari, Android Chrome).

**NFR4:** The system shall maintain WCAG 2.1 AA accessibility compliance for inclusive access.

**NFR5:** The system shall handle at least 100 concurrent users without performance degradation.

**NFR6:** The system shall use HTTPS/SSL for all pages and communications.

**NFR7:** The system shall securely store customer data with appropriate encryption for sensitive information.

**NFR8:** The system shall comply with PCI DSS requirements for payment processing (handled via Stripe).

**NFR9:** The system shall be maintainable by a solo operator without requiring full-time developer support.

**NFR10:** The system shall minimize hosting and infrastructure costs to fit a bootstrap budget.

**NFR11:** The system shall work on 3G mobile connections with acceptable performance.

**NFR12:** The system shall provide clear error messages to users when issues occur.

**NFR13:** The system shall log critical errors for debugging and monitoring purposes.

**NFR14:** The system shall maintain 99% uptime during business hours.

---

## User Interface Design Goals

### Overall UX Vision

Create a warm, inviting, and trustworthy e-commerce experience that reflects the handmade, authentic nature of the products. The design should feel modern yet homey, professional yet personal. Every interaction should reinforce the brand values: heritage, quality, community impact, and care. The shopping experience should be effortless—customers should feel confident and comfortable from browsing through checkout.

### Key Interaction Paradigms

- **Browse and Discover:** Customers immediately see beautiful product photography with clear, concise descriptions. Product tiles invite exploration.
- **Quick Add to Cart:** Simple, one-click "Add to Cart" actions with visual feedback (cart icon updates, subtle animations).
- **Transparent Cart Management:** Persistent cart indicator shows item count; cart page provides clear review and editing capabilities.
- **Guided Checkout:** Step-by-step checkout flow with clear progress indicators, validation feedback, and flexibility to switch between shipping and pickup.
- **Admin Efficiency:** Admin dashboard focuses on the two most critical actions—managing products and fulfilling orders—with minimal clicks and clear status visibility.

### Core Screens and Views

1. **Home Page:** Hero section with brand story, featured products, call-to-action to shop
2. **Product Catalog/Shop:** Grid of product cards with photos, names, prices, and "Add to Cart" buttons
3. **Product Detail Page:** (Optional for MVP, may consolidate into catalog) Larger photo, full description, ingredients, add to cart
4. **Shopping Cart:** List of cart items with quantities, subtotal, and checkout button
5. **Checkout Flow:** Multi-step or single-page form for customer info, fulfillment selection, payment
6. **Order Confirmation:** Success message with order summary and next steps
7. **About Page:** Brand story, heritage apples, charitable mission
8. **Admin Dashboard:** Overview of recent orders and inventory alerts
9. **Admin Products:** Table/grid of products with edit/delete actions and "Add New Product" button
10. **Admin Orders:** Table of orders with customer info, status, and fulfillment actions

### Accessibility

**WCAG 2.1 AA Compliance**

- Semantic HTML structure
- Proper heading hierarchy
- Alt text for all images
- Keyboard navigation support
- Sufficient color contrast (4.5:1 for text)
- Focus indicators for interactive elements
- Form labels and error messaging
- Skip navigation links

### Branding

**Brand Identity to Develop:**
- Simple, clean aesthetic that feels artisan and authentic
- Warm color palette (earth tones, heritage apple reds/greens, natural browns)
- Typography that balances modern readability with handcrafted warmth
- High-quality product photography showing texture and care
- Storytelling elements throughout (heritage, handmade, community)

**No existing brand assets—design will be created as part of MVP development.**

### Target Device and Platforms

**Web Responsive** - The application will be a responsive web application accessible via modern browsers on:
- Desktop computers (Windows, Mac, Linux)
- Mobile phones (iOS, Android)
- Tablets (iPad, Android tablets)

No native mobile apps in MVP scope—web-first approach for maximum reach and minimal development complexity.

---

## Technical Assumptions

### Repository Structure

**Monorepo**

The entire application (frontend, backend API routes, database models) will exist in a single repository using Next.js as the full-stack framework. This simplifies development, deployment, and maintenance for a solo operator.

### Service Architecture

**Monolith with Serverless Functions**

- Next.js application deployed to Vercel provides frontend (React) and backend (API routes as serverless functions)
- No separate backend service—API routes handle business logic, database interactions, and third-party integrations
- Database hosted separately (e.g., Railway, Render, or Vercel Postgres)
- Serverless architecture keeps costs minimal and scales automatically

**Rationale:** Simplicity is paramount for maintainability. Next.js provides everything needed (SSR, API routes, optimized builds) without managing separate services.

### Testing Requirements

**Unit + Integration Testing**

- Unit tests for critical business logic (cart calculations, inventory management, pricing)
- Integration tests for API routes (product CRUD, order creation, payment processing)
- Manual testing for UI flows and checkout process
- No E2E testing framework in MVP to reduce complexity

**Testing Tools:**
- Jest for unit and integration tests
- React Testing Library for component tests
- Stripe test mode for payment testing
- Manual testing checklist for critical user paths

**Rationale:** Focus testing efforts on backend logic and API integration where bugs have highest impact. UI testing will be primarily manual for MVP given time constraints.

### Additional Technical Assumptions and Requests

**Frontend:**
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript for type safety
- **Styling:** Tailwind CSS for rapid, responsive UI development
- **State Management:** React Context API or Zustand for cart state (avoid Redux complexity)
- **Form Handling:** React Hook Form for validation and UX

**Backend:**
- **API:** Next.js API routes (serverless functions)
- **Database:** PostgreSQL with Prisma ORM for type-safe database access
- **Authentication:** Admin authentication using NextAuth.js with simple email/password
- **File Storage:** Vercel Blob or Cloudinary for product images

**Third-Party Integrations:**
- **Payments:** Stripe Checkout or Stripe Elements for payment processing
- **Email:** Resend or SendGrid for transactional emails (order confirmations)
- **Shipping Rates:** EasyPost or direct USPS API integration for real-time rates

**Hosting & Infrastructure:**
- **Frontend/Backend:** Vercel (free tier supports MVP traffic)
- **Database:** Railway, Render, or Vercel Postgres (free or low-cost tier)
- **Domain:** Custom domain (4050.com or similar) with SSL via Vercel

**Environment & Configuration:**
- Environment variables for API keys (Stripe, email, database)
- Separate development, staging (optional), and production environments
- Git repository with main branch protected, feature branch workflow

**Performance Optimization:**
- Next.js Image Optimization for product photos
- Static generation for About page and other content pages
- Server-side rendering for product catalog (fresh inventory data)
- Lazy loading for images below the fold

**Security:**
- HTTPS enforced on all pages
- Admin routes protected with authentication
- CSRF protection for forms
- Input validation and sanitization
- Rate limiting on API routes to prevent abuse
- Stripe handles PCI compliance for payment data

**Monitoring & Logging:**
- Vercel Analytics for basic traffic insights
- Error logging with Sentry (free tier) or Vercel logging
- Admin dashboard shows basic order metrics

**Assumptions:**
- Assume initial traffic will be low (<1000 visitors/month), allowing free/low-cost hosting
- Assume cottage food laws and licensing are handled (not a technical concern)
- Assume product photography will be provided or created separately
- Assume no multi-currency or internationalization needed for MVP
- Assume local pickup is within reasonable distance (no complex logistics)

---

## User Journeys

### Primary Customer Journey: Browse and Purchase

**Journey Goal:** Customer discovers products, adds to cart, completes purchase, receives confirmation

**Flow:**
1. **Entry:** Customer lands on homepage or `/shop` via direct link, search, or social media
2. **Browse:** Customer views product catalog, sees photos, names, prices, descriptions
3. **Select:** Customer clicks "Add to Cart" on desired products
4. **Review Cart:** Customer navigates to `/cart`, reviews items, adjusts quantities
5. **Checkout:** Customer clicks "Proceed to Checkout," enters contact info, selects shipping or pickup
6. **Calculate Shipping:** System calculates shipping cost (if applicable) and shows total
7. **Payment:** Customer enters payment details via Stripe and submits order
8. **Confirmation:** Customer sees success page and receives email confirmation
9. **Exit:** Customer receives order via shipping or pickup

**Key Decision Points:**
- Shipping vs. Local Pickup (affects address collection and cost calculation)
- Continue shopping vs. Checkout (from cart page)
- Retry payment vs. Abandon (on payment failure)

**Edge Cases:**
- Out of stock products → Hidden or disabled from catalog
- Invalid address → Show error, prevent checkout
- Payment failure → Allow retry with clear error message
- Empty cart → Show friendly message, encourage browsing

---

### Admin Journey: Manage Products

**Journey Goal:** Admin adds new products or updates existing inventory

**Flow:**
1. **Entry:** Admin navigates to `/admin/login`
2. **Authenticate:** Admin enters credentials and logs in
3. **Dashboard:** Admin sees overview and clicks "Manage Products"
4. **Product List:** Admin views all products
5. **Action:** Admin clicks "Add New Product" or "Edit" on existing product
6. **Form:** Admin enters/updates product details (name, description, price, image, inventory)
7. **Save:** Admin submits form, product saved to database
8. **Confirmation:** Admin sees updated product list with success message

---

### Admin Journey: Fulfill Orders

**Journey Goal:** Admin reviews orders and marks them as fulfilled

**Flow:**
1. **Entry:** Admin logs in and navigates to "Manage Orders"
2. **Order List:** Admin sees pending orders sorted by date
3. **Select:** Admin clicks "View Details" on an order
4. **Review:** Admin sees customer info, shipping/pickup details, order items
5. **Prepare:** Admin prepares order for shipping or pickup (offline action)
6. **Mark Fulfilled:** Admin clicks "Mark as Fulfilled"
7. **Confirmation:** Order status updates, admin sees updated order list

---

## Epic List

**Epic 1: Foundation & Core Infrastructure**  
*Goal:* Establish the Next.js project foundation with database, authentication, deployment pipeline, and a basic "coming soon" or health-check page to verify the full stack is operational.

**Epic 2: Product Catalog & Shopping Experience**  
*Goal:* Enable customers to browse products, view details, add items to cart, and manage their cart—delivering the core shopping experience.

**Epic 3: Checkout & Payment Processing**  
*Goal:* Allow customers to complete purchases by providing their information, selecting fulfillment method, calculating shipping costs, processing payments via Stripe, and receiving order confirmations.

**Epic 4: Admin Product & Order Management**  
*Goal:* Provide admin users with tools to manage product inventory (CRUD operations) and fulfill orders efficiently, ensuring operational control of the business.

**Epic 5: Brand Story & Customer Trust**  
*Goal:* Communicate the 4050 brand story, heritage apple differentiation, charitable mission, and essential policies to build customer trust and connection.

---

## Epic 1: Foundation & Core Infrastructure

**Epic Goal:**  
Establish the foundational Next.js application with TypeScript, Tailwind CSS, database connectivity (PostgreSQL + Prisma), admin authentication (NextAuth.js), deployment to Vercel, and a simple homepage or health-check route. This epic ensures the full stack is operational, code is version-controlled, and the team can deploy changes confidently before building customer-facing features.

### Story 1.1: Initialize Next.js Project with TypeScript and Tailwind CSS

As a **developer**,  
I want **to set up a new Next.js 14+ project with TypeScript and Tailwind CSS configured**,  
so that **we have a modern, type-safe frontend foundation ready for feature development**.

#### Acceptance Criteria

1. Next.js 14+ project created using App Router (not Pages Router)
2. TypeScript configured with strict mode enabled
3. Tailwind CSS installed and configured
4. Project runs locally with `npm run dev` and displays the default Next.js welcome page
5. Git repository initialized with initial commit and `.gitignore` configured
6. README includes setup instructions for local development

---

### Story 1.2: Set Up PostgreSQL Database and Prisma ORM

As a **developer**,  
I want **to configure PostgreSQL database and Prisma ORM with initial schema**,  
so that **the application can persist data and I can interact with the database using type-safe queries**.

#### Acceptance Criteria

1. PostgreSQL database provisioned (local for dev, Railway/Render/Vercel Postgres for production)
2. Prisma installed and initialized in the project
3. Database connection string configured via environment variables (`.env.local`)
4. Initial Prisma schema created with at least a `User` model (for admin authentication)
5. Prisma migration generated and applied successfully
6. Prisma Client generated and can be imported in API routes
7. Test database connection by running a simple query (e.g., `prisma db seed` or API route test)

---

### Story 1.3: Implement Admin Authentication with NextAuth.js

As an **admin user**,  
I want **to log in to the admin area using email and password**,  
so that **I can securely access admin-only features like product and order management**.

#### Acceptance Criteria

1. NextAuth.js installed and configured in the Next.js project
2. Email/password credentials provider configured (not using OAuth for MVP)
3. Admin user credentials stored securely (hashed password) in database
4. Login page created at `/admin/login` with email and password fields
5. Successful login redirects to `/admin/dashboard` and establishes authenticated session
6. Failed login shows appropriate error message
7. Protected admin routes check authentication status and redirect to login if not authenticated
8. Logout functionality available on admin pages
9. Initial admin user can be seeded via script or manual database insert

---

### Story 1.4: Deploy Application to Vercel with Environment Variables

As a **developer**,  
I want **to deploy the Next.js application to Vercel with proper environment configuration**,  
so that **the application is accessible online, supports continuous deployment, and can connect to production database and services**.

#### Acceptance Criteria

1. Vercel account created and project connected to Git repository
2. Application deploys successfully to Vercel on push to `main` branch
3. Environment variables configured in Vercel dashboard (database URL, NextAuth secret, etc.)
4. Production deployment accessible via Vercel-provided URL (custom domain not required yet)
5. Database migrations run automatically on deployment (or clear process documented)
6. Health-check or basic homepage loads successfully in production
7. Admin login works in production environment

---

### Story 1.5: Create Basic Homepage and Navigation Structure

As a **customer**,  
I want **to visit the homepage and see a welcoming introduction to 4050**,  
so that **I understand what the site offers and can navigate to key sections**.

#### Acceptance Criteria

1. Homepage created at root path (`/`) with Next.js App Router
2. Homepage includes:
   - Site header with logo/name "4050" and navigation links (Home, Shop, About, Contact)
   - Hero section with tagline or brief introduction
   - Call-to-action button (e.g., "Shop Now") linking to `/shop` (can be empty page for now)
   - Footer with copyright and placeholder links
3. Navigation is responsive (mobile hamburger menu or simple mobile-friendly nav)
4. Tailwind CSS styling applied for clean, modern appearance
5. Page is accessible via keyboard navigation and screen readers
6. Page loads in under 3 seconds

---

## Epic 2: Product Catalog & Shopping Experience

**Epic Goal:**  
Enable customers to browse available products, view product details, add items to their shopping cart, and manage cart contents. This epic delivers the core shopping experience that allows customers to discover and select products before proceeding to checkout.

### Story 2.1: Create Product Database Schema and Admin Seed Data

As a **developer**,  
I want **to define the Product model in Prisma and seed initial product data**,  
so that **the application has product data to display in the catalog**.

#### Acceptance Criteria

1. `Product` model added to Prisma schema with fields:
   - `id` (UUID or integer, primary key)
   - `name` (string)
   - `description` (text)
   - `ingredients` (text, optional)
   - `price` (decimal/float)
   - `imageUrl` (string)
   - `inventoryQuantity` (integer)
   - `isAvailable` (boolean)
   - `createdAt`, `updatedAt` (timestamps)
2. Prisma migration generated and applied
3. Seed script created to insert at least 4 sample apple products with realistic data:
   - Example 1: "Heritage Apple Butter" - smooth, spreadable, 8oz jar, ~$8-12
   - Example 2: "Homemade Applesauce" - chunky or smooth, 16oz jar, ~$6-10
   - Example 3: "Spiced Apple Jam" - with cinnamon and cloves, 12oz jar, ~$9-13
   - Example 4: "Apple Jelly" - clear, sweet, 8oz jar, ~$7-11
4. Each seed product includes:
   - Descriptive name
   - 2-3 sentence description highlighting heritage apples and handmade quality
   - Ingredient list (apples, sugar, spices, lemon juice, etc.)
   - Realistic price ($6-13 range)
   - Placeholder image URL (can use https://placehold.co/400x400 or similar for development)
   - Inventory quantity (10-50 units)
   - `isAvailable` set to `true`
5. Seed script can be run with `npm run seed` or similar command
6. Seed data demonstrates variety in sizes, styles, and price points

---

### Story 2.2: Build Product Catalog Page (Shop Page)

As a **customer**,  
I want **to view all available products in a grid layout with photos, names, and prices**,  
so that **I can browse what's available and decide what to purchase**.

#### Acceptance Criteria

1. Product catalog page created at `/shop` route
2. Page fetches all available products from the database via API route or Server Component
3. Products displayed in responsive grid (e.g., 2 columns mobile, 3-4 columns desktop)
4. Each product card shows:
   - Product image (optimized with Next.js Image)
   - Product name
   - Price formatted as currency
   - "Add to Cart" button
5. Products marked as unavailable or sold out are either hidden or visually disabled
6. Page loads quickly (<3 seconds) even with multiple product images
7. Page is accessible (keyboard navigation, alt text on images, proper headings)

---

### Story 2.3: Implement Add to Cart Functionality

As a **customer**,  
I want **to click "Add to Cart" on a product and have it added to my shopping cart**,  
so that **I can collect items I want to purchase**.

#### Acceptance Criteria

1. Shopping cart state managed using React Context or Zustand
2. Clicking "Add to Cart" button adds product to cart state with quantity of 1
3. If product already in cart, increment quantity instead of duplicating
4. Visual feedback when item added (e.g., button changes to "Added!" briefly, or cart icon shows updated count)
5. Cart count indicator in header updates immediately
6. Cart state persists in browser session (e.g., using localStorage)
7. Cannot add sold-out products to cart (button disabled or shows error)

---

### Story 2.4: Build Shopping Cart Page

As a **customer**,  
I want **to view my shopping cart, see all items I've added, and update quantities or remove items**,  
so that **I can review and adjust my order before checkout**.

#### Acceptance Criteria

1. Shopping cart page created at `/cart` route
2. Page displays all items in cart with:
   - Product image and name
   - Unit price
   - Quantity selector (input or +/- buttons)
   - Line total (price × quantity)
   - "Remove" button for each item
3. Cart subtotal calculated and displayed at bottom
4. Updating quantity immediately recalculates line total and subtotal
5. Removing item removes it from cart and updates subtotal
6. Empty cart shows friendly message (e.g., "Your cart is empty. Start shopping!")
7. "Proceed to Checkout" button navigates to checkout page
8. Cart is responsive and accessible

---

### Story 2.5: Add Product Detail Page (Optional Enhancement)

As a **customer**,  
I want **to click on a product to see more detailed information**,  
so that **I can learn about ingredients, story, and make an informed purchase decision**.

#### Acceptance Criteria

1. Product detail page created at `/shop/[productId]` route
2. Clicking product name or image in catalog navigates to detail page
3. Detail page displays:
   - Large product image
   - Product name and price
   - Full description
   - Ingredients list
   - "Add to Cart" button with quantity selector
4. Add to Cart functionality works same as on catalog page
5. Breadcrumb or back button returns to catalog
6. Page is accessible and mobile-responsive

*(Note: This story is optional—if time is tight, product details can be shown on hover or modal instead)*

---

## Epic 3: Checkout & Payment Processing

**Epic Goal:**  
Allow customers to complete their purchase by providing contact and fulfillment information, selecting between shipping and local pickup, calculating shipping costs when applicable, processing payment securely via Stripe, and receiving order confirmation. This epic delivers the critical transaction flow that converts browsers into buyers.

### Story 3.1: Create Order Database Schema

As a **developer**,  
I want **to define the Order and OrderItem models in Prisma**,  
so that **the application can persist customer orders and order details**.

#### Acceptance Criteria

1. `Order` model added to Prisma schema with fields:
   - `id` (UUID or integer, primary key)
   - `customerName` (string)
   - `customerEmail` (string)
   - `customerPhone` (string)
   - `shippingAddress` (JSON or separate fields: street, city, state, zip)
   - `fulfillmentMethod` (enum: "SHIPPING" or "PICKUP")
   - `shippingCost` (decimal, nullable)
   - `subtotal` (decimal)
   - `total` (decimal)
   - `paymentStatus` (enum: "PENDING", "PAID", "FAILED")
   - `fulfillmentStatus` (enum: "PENDING", "FULFILLED")
   - `stripePaymentIntentId` (string, nullable)
   - `createdAt`, `updatedAt` (timestamps)
2. `OrderItem` model added with fields:
   - `id` (primary key)
   - `orderId` (foreign key to Order)
   - `productId` (foreign key to Product)
   - `productName` (string, snapshot of name at time of order)
   - `quantity` (integer)
   - `unitPrice` (decimal, snapshot of price at time of order)
   - `lineTotal` (decimal)
3. Prisma migration generated and applied
4. Relationships configured (Order has many OrderItems, OrderItem belongs to Order and Product)

---

### Story 3.2: Build Checkout Page with Customer Information Form

As a **customer**,  
I want **to enter my contact information and choose between shipping and local pickup**,  
so that **I can specify how I'll receive my order**.

#### Acceptance Criteria

1. Checkout page created at `/checkout` route
2. Checkout page accessible only if cart has items (redirect to cart if empty)
3. Form collects:
   - Full name (required)
   - Email address (required, validated format)
   - Phone number (required)
   - Fulfillment method: radio buttons for "Shipping" or "Local Pickup"
4. If "Shipping" selected, show address fields:
   - Street address (required)
   - City (required)
   - State (required, dropdown or input)
   - ZIP code (required)
5. If "Local Pickup" selected, hide address fields and show pickup instructions
6. Form validation with clear error messages for missing or invalid fields
7. Order summary displayed on page showing cart items, subtotal, and placeholder for shipping cost
8. "Continue to Payment" button disabled until form is valid
9. Form is accessible and mobile-responsive

---

### Story 3.3: Integrate Shipping Cost Calculator

As a **customer**,  
I want **to see the shipping cost calculated in real-time based on my address**,  
so that **I know the total cost before entering payment information**.

#### Acceptance Criteria

1. Shipping rate API integrated (EasyPost, USPS API, or ShipStation)
2. When customer enters valid address and fulfillment method is "Shipping," API called to calculate shipping cost
3. Shipping cost displayed in order summary
4. Total calculated as: subtotal + shipping cost
5. If shipping cost cannot be calculated, show error message and prevent checkout
6. Shipping cost is $0.00 when "Local Pickup" is selected
7. Shipping cost updates automatically if customer changes address
8. Reasonable timeout and error handling for shipping API failures

---

### Story 3.4: Integrate Stripe Payment Processing

As a **customer**,  
I want **to securely enter my payment information and complete my purchase**,  
so that **I can pay for my order and receive confirmation**.

#### Acceptance Criteria

1. Stripe SDK integrated into the application
2. Stripe Checkout or Stripe Elements embedded on checkout page or payment page
3. Clicking "Proceed to Payment" or "Pay Now" initiates Stripe payment flow
4. Customer enters credit/debit card information in Stripe-hosted UI
5. Payment Intent created on backend with order total (subtotal + shipping)
6. On successful payment:
   - Order record created in database with all customer and order details
   - OrderItems created for each cart item
   - Inventory quantities decremented for purchased products
   - Payment status set to "PAID"
7. On payment failure:
   - Customer shown error message
   - Order not created (or marked as "FAILED")
   - Customer can retry payment
8. Payment processing uses Stripe test mode during development
9. Stripe webhook configured to handle payment confirmation (or polling if webhook not feasible)

---

### Story 3.5: Send Order Confirmation Email

As a **customer**,  
I want **to receive an email confirmation after placing my order**,  
so that **I have a record of my purchase and know the next steps**.

#### Acceptance Criteria

1. Email service integrated (Resend, SendGrid, or similar)
2. On successful order creation, email sent to customer's email address
3. Email includes:
   - Order number or ID
   - Customer name
   - Order summary (list of items, quantities, prices)
   - Subtotal, shipping cost, and total
   - Fulfillment method (shipping or pickup)
   - If shipping: estimated delivery time and tracking info (if available)
   - If pickup: pickup location, hours, and instructions
   - Contact information for questions
4. Email is HTML formatted, mobile-responsive, and accessible
5. Email sent asynchronously to avoid delaying order confirmation page
6. Email failures logged but do not prevent order from completing

---

### Story 3.6: Display Order Confirmation Page

As a **customer**,  
I want **to see a confirmation page immediately after placing my order**,  
so that **I know my purchase was successful and what to expect next**.

#### Acceptance Criteria

1. Order confirmation page created at `/order/confirmation` or `/checkout/success`
2. After successful payment, customer redirected to confirmation page
3. Confirmation page displays:
   - "Thank you for your order!" message
   - Order number or ID
   - Order summary (items, quantities, prices, totals)
   - Fulfillment method and details (shipping address or pickup instructions)
   - Estimated delivery or pickup date
   - "You will receive a confirmation email at [email]" message
4. Cart is cleared after successful order
5. Page includes call-to-action (e.g., "Continue Shopping" link back to catalog)
6. Page is accessible and mobile-responsive

---

## Epic 4: Admin Product & Order Management

**Epic Goal:**  
Provide admin users with a dashboard and tools to manage products (create, edit, delete, update inventory) and fulfill orders (view orders, mark as fulfilled). This epic ensures the business operator can efficiently control inventory and complete the order fulfillment cycle.

### Story 4.1: Build Admin Dashboard Overview

As an **admin user**,  
I want **to see a dashboard with key metrics and recent activity**,  
so that **I can quickly assess business status and prioritize tasks**.

#### Acceptance Criteria

1. Admin dashboard page created at `/admin/dashboard` (protected by authentication)
2. Dashboard displays:
   - Total orders today/this week
   - Total revenue today/this week
   - Number of pending orders (not yet fulfilled)
   - Low inventory alerts (products with quantity < 5 or similar threshold)
   - List of most recent 5-10 orders with basic info (order number, customer name, status)
3. Dashboard includes navigation links to "Manage Products" and "Manage Orders"
4. Dashboard is responsive and accessible
5. Dashboard loads quickly (<3 seconds)

---

### Story 4.2: Build Admin Product Management Page

As an **admin user**,  
I want **to view all products, edit product details, and add new products**,  
so that **I can keep the product catalog accurate and up-to-date**.

#### Acceptance Criteria

1. Admin products page created at `/admin/products`
2. Page displays all products in a table or grid with columns:
   - Product image (thumbnail)
   - Product name
   - Price
   - Inventory quantity
   - Availability status (Available / Sold Out)
   - Actions: "Edit" and "Delete" buttons
3. "Add New Product" button at top of page
4. Clicking "Edit" navigates to product edit form (Story 4.3)
5. Clicking "Delete" prompts confirmation, then deletes product from database
6. Products can be sorted or filtered (optional enhancement)
7. Page is accessible and responsive

---

### Story 4.3: Build Product Create/Edit Form

As an **admin user**,  
I want **to create a new product or edit an existing product's details**,  
so that **I can add new offerings or update prices, descriptions, and inventory**.

#### Acceptance Criteria

1. Product create page at `/admin/products/new`
2. Product edit page at `/admin/products/[productId]/edit`
3. Form includes fields:
   - Product name (required)
   - Description (required, textarea)
   - Ingredients (optional, textarea)
   - Price (required, number input)
   - Inventory quantity (required, number input)
   - Availability status (checkbox or toggle: "Available for purchase")
   - Product image upload (file input or URL field)
4. Form validation with error messages for invalid input
5. Submitting form saves product to database
6. On success, redirect to products list with success message
7. Image upload saves file to Vercel Blob, Cloudinary, or similar (or stores URL if providing image URL directly)
8. Form is accessible and responsive

---

### Story 4.4: Build Admin Order Management Page

As an **admin user**,  
I want **to view all orders, see order details, and mark orders as fulfilled**,  
so that **I can process and ship/prepare orders efficiently**.

#### Acceptance Criteria

1. Admin orders page created at `/admin/orders`
2. Page displays all orders in a table with columns:
   - Order number/ID
   - Customer name
   - Customer email
   - Fulfillment method (Shipping / Pickup)
   - Total
   - Payment status (Paid / Pending / Failed)
   - Fulfillment status (Pending / Fulfilled)
   - Order date
   - Actions: "View Details" and "Mark as Fulfilled" buttons
3. Clicking "View Details" navigates to order detail page (Story 4.5) or opens modal
4. Clicking "Mark as Fulfilled" updates order status to "Fulfilled" and shows confirmation
5. Orders can be filtered by fulfillment status (Pending / Fulfilled) or payment status
6. Most recent orders displayed first (sorted by creation date descending)
7. Page is accessible and responsive

---

### Story 4.5: Build Order Detail View

As an **admin user**,  
I want **to view detailed information about a specific order**,  
so that **I can see exactly what the customer ordered, where to ship it, and any special instructions**.

#### Acceptance Criteria

1. Order detail page created at `/admin/orders/[orderId]` or displayed in modal
2. Order detail displays:
   - Order number/ID and order date
   - Customer information (name, email, phone)
   - Fulfillment method
   - If shipping: full shipping address
   - If pickup: pickup selected, show pickup instructions
   - Order items table (product name, quantity, unit price, line total)
   - Subtotal, shipping cost, and total
   - Payment status and Stripe Payment Intent ID
   - Fulfillment status
3. "Mark as Fulfilled" button (if not already fulfilled)
4. "Print Order" or "Download Invoice" option (optional enhancement)
5. Breadcrumb or back button returns to orders list
6. Page is accessible and responsive

---

## Epic 5: Brand Story & Customer Trust

**Epic Goal:**  
Communicate the 4050 brand story, heritage apple differentiation, and charitable mission to build customer trust and emotional connection. Provide essential information pages (About, Contact, FAQ, Privacy Policy, Terms) that establish credibility and answer common customer questions.

### Story 5.1: Create About Page

As a **customer**,  
I want **to learn about 4050, the heritage apples, and the charitable mission**,  
so that **I understand what makes these products special and feel good about my purchase**.

#### Acceptance Criteria

1. About page created at `/about` route
2. Page includes:
   - Headline and introduction to 4050
   - Story of heritage apples grown on-site
   - Explanation of "made with love" and handmade process
   - Description of charitable mission (profits support food banks, schools, community centers)
   - Photos of apples, production process, or farm (if available)
   - Personal touch (founder story, family tradition, years of gifting)
3. Content is warm, authentic, and concise (1-2 screens of scrolling)
4. Page is accessible and responsive
5. Navigation link to About page in header

---

### Story 5.2: Create Contact/FAQ Page

As a **customer**,  
I want **to find answers to common questions and know how to contact 4050**,  
so that **I can get information about shipping, pickup, products, and support**.

#### Acceptance Criteria

1. Contact/FAQ page created at `/contact` or `/faq` route
2. Page includes:
   - Contact email address or contact form
   - Phone number (if applicable)
   - Local pickup location address and hours
   - Frequently asked questions, such as:
     - What are your shipping options and costs?
     - What is your return/refund policy?
     - How do I pick up my order locally?
     - What are heritage apples?
     - Which charities do you support?
     - Do you offer wholesale or bulk orders? (Answer: Not at this time for MVP)
3. Contact form (optional for MVP) includes name, email, message fields
4. Form submissions send email to admin or log to database for review
5. Page is accessible and responsive
6. Navigation link to Contact page in header or footer

---

### Story 5.3: Create Privacy Policy and Terms of Service Pages

As a **customer**,  
I want **to review the privacy policy and terms of service**,  
so that **I understand how my data is used and what terms govern my purchase**.

#### Acceptance Criteria

1. Privacy Policy page created at `/privacy` route
2. Terms of Service page created at `/terms` route
3. Privacy Policy includes:
   - What data is collected (name, email, address, payment info)
   - How data is used (order fulfillment, email confirmation)
   - How data is protected (Stripe handles payment data, HTTPS, secure storage)
   - Third-party services (Stripe, email provider, hosting)
   - Contact information for privacy questions
4. Terms of Service includes:
   - Purchase terms and conditions
   - Refund/return policy
   - Disclaimer for food products (e.g., "made in a home kitchen," allergen warnings)
   - Limitation of liability
5. Both pages are accessible from footer links on all pages
6. Pages are accessible and responsive
7. Legal language is clear and appropriate (may use template or generator for MVP, with plan to review with legal counsel)

---

### Story 5.4: Add Footer with Social Impact Messaging

As a **customer**,  
I want **to see a reminder of the charitable mission on every page**,  
so that **I feel connected to the positive impact of my purchase**.

#### Acceptance Criteria

1. Site footer includes a section highlighting charitable mission
2. Footer message examples:
   - "Profits support local food banks, schools, and community centers."
   - "Made with heritage apples, grown with love, shared with purpose."
3. Footer includes links to:
   - About
   - Contact
   - Privacy Policy
   - Terms of Service
   - Social media (if applicable for MVP)
4. Footer displays on all customer-facing pages
5. Footer is responsive and accessible
6. Footer design is visually distinct but cohesive with overall site design

---

### Story 5.5: Optimize SEO and Site Metadata

As a **business owner**,  
I want **the site to be discoverable via search engines and share nicely on social media**,  
so that **customers can find 4050 when searching for artisan apple products**.

#### Acceptance Criteria

1. All pages have descriptive, unique `<title>` tags (e.g., "Shop Heritage Apple Products | 4050")
2. All pages have meta descriptions summarizing content (for search results)
3. Open Graph (OG) tags added for social media sharing (og:title, og:description, og:image)
4. Favicon created and configured
5. Sitemap.xml generated and accessible at `/sitemap.xml`
6. Robots.txt configured to allow search engine crawling
7. Structured data (schema.org) added for products (optional enhancement, improves Google Shopping visibility)
8. Google Analytics or Vercel Analytics integrated for traffic tracking (optional)
9. SEO best practices followed: semantic HTML, descriptive alt text, fast load times, mobile-friendly

---

## Checklist Results Report

### Executive Summary

**Overall PRD Completeness:** 92%  
**MVP Scope Appropriateness:** Just Right  
**Readiness for Architecture Phase:** ✅ Ready  

**Key Findings:**
- All critical elements present and sufficient for architect to proceed
- 20 functional requirements and 14 non-functional requirements clearly defined
- 5 epics with 25 well-structured user stories
- Comprehensive technical guidance and constraints documented
- MVP scope appropriately minimal while remaining viable

**Minor Gaps Identified:**
- User journey flow diagrams to be created by UX Expert (not a blocker)
- Some business details pending (pricing, specific products) - documented in open-questions.md
- Seed data could be more specific (addressed in Story 2.1 update)

### Category Analysis

| Category                         | Status   | Critical Issues                                      |
| -------------------------------- | -------- | ---------------------------------------------------- |
| 1. Problem Definition & Context  | **PASS** | None - Clear problem statement, users, and metrics   |
| 2. MVP Scope Definition          | **PASS** | None - Well-defined scope boundaries and rationale   |
| 3. User Experience Requirements  | PARTIAL  | User flows not explicitly documented (UX Expert task) |
| 4. Functional Requirements       | **PASS** | None - 20 clear, testable functional requirements    |
| 5. Non-Functional Requirements   | **PASS** | None - 14 comprehensive NFRs covering key areas      |
| 6. Epic & Story Structure        | **PASS** | None - 5 epics, 25 stories, logical sequencing      |
| 7. Technical Guidance            | **PASS** | None - Comprehensive technical assumptions section   |
| 8. Cross-Functional Requirements | **PASS** | None - Data models, integrations, operations covered |
| 9. Clarity & Communication       | **PASS** | None - Well-organized, clear language throughout     |

### Issues by Priority

**BLOCKERS:** None

**HIGH Priority:**
- User journey flows to be created by UX Expert based on stories

**MEDIUM Priority:**
- Open business questions documented in `docs/open-questions.md` (pricing, specific products, licensing)
- These are operational decisions that don't block technical architecture development

**LOW Priority:**
- Competitive analysis for future marketing/pricing strategy

### MVP Scope Assessment

**Well-Scoped Core Features:**
- ✅ Browse → Cart → Checkout → Payment → Confirmation flow
- ✅ Admin product and order management essentials
- ✅ Single product category (apple products)
- ✅ Guest checkout only (no user accounts)
- ✅ Appropriate exclusions (reviews, subscriptions, international shipping)

**Timeline Assessment:**
- Estimated: 11-17 weeks development + testing
- Target: 3-4 months
- **Status:** ✅ Realistic and achievable

### Technical Readiness

**Strengths:**
- Complete technology stack defined (Next.js, TypeScript, PostgreSQL, Stripe)
- Clear service architecture (monorepo with serverless functions)
- Third-party integrations identified with rationale
- Security and performance requirements documented
- Testing strategy defined

**Technical Risks Identified & Mitigated:**
- Shipping API integration → Use EasyPost or USPS API
- Payment security → Handled by Stripe (PCI compliant)
- Image storage → Vercel Blob or Cloudinary
- Email delivery → Resend or SendGrid

### Final Decision

**✅ READY FOR ARCHITECT**

The PRD is comprehensive, well-structured, and provides clear direction for technical architecture design. All functional and non-functional requirements are testable and implementable. MVP scope is appropriately minimal. Story breakdown is logical and sized for AI agent execution.

**Confidence Level:** High (92% completeness)

**Validation Date:** November 28, 2025  
**Validated By:** John (PM)

---

## Next Steps

### UX Expert Prompt

Review the PRD above, focusing on the User Interface Design Goals section. Create a design system and high-fidelity wireframes for the core screens listed, ensuring the design aligns with the brand vision (warm, authentic, artisan) and accessibility requirements (WCAG 2.1 AA). Deliver design specs and assets ready for developer implementation.

### Architect Prompt

Review this PRD and create a detailed technical architecture document. Define the database schema (expand on Prisma models), API route specifications, frontend component structure, integration patterns for Stripe and shipping APIs, deployment architecture on Vercel, and any additional technical details needed for development. Ensure the architecture supports the functional and non-functional requirements while maintaining simplicity for a solo operator. Document all technical decisions, trade-offs, and implementation guidelines.

---

*This PRD is a living document. Update as requirements evolve, new insights emerge, or scope adjustments are made.*

