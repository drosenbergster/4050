# 4050 Fullstack Architecture Document

**Version:** 1.0  
**Date:** November 28, 2025  
**Status:** Draft  
**Project:** 4050 E-commerce Platform

---

## Introduction

This document outlines the complete fullstack architecture for 4050, including backend systems, frontend implementation, and their integration. It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack.

This unified approach combines what would traditionally be separate backend and frontend architecture documents, streamlining the development process for modern fullstack applications where these concerns are increasingly intertwined.

### Starter Template or Existing Project

**N/A - Greenfield project**

Starting from scratch with Next.js 14+ using the App Router. This provides a modern, opinionated fullstack framework that eliminates the need for separate frontend/backend templates and reduces architectural decisions.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-11-28 | 1.0 | Initial architecture document created from PRD v1.1 | Winston (Architect) |

---

## High Level Architecture

### Technical Summary

4050 uses a **modern Jamstack architecture** with Next.js 14+ (App Router) deployed to Vercel, providing both server-rendered React frontend and serverless API routes in a unified monorepo. The application leverages **PostgreSQL with Prisma ORM** for type-safe data access, **Stripe** for PCI-compliant payment processing, and **EasyPost** for real-time shipping calculations. The architecture prioritizes simplicity and cost-effectiveness for solo operation while maintaining professional standards for security (HTTPS, auth, rate limiting), performance (<3s page loads, optimized images), and accessibility (WCAG 2.1 AA). All infrastructure runs on Vercel's global edge network with automatic scaling, zero-downtime deployments, and minimal operational overhead—perfectly aligned with the bootstrap budget and 3-4 month launch timeline.

### Platform and Infrastructure Choice

**Platform:** Vercel  
**Key Services:**
- **Compute:** Vercel Edge Network (serverless Next.js API routes)
- **Database:** Railway PostgreSQL (free tier supports MVP traffic)
- **Storage:** Vercel Blob (product images)
- **Email:** Resend (10k emails/month free tier)
- **Payments:** Stripe (no monthly fee, pay per transaction)
- **Shipping:** EasyPost (pay per API call)
- **Monitoring:** Vercel Analytics + Sentry (error tracking)

**Deployment Host and Regions:** Global edge deployment via Vercel CDN (automatic multi-region)

**Rationale:** Vercel + Railway provides the optimal combination for Next.js projects—zero-config deployment, automatic scaling, generous free tiers, and excellent developer experience. This stack minimizes hosting costs (<$25/month projected) while supporting 100+ concurrent users and maintaining 99% uptime.

### Repository Structure

**Structure:** Monorepo (single repository)  
**Monorepo Tool:** Next.js built-in (no additional tooling needed)  
**Package Organization:** Flat structure with shared types in `/lib` directory

**Rationale:** Next.js App Router provides sufficient organization for this project's scope. Using external monorepo tools (Turborepo, Nx) would add unnecessary complexity. Shared code (TypeScript interfaces, utilities, constants) will live in `/lib` and be imported throughout the application.

### High Level Architecture Diagram

```mermaid
graph TB
    User[User Browser]
    Vercel[Vercel Edge Network]
    NextJS[Next.js Application]
    APIRoutes[API Routes - Serverless]
    DB[(Railway PostgreSQL)]
    Blob[Vercel Blob Storage]
    Stripe[Stripe API]
    EasyPost[EasyPost API]
    Resend[Resend Email API]
    
    User -->|HTTPS| Vercel
    Vercel -->|Static Pages| NextJS
    Vercel -->|API Calls| APIRoutes
    NextJS -->|SSR Data| APIRoutes
    APIRoutes -->|Prisma ORM| DB
    APIRoutes -->|Image Uploads| Blob
    APIRoutes -->|Process Payments| Stripe
    APIRoutes -->|Calculate Shipping| EasyPost
    APIRoutes -->|Send Emails| Resend
    NextJS -->|Fetch Images| Blob
```

### Architectural Patterns

- **Jamstack Architecture:** Static site generation + serverless APIs for optimal performance and scalability - _Rationale:_ Provides fast page loads, SEO benefits, and automatic scaling without managing servers

- **Component-Based UI:** Reusable React Server and Client Components with TypeScript - _Rationale:_ Maintainability, type safety, and clear separation between server and client rendering

- **Server Actions Pattern:** Next.js Server Actions for form submissions and mutations - _Rationale:_ Eliminates boilerplate API routes for simple CRUD operations, reduces client-side JavaScript

- **Repository Pattern:** Prisma ORM as data access abstraction layer - _Rationale:_ Type-safe database queries, easy migrations, and testable data access logic

- **API Route Pattern:** RESTful serverless functions for complex operations - _Rationale:_ Clear HTTP semantics, easy integration with external services (Stripe, EasyPost)

- **Edge-First Rendering:** Server-side rendering at the edge for dynamic content - _Rationale:_ Fast response times globally, fresh data without client-side loading spinners

---

## Tech Stack

### Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|-----------|---------|---------|-----------|
| Frontend Language | TypeScript | 5.3+ | Type-safe React development | Prevents runtime errors, improves IDE experience, self-documenting code |
| Frontend Framework | Next.js (App Router) | 14.0+ | Full-stack React framework | Unified frontend/backend, optimized builds, excellent DX, Vercel-native |
| UI Component Library | Tailwind CSS + Headless UI | Tailwind 3.4+, Headless UI 2.0+ | Utility-first styling + accessible components | Rapid UI development, small bundle size, WCAG-compliant primitives |
| State Management | React Context + localStorage | React 18+ | Cart state and client-side persistence | Simple, no additional dependencies, sufficient for MVP scope |
| Backend Language | TypeScript | 5.3+ | Type-safe server-side logic | Shared types between frontend/backend, consistent tooling |
| Backend Framework | Next.js API Routes | 14.0+ | Serverless API endpoints | Zero config, automatic deployment, shared middleware with frontend |
| API Style | REST (Next.js API Routes) | - | HTTP-based API | Simple, widely understood, suitable for CRUD operations |
| Database | PostgreSQL | 15+ | Relational data storage | ACID compliance, robust for e-commerce, excellent Prisma support |
| ORM | Prisma | 5.7+ | Type-safe database access | Auto-generated TypeScript types, migration management, intuitive queries |
| Cache | Vercel Data Cache | Built-in | HTTP caching and ISR | No additional service needed, automatic cache invalidation |
| File Storage | Vercel Blob | Latest | Product image storage | Seamless Vercel integration, CDN distribution, simple API |
| Authentication | NextAuth.js v5 | 5.0-beta+ | Admin authentication | Well-maintained, flexible, supports credentials provider |
| Frontend Testing | Jest + React Testing Library | Jest 29+, RTL 14+ | Component and unit tests | Industry standard, excellent React support |
| Backend Testing | Jest + Supertest | Jest 29+, Supertest 6+ | API integration tests | API route testing, database mocking |
| E2E Testing | Manual (MVP) | - | Critical path testing | Avoids Playwright/Cypress complexity for MVP |
| Build Tool | Next.js built-in | 14.0+ | TypeScript compilation, bundling | Zero config, optimized for production |
| Bundler | Turbopack | Built-in Next 14+ | Fast dev server and builds | Faster than Webpack, built into Next.js 14 |
| IaC Tool | N/A | - | No infrastructure as code | Vercel + Railway use dashboard config for MVP simplicity |
| CI/CD | GitHub Actions + Vercel | - | Automated testing and deployment | Free for public repos, native Vercel integration |
| Monitoring | Vercel Analytics + Sentry | Vercel built-in, Sentry 7+ | Performance and error tracking | Basic metrics (Vercel) + detailed errors (Sentry free tier) |
| Logging | Vercel Logs + Console | Built-in | Request logs and debugging | Sufficient for MVP, no additional cost |
| CSS Framework | Tailwind CSS | 3.4+ | Utility-first styling | Rapid development, tree-shaking, mobile-first |

---

## Data Models

### User (Admin)

**Purpose:** Represents admin users who manage products and fulfill orders. Only admins can log in; customers checkout as guests.

**Key Attributes:**
- `id`: string (UUID) - Unique identifier
- `email`: string - Admin email address (unique)
- `passwordHash`: string - Bcrypt hashed password
- `name`: string - Admin display name
- `createdAt`: DateTime - Account creation timestamp
- `updatedAt`: DateTime - Last update timestamp

#### TypeScript Interface

```typescript
interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Public-facing type (excludes password)
interface UserProfile {
  id: string;
  email: string;
  name: string;
}
```

#### Relationships
- Admin user manages many products (implicit)
- Admin user fulfills many orders (implicit)

---

### Product

**Purpose:** Represents apple products available for purchase (applesauce, apple butter, jams, jellies).

**Key Attributes:**
- `id`: string (UUID) - Unique identifier
- `name`: string - Product name
- `description`: string - Detailed product description
- `ingredients`: string (optional) - Ingredient list
- `price`: Decimal (stored as integer cents) - Product price in USD cents
- `imageUrl`: string - URL to product image in Vercel Blob
- `inventoryQuantity`: number (integer) - Available stock
- `isAvailable`: boolean - Whether product can be purchased
- `createdAt`: DateTime - Product creation timestamp
- `updatedAt`: DateTime - Last update timestamp

#### TypeScript Interface

```typescript
interface Product {
  id: string;
  name: string;
  description: string;
  ingredients: string | null;
  price: number; // in cents (e.g., 999 = $9.99)
  imageUrl: string;
  inventoryQuantity: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// For API responses with formatted price
interface ProductWithFormattedPrice extends Product {
  priceFormatted: string; // e.g., "$9.99"
}

// For cart items (minimal data needed)
interface CartProduct {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  inventoryQuantity: number;
}
```

#### Relationships
- Product has many OrderItems (orders that included this product)

---

### Order

**Purpose:** Represents a customer purchase with payment and fulfillment information.

**Key Attributes:**
- `id`: string (UUID) - Unique identifier / order number
- `customerName`: string - Customer's full name
- `customerEmail`: string - Customer's email address
- `customerPhone`: string - Customer's phone number
- `shippingAddress`: JSON (nullable) - Full address for shipping orders
- `fulfillmentMethod`: enum ("SHIPPING" | "PICKUP") - Delivery method
- `shippingCost`: Decimal (nullable) - Calculated shipping cost in cents
- `subtotal`: number - Order subtotal in cents (sum of line items)
- `total`: number - Order total in cents (subtotal + shipping)
- `paymentStatus`: enum ("PENDING" | "PAID" | "FAILED") - Payment state
- `fulfillmentStatus`: enum ("PENDING" | "FULFILLED" | "CANCELLED") - Fulfillment state
- `stripePaymentIntentId`: string (nullable) - Stripe payment reference
- `createdAt`: DateTime - Order placement timestamp
- `updatedAt`: DateTime - Last update timestamp

#### TypeScript Interface

```typescript
type FulfillmentMethod = "SHIPPING" | "PICKUP";
type PaymentStatus = "PENDING" | "PAID" | "FAILED";
type FulfillmentStatus = "PENDING" | "FULFILLED" | "CANCELLED";

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress | null;
  fulfillmentMethod: FulfillmentMethod;
  shippingCost: number | null; // in cents
  subtotal: number; // in cents
  total: number; // in cents
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  stripePaymentIntentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// For order detail views with line items
interface OrderWithItems extends Order {
  items: OrderItem[];
}
```

#### Relationships
- Order has many OrderItems (products in the order)

---

### OrderItem

**Purpose:** Represents individual products within an order, capturing price/name at time of purchase (snapshot).

**Key Attributes:**
- `id`: string (UUID) - Unique identifier
- `orderId`: string - Foreign key to Order
- `productId`: string - Foreign key to Product
- `productName`: string - Product name snapshot
- `quantity`: number (integer) - Quantity purchased
- `unitPrice`: number - Price per unit in cents (snapshot)
- `lineTotal`: number - Total for this line (quantity × unitPrice)

#### TypeScript Interface

```typescript
interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string; // Snapshot at time of order
  quantity: number;
  unitPrice: number; // in cents
  lineTotal: number; // in cents
}

// For order display with product details
interface OrderItemWithProduct extends OrderItem {
  product: Product; // Current product data (for image, etc.)
}
```

#### Relationships
- OrderItem belongs to one Order
- OrderItem references one Product (for historical tracking)

---

### Cart (Client-Side Only)

**Purpose:** Temporary shopping cart stored in browser localStorage (not persisted to database).

**Key Attributes:**
- `items`: Array of cart items
- Each item contains: `productId`, `quantity`

#### TypeScript Interface

```typescript
interface CartItem {
  productId: string;
  quantity: number;
}

interface Cart {
  items: CartItem[];
  lastUpdated: Date;
}

// For UI display, enriched with product data
interface CartItemWithProduct {
  productId: string;
  quantity: number;
  product: Product;
  lineTotal: number; // calculated: product.price * quantity
}

interface CartWithProducts {
  items: CartItemWithProduct[];
  subtotal: number; // sum of all line totals
  itemCount: number; // sum of all quantities
}
```

#### Relationships
- Cart references Products (client-side only, not enforced in database)

---

## API Specification

### REST API Specification

```yaml
openapi: 3.0.0
info:
  title: 4050 E-commerce API
  version: 1.0.0
  description: Internal API for 4050 heritage apple products e-commerce platform

servers:
  - url: https://4050.vercel.app/api
    description: Production server
  - url: http://localhost:3000/api
    description: Local development server

components:
  schemas:
    Product:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        description:
          type: string
        ingredients:
          type: string
          nullable: true
        price:
          type: integer
          description: Price in cents
        imageUrl:
          type: string
        inventoryQuantity:
          type: integer
        isAvailable:
          type: boolean
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    Order:
      type: object
      properties:
        id:
          type: string
          format: uuid
        customerName:
          type: string
        customerEmail:
          type: string
          format: email
        customerPhone:
          type: string
        shippingAddress:
          type: object
          nullable: true
        fulfillmentMethod:
          type: string
          enum: [SHIPPING, PICKUP]
        shippingCost:
          type: integer
          nullable: true
        subtotal:
          type: integer
        total:
          type: integer
        paymentStatus:
          type: string
          enum: [PENDING, PAID, FAILED]
        fulfillmentStatus:
          type: string
          enum: [PENDING, FULFILLED, CANCELLED]
        stripePaymentIntentId:
          type: string
          nullable: true
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    Error:
      type: object
      properties:
        error:
          type: object
          properties:
            code:
              type: string
            message:
              type: string
            details:
              type: object
            timestamp:
              type: string
              format: date-time
            requestId:
              type: string

  securitySchemes:
    AdminSession:
      type: apiKey
      in: cookie
      name: next-auth.session-token
      description: NextAuth.js session cookie for admin authentication

paths:
  # Public Product Endpoints
  /products:
    get:
      summary: List all available products
      tags: [Products - Public]
      responses:
        '200':
          description: Array of products
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Product'

  /products/{id}:
    get:
      summary: Get product by ID
      tags: [Products - Public]
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Product details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Product'
        '404':
          description: Product not found

  # Admin Product Endpoints
  /admin/products:
    post:
      summary: Create new product
      tags: [Products - Admin]
      security:
        - AdminSession: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [name, description, price, imageUrl, inventoryQuantity]
      responses:
        '201':
          description: Product created
        '401':
          description: Unauthorized

  /admin/products/{id}:
    put:
      summary: Update product
      tags: [Products - Admin]
      security:
        - AdminSession: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Product'
      responses:
        '200':
          description: Product updated
        '401':
          description: Unauthorized
        '404':
          description: Product not found

    delete:
      summary: Delete product
      tags: [Products - Admin]
      security:
        - AdminSession: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '204':
          description: Product deleted
        '401':
          description: Unauthorized

  # Shipping Endpoint
  /shipping/calculate:
    post:
      summary: Calculate shipping cost
      tags: [Shipping]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [address, items]
              properties:
                address:
                  type: object
                  properties:
                    street:
                      type: string
                    city:
                      type: string
                    state:
                      type: string
                    zipCode:
                      type: string
                items:
                  type: array
                  items:
                    type: object
                    properties:
                      productId:
                        type: string
                      quantity:
                        type: integer
      responses:
        '200':
          description: Shipping cost calculated
          content:
            application/json:
              schema:
                type: object
                properties:
                  shippingCost:
                    type: integer
                    description: Cost in cents
                  estimatedDays:
                    type: integer

  # Checkout Endpoint
  /checkout:
    post:
      summary: Create order and initiate payment
      tags: [Checkout]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [customerName, customerEmail, customerPhone, fulfillmentMethod, items]
              properties:
                customerName:
                  type: string
                customerEmail:
                  type: string
                customerPhone:
                  type: string
                fulfillmentMethod:
                  type: string
                  enum: [SHIPPING, PICKUP]
                shippingAddress:
                  type: object
                  nullable: true
                items:
                  type: array
                  items:
                    type: object
      responses:
        '200':
          description: Order created, payment intent returned
          content:
            application/json:
              schema:
                type: object
                properties:
                  orderId:
                    type: string
                  clientSecret:
                    type: string
                    description: Stripe client secret for payment

  # Admin Order Endpoints
  /admin/orders:
    get:
      summary: List all orders
      tags: [Orders - Admin]
      security:
        - AdminSession: []
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [PENDING, FULFILLED]
      responses:
        '200':
          description: Array of orders
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Order'

  /admin/orders/{id}:
    get:
      summary: Get order details
      tags: [Orders - Admin]
      security:
        - AdminSession: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Order with items
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Order'

    patch:
      summary: Update order fulfillment status
      tags: [Orders - Admin]
      security:
        - AdminSession: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                fulfillmentStatus:
                  type: string
                  enum: [FULFILLED, CANCELLED]
      responses:
        '200':
          description: Order updated
```

---

## Components

### Frontend Components

#### Layout Component

**Responsibility:** Provides consistent page structure with header, navigation, footer across all pages.

**Key Interfaces:**
- `children: ReactNode` - Page content to render
- Renders `<Header />`, `<Footer />`, and page content

**Dependencies:** Header, Footer, CartProvider

**Technology Stack:** React Server Component, Tailwind CSS

---

#### Header Component

**Responsibility:** Site navigation, cart indicator, mobile menu toggle

**Key Interfaces:**
- Displays logo/site name
- Navigation links (Home, Shop, About, Contact)
- Cart icon with item count badge
- Mobile hamburger menu

**Dependencies:** CartContext (for item count)

**Technology Stack:** React Client Component (needs cart state), Headless UI (mobile menu)

---

#### Footer Component

**Responsibility:** Footer with social impact messaging, legal links

**Key Interfaces:**
- Displays charitable mission statement
- Links to Privacy, Terms, Contact pages

**Dependencies:** None

**Technology Stack:** React Server Component

---

#### ProductCard Component

**Responsibility:** Displays product summary with add-to-cart action

**Key Interfaces:**
- `product: Product` - Product data
- `onAddToCart: (productId: string) => void` - Add to cart callback

**Dependencies:** Next.js Image

**Technology Stack:** React Client Component (interactive button)

---

#### CartProvider Component

**Responsibility:** Manages cart state and persistence across app

**Key Interfaces:**
- `children: ReactNode` - App content
- Provides context: `cart`, `addToCart`, `updateQuantity`, `removeItem`, `clearCart`

**Dependencies:** React Context, localStorage

**Technology Stack:** React Client Component (Context Provider)

---

#### CheckoutForm Component

**Responsibility:** Collects customer information, fulfillment method, displays order summary

**Key Interfaces:**
- `cart: CartWithProducts` - Cart data for order summary
- `onSubmit: (data: CheckoutFormData) => void` - Form submission handler

**Dependencies:** React Hook Form, shipping calculate API

**Technology Stack:** React Client Component

---

#### StripePaymentElement Component

**Responsibility:** Embeds Stripe payment UI and handles payment submission

**Key Interfaces:**
- `clientSecret: string` - Stripe Payment Intent client secret
- `onSuccess: (orderId: string) => void` - Payment success callback

**Dependencies:** @stripe/stripe-js, @stripe/react-stripe-js

**Technology Stack:** React Client Component, Stripe Elements

---

### Backend Components (API Routes)

#### Products Service

**Responsibility:** Product CRUD operations, inventory management

**Key Interfaces:**
- `GET /api/products` - List available products
- `GET /api/products/[id]` - Get product details
- `POST /api/admin/products` - Create product (admin)
- `PUT /api/admin/products/[id]` - Update product (admin)
- `DELETE /api/admin/products/[id]` - Delete product (admin)

**Dependencies:** Prisma client, authentication middleware

**Technology Stack:** Next.js API Routes, Prisma ORM

---

#### Orders Service

**Responsibility:** Order creation, order management, fulfillment tracking

**Key Interfaces:**
- `POST /api/checkout` - Create order and payment intent
- `GET /api/admin/orders` - List orders (admin)
- `GET /api/admin/orders/[id]` - Get order details (admin)
- `PATCH /api/admin/orders/[id]` - Update fulfillment status (admin)

**Dependencies:** Prisma client, Stripe SDK, email service, authentication middleware

**Technology Stack:** Next.js API Routes, Prisma ORM

---

#### Shipping Service

**Responsibility:** Calculate real-time shipping costs via EasyPost

**Key Interfaces:**
- `POST /api/shipping/calculate` - Calculate shipping cost for address and items

**Dependencies:** EasyPost SDK

**Technology Stack:** Next.js API Route

---

#### Authentication Service

**Responsibility:** Admin login, session management

**Key Interfaces:**
- NextAuth.js handles `/api/auth/*` routes automatically
- `POST /api/auth/signin` - Admin login
- `POST /api/auth/signout` - Admin logout

**Dependencies:** NextAuth.js, Prisma adapter, bcrypt

**Technology Stack:** NextAuth.js v5, credentials provider

---

#### Email Service

**Responsibility:** Send transactional emails (order confirmations)

**Key Interfaces:**
- `sendOrderConfirmation(order: OrderWithItems, customerEmail: string)` - Send confirmation email

**Dependencies:** Resend SDK

**Technology Stack:** Resend API, React Email (email templates)

---

### Component Diagrams

```mermaid
graph TB
    subgraph "Frontend Components"
        Layout[Layout Component]
        Header[Header Component]
        Footer[Footer Component]
        CartProvider[CartProvider]
        ProductCard[ProductCard]
        CheckoutForm[CheckoutForm]
        StripePayment[StripePaymentElement]
    end
    
    subgraph "API Routes (Backend)"
        ProductsAPI[Products API]
        OrdersAPI[Orders API]
        ShippingAPI[Shipping API]
        AuthAPI[Auth API]
        EmailService[Email Service]
    end
    
    subgraph "External Services"
        DB[(PostgreSQL)]
        Stripe[Stripe]
        EasyPost[EasyPost]
        Resend[Resend]
        BlobStorage[Vercel Blob]
    end
    
    Layout --> Header
    Layout --> Footer
    Layout --> CartProvider
    Header --> CartProvider
    ProductCard --> CartProvider
    CheckoutForm --> CartProvider
    CheckoutForm --> ShippingAPI
    StripePayment --> Stripe
    
    ProductsAPI --> DB
    OrdersAPI --> DB
    OrdersAPI --> Stripe
    OrdersAPI --> EmailService
    ShippingAPI --> EasyPost
    AuthAPI --> DB
    EmailService --> Resend
    ProductsAPI --> BlobStorage
```

---

## External APIs

### Stripe API

- **Purpose:** Secure payment processing (PCI compliant)
- **Documentation:** https://stripe.com/docs/api
- **Base URL(s):** https://api.stripe.com/v1
- **Authentication:** Secret API key (server-side), Publishable key (client-side)
- **Rate Limits:** 100 req/sec (far exceeds MVP needs)

**Key Endpoints Used:**
- `POST /v1/payment_intents` - Create payment intent with order amount
- `POST /v1/payment_intents/{id}/confirm` - Confirm payment (handled by Stripe.js)
- `GET /v1/payment_intents/{id}` - Retrieve payment status

**Integration Notes:**
- Use Stripe Checkout or Stripe Elements for frontend
- Create Payment Intent on backend when customer reaches checkout
- Handle webhook events for payment confirmation (or poll if webhooks complex for MVP)
- Store `stripePaymentIntentId` in Order for reference/refunds

---

### EasyPost API

- **Purpose:** Real-time shipping rate calculation for USPS, UPS, FedEx
- **Documentation:** https://www.easypost.com/docs/api
- **Base URL(s):** https://api.easypost.com/v2
- **Authentication:** API key (server-side only)
- **Rate Limits:** 100 req/min on free tier (sufficient for MVP)

**Key Endpoints Used:**
- `POST /v2/shipments` - Create shipment with origin, destination, and parcel dimensions
- Response includes rates from multiple carriers

**Integration Notes:**
- Calculate total package weight from order items (assume ~1 lb per jar, can refine)
- Use standard parcel dimensions (e.g., 12x12x8 inches for multi-item orders)
- Return lowest cost option to customer (or offer multiple options)
- Cache rates temporarily to avoid redundant API calls during checkout
- Handle API failures gracefully (show flat rate fallback or error message)

---

### Resend API

- **Purpose:** Transactional email delivery (order confirmations)
- **Documentation:** https://resend.com/docs
- **Base URL(s):** https://api.resend.com
- **Authentication:** API key (server-side only)
- **Rate Limits:** 100 emails/day on free tier (upgrade to 10k/month for $20)

**Key Endpoints Used:**
- `POST /emails` - Send email with HTML content

**Integration Notes:**
- Use React Email library to create HTML email templates
- Send order confirmation after successful payment
- Include order summary, fulfillment method, and contact info
- Log email send failures but don't block order completion
- Consider adding order confirmation resend feature in admin panel

---

## Core Workflows

### Customer Purchase Flow

```mermaid
sequenceDiagram
    actor Customer
    participant Browser
    participant NextJS as Next.js App
    participant API as API Routes
    participant DB as PostgreSQL
    participant Stripe
    participant EasyPost
    participant Resend

    Customer->>Browser: Browse /shop
    Browser->>NextJS: Request products page
    NextJS->>API: GET /api/products
    API->>DB: Prisma: findMany(available)
    DB-->>API: Products array
    API-->>NextJS: Products JSON
    NextJS-->>Browser: Rendered product catalog
    
    Customer->>Browser: Click "Add to Cart"
    Browser->>Browser: Update cart in localStorage
    Browser->>Browser: Update cart badge
    
    Customer->>Browser: Navigate to /cart
    Browser->>Browser: Read cart from localStorage
    Browser->>NextJS: Fetch product details
    NextJS-->>Browser: Enriched cart data
    
    Customer->>Browser: Click "Checkout"
    Browser->>NextJS: Navigate to /checkout
    Customer->>Browser: Enter contact info, select shipping
    Browser->>API: POST /api/shipping/calculate
    API->>EasyPost: Calculate rates
    EasyPost-->>API: Shipping cost
    API-->>Browser: Display shipping cost
    
    Customer->>Browser: Click "Pay Now"
    Browser->>API: POST /api/checkout (customer info, items)
    API->>DB: Begin transaction
    API->>DB: Create order (PENDING)
    API->>Stripe: Create payment intent
    Stripe-->>API: Client secret
    API-->>Browser: Return client secret
    
    Browser->>Stripe: Load Stripe Payment Element
    Customer->>Stripe: Enter card details, submit
    Stripe->>Stripe: Process payment
    Stripe-->>Browser: Payment success
    Browser->>API: PATCH /api/orders/{id}/confirm
    API->>DB: Update order status to PAID
    API->>DB: Decrement product inventory
    API->>DB: Commit transaction
    API->>Resend: Send order confirmation email
    Resend-->>Customer: Email confirmation
    API-->>Browser: Order confirmed
    Browser->>Browser: Clear cart
    Browser->>NextJS: Navigate to /order/confirmation
    NextJS-->>Customer: Thank you page
```

---

### Admin Order Fulfillment Flow

```mermaid
sequenceDiagram
    actor Admin
    participant Browser
    participant NextJS as Next.js App
    participant API as API Routes
    participant DB as PostgreSQL

    Admin->>Browser: Navigate to /admin/login
    Browser->>NextJS: Request login page
    NextJS-->>Browser: Login form
    
    Admin->>Browser: Enter email/password
    Browser->>API: POST /api/auth/signin
    API->>DB: Prisma: findUnique(email)
    DB-->>API: User with passwordHash
    API->>API: Bcrypt compare password
    API->>API: Create NextAuth session
    API-->>Browser: Set session cookie
    Browser->>NextJS: Redirect to /admin/dashboard
    
    Admin->>Browser: Click "Manage Orders"
    Browser->>NextJS: Navigate to /admin/orders
    NextJS->>API: GET /api/admin/orders (with session)
    API->>API: Verify admin session
    API->>DB: Prisma: findMany(orders, include items)
    DB-->>API: Orders array with items
    API-->>NextJS: Orders JSON
    NextJS-->>Browser: Orders table
    
    Admin->>Browser: Click "View Details" on order
    Browser->>NextJS: Navigate to /admin/orders/[id]
    NextJS->>API: GET /api/admin/orders/[id]
    API->>DB: Prisma: findUnique(id, include items)
    DB-->>API: Order with items
    API-->>NextJS: Order JSON
    NextJS-->>Browser: Order detail page
    
    Admin->>Admin: (Offline) Pack and ship order
    
    Admin->>Browser: Click "Mark as Fulfilled"
    Browser->>API: PATCH /api/admin/orders/[id]
    API->>DB: Prisma: update(fulfillmentStatus = FULFILLED)
    DB-->>API: Updated order
    API-->>Browser: Success response
    Browser->>NextJS: Refresh order list
    NextJS-->>Browser: Updated orders table
```

---

## Database Schema

### Prisma Schema Definition

```prisma
// This is your Prisma schema file
// Learn more: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  name         String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("users")
}

model Product {
  id                String   @id @default(uuid())
  name              String
  description       String   @db.Text
  ingredients       String?  @db.Text
  price             Int      // Price in cents (e.g., 999 = $9.99)
  imageUrl          String
  inventoryQuantity Int      @default(0)
  isAvailable       Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  orderItems OrderItem[]

  @@index([isAvailable])
  @@index([createdAt])
  @@map("products")
}

enum FulfillmentMethod {
  SHIPPING
  PICKUP
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
}

enum FulfillmentStatus {
  PENDING
  FULFILLED
  CANCELLED
}

model Order {
  id                    String            @id @default(uuid())
  customerName          String
  customerEmail         String
  customerPhone         String
  shippingAddress       Json?             // { street, city, state, zipCode }
  fulfillmentMethod     FulfillmentMethod
  shippingCost          Int?              // In cents
  subtotal              Int               // In cents
  total                 Int               // In cents
  paymentStatus         PaymentStatus     @default(PENDING)
  fulfillmentStatus     FulfillmentStatus @default(PENDING)
  stripePaymentIntentId String?           @unique
  createdAt             DateTime          @default(now())
  updatedAt             DateTime          @updatedAt

  // Relations
  items OrderItem[]

  @@index([paymentStatus])
  @@index([fulfillmentStatus])
  @@index([createdAt])
  @@map("orders")
}

model OrderItem {
  id          String @id @default(uuid())
  orderId     String
  productId   String
  productName String // Snapshot at time of order
  quantity    Int
  unitPrice   Int    // Price per unit in cents (snapshot)
  lineTotal   Int    // quantity * unitPrice

  // Relations
  order   Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id], onDelete: Restrict)

  @@index([orderId])
  @@index([productId])
  @@map("order_items")
}
```

### Migration Strategy

- Use Prisma Migrate for schema changes
- Initial migration creates all tables
- Run migrations on deployment via `prisma migrate deploy`
- For local development, use `prisma migrate dev` (resets database if needed)
- Seed script creates initial admin user and sample products

---

## Frontend Architecture

### Component Architecture

#### Component Organization

```
/app                          # Next.js App Router
├── layout.tsx                # Root layout (Header, Footer, providers)
├── page.tsx                  # Homepage (/)
├── shop/
│   ├── page.tsx              # Product catalog (/shop)
│   └── [id]/
│       └── page.tsx          # Product detail page (optional)
├── cart/
│   └── page.tsx              # Shopping cart page
├── checkout/
│   ├── page.tsx              # Checkout form
│   └── success/
│       └── page.tsx          # Order confirmation
├── about/
│   └── page.tsx              # About page
├── contact/
│   └── page.tsx              # Contact/FAQ page
├── privacy/
│   └── page.tsx              # Privacy policy
├── terms/
│   └── page.tsx              # Terms of service
└── admin/
    ├── layout.tsx            # Admin layout (with auth protection)
    ├── login/
    │   └── page.tsx          # Admin login
    ├── dashboard/
    │   └── page.tsx          # Admin dashboard
    ├── products/
    │   ├── page.tsx          # Product list
    │   ├── new/
    │   │   └── page.tsx      # Create product
    │   └── [id]/
    │       └── edit/
    │           └── page.tsx  # Edit product
    └── orders/
        ├── page.tsx          # Orders list
        └── [id]/
            └── page.tsx      # Order details

/components                   # Shared components
├── layout/
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── Navigation.tsx
├── products/
│   ├── ProductCard.tsx
│   ├── ProductGrid.tsx
│   └── ProductImage.tsx
├── cart/
│   ├── CartIcon.tsx
│   ├── CartItem.tsx
│   └── CartSummary.tsx
├── checkout/
│   ├── CheckoutForm.tsx
│   ├── ShippingAddressForm.tsx
│   ├── FulfillmentMethodSelector.tsx
│   └── StripePaymentElement.tsx
├── admin/
│   ├── AdminNav.tsx
│   ├── ProductForm.tsx
│   ├── OrderTable.tsx
│   └── OrderStatusBadge.tsx
└── ui/                       # Shared UI primitives
    ├── Button.tsx
    ├── Input.tsx
    ├── Select.tsx
    ├── Modal.tsx
    └── Alert.tsx

/lib                          # Shared utilities
├── cart.ts                   # Cart helpers
├── format.ts                 # Currency, date formatting
├── validation.ts             # Form validation schemas
└── api-client.ts             # Typed API client functions
```

#### Component Template

```typescript
// components/products/ProductCard.tsx
'use client'; // Client component for interactivity

import Image from 'next/image';
import { Product } from '@/lib/types';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/format';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product.id);
  };

  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
      <Image
        src={product.imageUrl}
        alt={product.name}
        width={400}
        height={400}
        className="w-full aspect-square object-cover rounded-md"
      />
      <h3 className="mt-4 text-lg font-semibold">{product.name}</h3>
      <p className="mt-2 text-2xl font-bold text-amber-700">
        {formatPrice(product.price)}
      </p>
      <Button
        onClick={handleAddToCart}
        disabled={!product.isAvailable || product.inventoryQuantity === 0}
        className="mt-4 w-full"
      >
        {product.isAvailable ? 'Add to Cart' : 'Out of Stock'}
      </Button>
    </div>
  );
}
```

---

### State Management Architecture

#### State Structure

```typescript
// contexts/CartContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Cart, CartItem, Product } from '@/lib/types';

interface CartContextValue {
  cart: Cart;
  itemCount: number;
  subtotal: number;
  addToCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>({ items: [], lastUpdated: new Date() });

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('4050-cart');
    if (stored) {
      setCart(JSON.parse(stored));
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem('4050-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (productId: string) => {
    setCart((prev) => {
      const existingItem = prev.items.find((item) => item.productId === productId);
      if (existingItem) {
        return {
          ...prev,
          items: prev.items.map((item) =>
            item.productId === productId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
          lastUpdated: new Date(),
        };
      } else {
        return {
          ...prev,
          items: [...prev.items, { productId, quantity: 1 }],
          lastUpdated: new Date(),
        };
      }
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setCart((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      ),
      lastUpdated: new Date(),
    }));
  };

  const removeItem = (productId: string) => {
    setCart((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.productId !== productId),
      lastUpdated: new Date(),
    }));
  };

  const clearCart = () => {
    setCart({ items: [], lastUpdated: new Date() });
  };

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = 0; // Calculated in cart page with product prices

  return (
    <CartContext.Provider
      value={{ cart, itemCount, subtotal, addToCart, updateQuantity, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
```

#### State Management Patterns

- **Cart State:** React Context + localStorage for persistence
- **Server State:** Next.js Server Components fetch data directly, no client-side cache needed
- **Form State:** React Hook Form for checkout and admin forms
- **Admin Session:** NextAuth.js session managed via cookies

---

### Routing Architecture

#### Route Organization

```
/ (public)
├── / (homepage)
├── /shop (product catalog)
├── /shop/[id] (product detail - optional)
├── /cart (shopping cart)
├── /checkout (checkout form)
├── /checkout/success (order confirmation)
├── /about (about page)
├── /contact (contact/FAQ)
├── /privacy (privacy policy)
└── /terms (terms of service)

/admin (protected)
├── /admin/login (admin login - public)
├── /admin/dashboard (admin overview)
├── /admin/products (product list)
├── /admin/products/new (create product)
├── /admin/products/[id]/edit (edit product)
├── /admin/orders (orders list)
└── /admin/orders/[id] (order detail)

/api (API routes)
├── /api/auth/[...nextauth] (NextAuth.js)
├── /api/products (public product list)
├── /api/products/[id] (public product detail)
├── /api/shipping/calculate (shipping cost calculation)
├── /api/checkout (create order + payment intent)
├── /api/admin/products (admin product CRUD)
└── /api/admin/orders (admin order management)
```

#### Protected Route Pattern

```typescript
// middleware.ts (edge middleware for admin route protection)
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/admin/login',
  },
});

export const config = {
  matcher: ['/admin/:path*'],
};

// Alternative: app/admin/layout.tsx (server-side protection)
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">{/* Admin navigation */}</aside>
      <main className="admin-content">{children}</main>
    </div>
  );
}
```

---

### Frontend Services Layer

#### API Client Setup

```typescript
// lib/api-client.ts
import { Product, Order, OrderWithItems } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new ApiError(
      response.status,
      error.error?.code || 'UNKNOWN_ERROR',
      error.error?.message || 'An error occurred',
      error.error?.details
    );
  }

  return response.json();
}

export const api = {
  products: {
    list: () => fetchAPI<Product[]>('/products'),
    get: (id: string) => fetchAPI<Product>(`/products/${id}`),
  },
  
  shipping: {
    calculate: (data: {
      address: { street: string; city: string; state: string; zipCode: string };
      items: { productId: string; quantity: number }[];
    }) =>
      fetchAPI<{ shippingCost: number; estimatedDays: number }>(
        '/shipping/calculate',
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      ),
  },
  
  checkout: {
    create: (data: any) =>
      fetchAPI<{ orderId: string; clientSecret: string }>('/checkout', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  
  admin: {
    products: {
      list: () => fetchAPI<Product[]>('/admin/products'),
      create: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) =>
        fetchAPI<Product>('/admin/products', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      update: (id: string, data: Partial<Product>) =>
        fetchAPI<Product>(`/admin/products/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        }),
      delete: (id: string) =>
        fetchAPI<void>(`/admin/products/${id}`, {
          method: 'DELETE',
        }),
    },
    
    orders: {
      list: (status?: 'PENDING' | 'FULFILLED') =>
        fetchAPI<Order[]>(`/admin/orders${status ? `?status=${status}` : ''}`),
      get: (id: string) => fetchAPI<OrderWithItems>(`/admin/orders/${id}`),
      updateStatus: (id: string, status: 'FULFILLED' | 'CANCELLED') =>
        fetchAPI<Order>(`/admin/orders/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ fulfillmentStatus: status }),
        }),
    },
  },
};
```

#### Service Example

```typescript
// app/shop/page.tsx (Server Component fetching products)
import { ProductGrid } from '@/components/products/ProductGrid';
import { api } from '@/lib/api-client';

export default async function ShopPage() {
  const products = await api.products.list();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Shop Heritage Apple Products</h1>
      <ProductGrid products={products} />
    </div>
  );
}
```

---

## Backend Architecture

### Service Architecture (Serverless)

#### Function Organization

```
/app/api                              # Next.js API Routes
├── auth/
│   └── [...nextauth]/
│       └── route.ts                  # NextAuth.js handler
├── products/
│   ├── route.ts                      # GET /api/products (list)
│   └── [id]/
│       └── route.ts                  # GET /api/products/[id] (detail)
├── shipping/
│   └── calculate/
│       └── route.ts                  # POST /api/shipping/calculate
├── checkout/
│   └── route.ts                      # POST /api/checkout
└── admin/
    ├── products/
    │   ├── route.ts                  # POST /api/admin/products (create)
    │   └── [id]/
    │       └── route.ts              # PUT/DELETE /api/admin/products/[id]
    └── orders/
        ├── route.ts                  # GET /api/admin/orders (list)
        └── [id]/
            └── route.ts              # GET/PATCH /api/admin/orders/[id]

/lib/server                           # Server-side utilities
├── db.ts                             # Prisma client singleton
├── auth.ts                           # Auth configuration
├── stripe.ts                         # Stripe client
├── easypost.ts                       # EasyPost client
├── resend.ts                         # Resend client
├── middleware.ts                     # API middleware (auth, error handling)
└── email/
    ├── templates/
    │   └── order-confirmation.tsx    # React Email template
    └── send.ts                       # Email sending logic
```

#### Function Template

```typescript
// app/api/products/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';
import { handleApiError } from '@/lib/server/middleware';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isAvailable: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    return handleApiError(error);
  }
}
```

---

### Database Architecture

#### Schema Design

See [Database Schema](#database-schema) section above for full Prisma schema.

**Key Design Decisions:**

- **UUIDs for primary keys:** Better for distributed systems, no sequential leakage
- **Prices in cents (integers):** Avoids floating-point precision issues
- **Enums for statuses:** Type-safe, prevents invalid values
- **JSON for shipping address:** Flexible schema, avoid separate table for MVP
- **Snapshot fields in OrderItem:** Preserve product name/price at time of order
- **Cascade delete on OrderItems:** Orders own their items
- **Restrict delete on Products:** Can't delete product referenced in orders
- **Indexes on commonly queried fields:** Fast lookups for available products, pending orders

#### Data Access Layer

```typescript
// lib/server/db.ts
import { PrismaClient } from '@prisma/client';

// Singleton pattern for Prisma client (avoid multiple instances in dev)
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Repository pattern helpers
export const repositories = {
  products: {
    findAvailable: () =>
      prisma.product.findMany({
        where: { isAvailable: true, inventoryQuantity: { gt: 0 } },
        orderBy: { createdAt: 'desc' },
      }),
    
    findById: (id: string) =>
      prisma.product.findUnique({ where: { id } }),
    
    decrementInventory: async (items: { productId: string; quantity: number }[]) => {
      // Use Prisma transaction to ensure atomicity
      await prisma.$transaction(
        items.map((item) =>
          prisma.product.update({
            where: { id: item.productId },
            data: { inventoryQuantity: { decrement: item.quantity } },
          })
        )
      );
    },
  },
  
  orders: {
    findPending: () =>
      prisma.order.findMany({
        where: { fulfillmentStatus: 'PENDING' },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      }),
    
    findWithItems: (id: string) =>
      prisma.order.findUnique({
        where: { id },
        include: { items: true },
      }),
    
    create: (data: any) =>
      prisma.order.create({
        data,
        include: { items: true },
      }),
  },
};
```

---

### Authentication and Authorization

#### Auth Flow

```mermaid
sequenceDiagram
    actor Admin
    participant Browser
    participant NextAuth as NextAuth.js
    participant DB as PostgreSQL

    Admin->>Browser: Navigate to /admin/login
    Browser->>Browser: Render login form
    Admin->>Browser: Enter email/password
    Browser->>NextAuth: POST /api/auth/signin
    NextAuth->>DB: findUnique({ email })
    DB-->>NextAuth: User with passwordHash
    NextAuth->>NextAuth: bcrypt.compare(password, hash)
    alt Password valid
        NextAuth->>NextAuth: Create JWT session
        NextAuth-->>Browser: Set session cookie (httpOnly, secure)
        Browser->>Browser: Redirect to /admin/dashboard
    else Password invalid
        NextAuth-->>Browser: Error: Invalid credentials
        Browser->>Browser: Display error message
    end
    
    Note over Browser,NextAuth: Protected route access
    Admin->>Browser: Navigate to /admin/products
    Browser->>NextAuth: Request with session cookie
    NextAuth->>NextAuth: Verify JWT
    alt Session valid
        NextAuth-->>Browser: Allow access
    else Session invalid/expired
        NextAuth-->>Browser: Redirect to /admin/login
    end
```

#### Middleware/Guards

```typescript
// lib/server/auth.ts
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './db';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Admin Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

// Helper to get session in Server Components
import { getServerSession } from 'next-auth';

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}
```

---

## Unified Project Structure

```
4050/
├── .github/                          # CI/CD workflows
│   └── workflows/
│       ├── ci.yml                    # Run tests on PR
│       └── deploy.yml                # Deploy to Vercel on merge
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout with providers
│   ├── page.tsx                      # Homepage
│   ├── globals.css                   # Global styles (Tailwind)
│   ├── shop/                         # Product catalog pages
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── cart/
│   │   └── page.tsx
│   ├── checkout/
│   │   ├── page.tsx
│   │   └── success/
│   │       └── page.tsx
│   ├── about/
│   │   └── page.tsx
│   ├── contact/
│   │   └── page.tsx
│   ├── privacy/
│   │   └── page.tsx
│   ├── terms/
│   │   └── page.tsx
│   ├── admin/
│   │   ├── layout.tsx                # Admin-only layout
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   └── orders/
│   │       ├── page.tsx
│   │       └── [id]/
│   │           └── page.tsx
│   └── api/                          # API Routes (serverless)
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts
│       ├── products/
│       │   ├── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       ├── shipping/
│       │   └── calculate/
│       │       └── route.ts
│       ├── checkout/
│       │   └── route.ts
│       └── admin/
│           ├── products/
│           │   ├── route.ts
│           │   └── [id]/
│           │       └── route.ts
│           └── orders/
│               ├── route.ts
│               └── [id]/
│                   └── route.ts
├── components/                       # React components
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   ├── products/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   └── ProductImage.tsx
│   ├── cart/
│   │   ├── CartIcon.tsx
│   │   ├── CartItem.tsx
│   │   └── CartSummary.tsx
│   ├── checkout/
│   │   ├── CheckoutForm.tsx
│   │   ├── ShippingAddressForm.tsx
│   │   ├── FulfillmentMethodSelector.tsx
│   │   └── StripePaymentElement.tsx
│   ├── admin/
│   │   ├── AdminNav.tsx
│   │   ├── ProductForm.tsx
│   │   ├── OrderTable.tsx
│   │   └── OrderStatusBadge.tsx
│   └── ui/                           # Shared UI primitives
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Modal.tsx
│       └── Alert.tsx
├── contexts/                         # React contexts
│   └── CartContext.tsx               # Cart state management
├── lib/                              # Shared utilities & types
│   ├── types.ts                      # TypeScript interfaces
│   ├── constants.ts                  # App constants
│   ├── format.ts                     # Formatting helpers
│   ├── validation.ts                 # Validation schemas
│   ├── api-client.ts                 # Frontend API client
│   └── server/                       # Server-side only code
│       ├── db.ts                     # Prisma client
│       ├── auth.ts                   # NextAuth config
│       ├── stripe.ts                 # Stripe SDK
│       ├── easypost.ts               # EasyPost SDK
│       ├── resend.ts                 # Resend SDK
│       ├── middleware.ts             # API middleware
│       └── email/
│           ├── templates/
│           │   └── order-confirmation.tsx
│           └── send.ts
├── prisma/                           # Prisma ORM
│   ├── schema.prisma                 # Database schema
│   ├── migrations/                   # Migration history
│   └── seed.ts                       # Seed script
├── public/                           # Static assets
│   ├── favicon.ico
│   ├── images/
│   │   └── logo.svg
│   └── fonts/
├── tests/                            # Test files
│   ├── unit/
│   │   ├── lib/
│   │   │   └── format.test.ts
│   │   └── components/
│   │       └── ProductCard.test.tsx
│   ├── integration/
│   │   └── api/
│   │       ├── products.test.ts
│   │       └── checkout.test.ts
│   └── setup.ts                      # Jest setup
├── scripts/                          # Utility scripts
│   ├── create-admin.ts               # Create admin user
│   └── backup-db.ts                  # Database backup
├── docs/                             # Documentation
│   ├── prd.md
│   ├── brief.md
│   ├── architecture.md
│   └── open-questions.md
├── .env.example                      # Environment variables template
├── .env.local                        # Local environment (gitignored)
├── .gitignore
├── next.config.js                    # Next.js configuration
├── tailwind.config.ts                # Tailwind configuration
├── tsconfig.json                     # TypeScript configuration
├── jest.config.js                    # Jest configuration
├── package.json                      # Dependencies
├── package-lock.json
└── README.md                         # Project documentation
```

---

## Development Workflow

### Local Development Setup

#### Prerequisites

```bash
# Required software
node --version  # v18.17+ or v20.0+
npm --version   # v9.0+
git --version   # v2.30+
docker --version  # Optional: for local PostgreSQL

# Install Node.js from https://nodejs.org/
# Install Docker Desktop from https://www.docker.com/products/docker-desktop/
```

#### Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd 4050

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Start local PostgreSQL (via Docker)
docker run --name 4050-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15

# OR use Railway/Render free tier for database

# Update .env.local with your database URL
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/4050"

# Run Prisma migrations
npx prisma migrate dev --name init

# Seed database with sample data
npx prisma db seed

# Create admin user
npm run create-admin
# Follow prompts to set email/password

# Start development server
npm run dev

# Open http://localhost:3000
```

#### Development Commands

```bash
# Start all services (Next.js dev server)
npm run dev

# Start frontend only (same as above, Next.js handles both)
npm run dev

# Start backend only (API routes run with Next.js)
# No separate backend command needed

# Run tests
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report

# Database commands
npx prisma studio         # Open Prisma Studio (database GUI)
npx prisma migrate dev    # Create and apply migration
npx prisma generate       # Regenerate Prisma client
npm run db:seed           # Run seed script

# Linting and formatting
npm run lint              # ESLint
npm run lint:fix          # Auto-fix ESLint issues
npm run format            # Prettier

# Build for production
npm run build             # Build Next.js app
npm run start             # Start production server locally
```

---

### Environment Configuration

#### Required Environment Variables

```bash
# Frontend (.env.local)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_API_URL=http://localhost:3000/api  # Only needed if API on different domain

# Backend (.env)
DATABASE_URL=postgresql://user:password@host:5432/database

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...  # Optional for MVP

# EasyPost
EASYPOST_API_KEY=EZAK...

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=orders@4050.com  # Verified domain

# Vercel Blob (only in production)
BLOB_READ_WRITE_TOKEN=vercel_blob_...

# Sentry (optional)
SENTRY_DSN=https://...ingest.sentry.io/...

# Shared
NODE_ENV=development  # development | production
```

---

## Deployment Architecture

### Deployment Strategy

**Frontend Deployment:**
- **Platform:** Vercel (Edge Network)
- **Build Command:** `npm run build` (Next.js build)
- **Output Directory:** `.next` (handled by Vercel automatically)
- **CDN/Edge:** Vercel Edge Network with automatic global distribution

**Backend Deployment:**
- **Platform:** Vercel (Serverless Functions)
- **Build Command:** Same as frontend (Next.js API routes)
- **Deployment Method:** Git-based continuous deployment

**Database Deployment:**
- **Platform:** Railway (PostgreSQL)
- **Connection:** Prisma connects via DATABASE_URL environment variable
- **Migrations:** Run via `prisma migrate deploy` in Vercel build step

---

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: 4050_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run Prisma migrations
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/4050_test
        run: npx prisma migrate deploy
      
      - name: Run tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/4050_test
        run: npm run test:ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Build application
        run: npm run build

# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

### Environments

| Environment | Frontend URL | Backend URL | Purpose |
|-------------|-------------|-------------|---------|
| Development | http://localhost:3000 | http://localhost:3000/api | Local development and testing |
| Staging | https://4050-staging.vercel.app | https://4050-staging.vercel.app/api | Pre-production testing (optional for MVP) |
| Production | https://4050.com | https://4050.com/api | Live customer-facing environment |

---

## Security and Performance

### Security Requirements

**Frontend Security:**
- **CSP Headers:** `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; connect-src 'self' https://api.stripe.com; img-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline';`
- **XSS Prevention:** React automatic escaping, sanitize any user-generated content (e.g., review comments - not in MVP)
- **Secure Storage:** No sensitive data in localStorage; cart data is non-sensitive

**Backend Security:**
- **Input Validation:** Validate all API inputs using Zod schemas before processing
- **Rate Limiting:** 100 requests per 15 minutes per IP for API routes (use `@upstash/ratelimit` with Vercel KV)
- **CORS Policy:** `Access-Control-Allow-Origin: same-origin` (no external domains for MVP)

**Authentication Security:**
- **Token Storage:** httpOnly, secure, SameSite=strict cookies for NextAuth sessions
- **Session Management:** JWT with 7-day expiration, refresh on activity
- **Password Policy:** Minimum 8 characters, require uppercase, lowercase, number (enforced in admin creation script)

---

### Performance Optimization

**Frontend Performance:**
- **Bundle Size Target:** <300KB initial JS bundle (Next.js default optimizations)
- **Loading Strategy:** 
  - Next.js Image component for automatic optimization
  - Lazy load images below fold
  - Code split by route (automatic with App Router)
- **Caching Strategy:** 
  - Static pages cached at edge (About, Contact, Terms)
  - Product catalog ISR (revalidate every 60 seconds)
  - Cart stored in localStorage (no network calls)

**Backend Performance:**
- **Response Time Target:** <500ms for API routes, <1000ms for complex operations (checkout)
- **Database Optimization:** 
  - Indexes on frequently queried fields (isAvailable, fulfillmentStatus, createdAt)
  - Prisma connection pooling
  - Select only required fields (avoid `SELECT *`)
- **Caching Strategy:** 
  - Vercel Data Cache for product list (60-second revalidation)
  - No Redis/Memcached needed for MVP (Vercel handles edge caching)

---

## Testing Strategy

### Testing Pyramid

```
       E2E Tests (Manual)
       /              \
   Integration Tests
   /                  \
Frontend Unit      Backend Unit
```

### Test Organization

#### Frontend Tests

```
tests/
├── unit/
│   ├── components/
│   │   ├── ProductCard.test.tsx
│   │   ├── CartIcon.test.tsx
│   │   └── CheckoutForm.test.tsx
│   ├── contexts/
│   │   └── CartContext.test.tsx
│   └── lib/
│       ├── format.test.ts
│       └── validation.test.ts
├── integration/
│   └── api/
│       ├── products.test.ts
│       ├── checkout.test.ts
│       └── admin-orders.test.ts
└── setup.ts
```

#### Backend Tests

```
tests/integration/api/
├── products.test.ts          # API route tests
├── checkout.test.ts
├── shipping.test.ts
└── admin/
    ├── products.test.ts
    └── orders.test.ts
```

#### E2E Tests

**Manual Testing Checklist** (for MVP):
- [ ] Customer can browse products
- [ ] Customer can add to cart
- [ ] Customer can checkout with shipping
- [ ] Customer can checkout with pickup
- [ ] Customer receives email confirmation
- [ ] Admin can log in
- [ ] Admin can create product
- [ ] Admin can edit product
- [ ] Admin can fulfill order
- [ ] Mobile browsing works
- [ ] Payment succeeds with test card
- [ ] Payment fails with declined card

---

### Test Examples

#### Frontend Component Test

```typescript
// tests/unit/components/ProductCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '@/components/products/ProductCard';
import { CartProvider } from '@/contexts/CartContext';

const mockProduct = {
  id: '1',
  name: 'Heritage Apple Butter',
  description: 'Smooth and spreadable',
  price: 999,
  imageUrl: '/test.jpg',
  inventoryQuantity: 10,
  isAvailable: true,
};

describe('ProductCard', () => {
  it('renders product information', () => {
    render(
      <CartProvider>
        <ProductCard product={mockProduct} />
      </CartProvider>
    );

    expect(screen.getByText('Heritage Apple Butter')).toBeInTheDocument();
    expect(screen.getByText('$9.99')).toBeInTheDocument();
  });

  it('adds product to cart when button clicked', () => {
    render(
      <CartProvider>
        <ProductCard product={mockProduct} />
      </CartProvider>
    );

    const addButton = screen.getByText('Add to Cart');
    fireEvent.click(addButton);

    // Verify cart count updated (would need to render CartIcon as well)
  });

  it('disables button when out of stock', () => {
    const outOfStockProduct = { ...mockProduct, isAvailable: false };
    
    render(
      <CartProvider>
        <ProductCard product={outOfStockProduct} />
      </CartProvider>
    );

    expect(screen.getByText('Out of Stock')).toBeDisabled();
  });
});
```

#### Backend API Test

```typescript
// tests/integration/api/products.test.ts
import { GET } from '@/app/api/products/route';
import { prisma } from '@/lib/server/db';

describe('GET /api/products', () => {
  beforeEach(async () => {
    // Seed test database
    await prisma.product.createMany({
      data: [
        {
          name: 'Product 1',
          description: 'Test',
          price: 999,
          imageUrl: '/test.jpg',
          inventoryQuantity: 10,
          isAvailable: true,
        },
        {
          name: 'Product 2',
          description: 'Test',
          price: 1299,
          imageUrl: '/test.jpg',
          inventoryQuantity: 0,
          isAvailable: false,
        },
      ],
    });
  });

  afterEach(async () => {
    await prisma.product.deleteMany();
  });

  it('returns only available products', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0].name).toBe('Product 1');
  });
});
```

#### E2E Test (Manual Checklist Example)

**Customer Purchase Flow:**
1. Navigate to https://4050.com/shop
2. Verify products display with images and prices
3. Click "Add to Cart" on a product
4. Verify cart badge updates to show 1 item
5. Navigate to /cart
6. Verify product appears in cart with correct price
7. Click "Proceed to Checkout"
8. Fill in customer information (name, email, phone)
9. Select "Shipping"
10. Enter valid address
11. Verify shipping cost appears
12. Click "Pay Now"
13. Enter Stripe test card: 4242 4242 4242 4242, any future date, any CVC
14. Submit payment
15. Verify redirect to confirmation page
16. Check email for order confirmation

---

## Coding Standards

### Critical Fullstack Rules

- **Type Sharing:** Always define shared types in `/lib/types.ts` and import throughout frontend/backend - never duplicate type definitions
- **API Calls:** Never make direct `fetch` calls in components - use the typed API client from `/lib/api-client.ts`
- **Environment Variables:** Access only through config objects in `/lib/server/`, never `process.env` directly in application code
- **Error Handling:** All API routes must use the standard error handler from `/lib/server/middleware.ts` - consistent error format for frontend
- **State Updates:** Never mutate cart state directly - always use CartContext methods (`addToCart`, `updateQuantity`, etc.)
- **Prisma Client:** Import from `/lib/server/db.ts` singleton, never instantiate new PrismaClient directly
- **Server/Client Components:** Use `'use client'` directive only when component needs interactivity (state, events) - default to Server Components
- **Image Optimization:** Always use Next.js `<Image>` component, never `<img>` tag - automatic optimization and lazy loading
- **Authentication Guards:** Protect admin routes at layout level, not individual pages - consistent security enforcement
- **Database Transactions:** Use Prisma transactions for multi-step operations (create order + decrement inventory) - ensure data consistency

### Naming Conventions

| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| Components | PascalCase | - | `UserProfile.tsx` |
| Hooks | camelCase with 'use' | - | `useAuth.ts` |
| API Routes | - | kebab-case | `/api/user-profile` |
| Database Tables | - | snake_case | `user_profiles` |
| Functions | camelCase | camelCase | `calculateTotal()` |
| Constants | UPPER_SNAKE_CASE | UPPER_SNAKE_CASE | `MAX_CART_ITEMS` |
| TypeScript Interfaces | PascalCase | PascalCase | `interface Product` |
| CSS Classes | kebab-case | - | `product-card` |

---

## Error Handling Strategy

### Error Flow

```mermaid
sequenceDiagram
    participant Client as Frontend
    participant API as API Route
    participant Service as Service Layer
    participant External as External API

    Client->>API: Request with invalid data
    API->>API: Validate input (Zod)
    API-->>Client: 400 Bad Request + error details
    
    Client->>API: Request that requires external API
    API->>Service: Call service method
    Service->>External: External API call
    External-->>Service: Network error
    Service->>Service: Catch error, log to Sentry
    Service-->>API: Throw ServiceError
    API->>API: handleApiError middleware
    API-->>Client: 503 Service Unavailable + retry guidance
    
    Client->>API: Request database operation
    API->>Service: Call service method
    Service->>Service: Prisma query fails
    Service->>Service: Catch error, log to Sentry
    Service-->>API: Throw DatabaseError
    API->>API: handleApiError middleware
    API-->>Client: 500 Internal Server Error + generic message
```

### Error Response Format

```typescript
// lib/types.ts
interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId: string;
  };
}
```

### Frontend Error Handling

```typescript
// lib/api-client.ts (already shown above)
// Uses try/catch with ApiError class

// Example usage in component:
import { api, ApiError } from '@/lib/api-client';
import { useState } from 'react';
import { Alert } from '@/components/ui/Alert';

export function CheckoutForm() {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CheckoutFormData) => {
    try {
      setError(null);
      const result = await api.checkout.create(data);
      // Success handling
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        
        // Handle specific error codes
        if (err.code === 'INSUFFICIENT_INVENTORY') {
          // Show specific message about out of stock
        } else if (err.code === 'PAYMENT_FAILED') {
          // Allow retry
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <Alert type="error">{error}</Alert>}
      {/* Form fields */}
    </form>
  );
}
```

### Backend Error Handling

```typescript
// lib/server/middleware.ts
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import * as Sentry from '@sentry/nextjs';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleApiError(error: unknown): NextResponse {
  const requestId = crypto.randomUUID();

  // Log to Sentry
  Sentry.captureException(error, {
    tags: { requestId },
  });

  // Handle known error types
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          timestamp: new Date().toISOString(),
          requestId,
        },
      },
      { status: error.statusCode }
    );
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          error: {
            code: 'UNIQUE_CONSTRAINT_VIOLATION',
            message: 'A record with this value already exists',
            timestamp: new Date().toISOString(),
            requestId,
          },
        },
        { status: 409 }
      );
    }
  }

  // Default error
  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
        requestId,
      },
    },
    { status: 500 }
  );
}

// Example usage in API route:
// app/api/admin/products/[id]/route.ts
import { AppError, handleApiError } from '@/lib/server/middleware';
import { requireAuth } from '@/lib/server/auth';
import { prisma } from '@/lib/server/db';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { orderItems: true },
    });

    if (!product) {
      throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
    }

    if (product.orderItems.length > 0) {
      throw new AppError(
        409,
        'PRODUCT_IN_USE',
        'Cannot delete product that has been ordered',
        { orderCount: product.orderItems.length }
      );
    }

    await prisma.product.delete({ where: { id: params.id } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
```

---

## Monitoring and Observability

### Monitoring Stack

- **Frontend Monitoring:** Vercel Analytics (Web Vitals, page views, user paths)
- **Backend Monitoring:** Vercel Logs (request logs, function execution times)
- **Error Tracking:** Sentry (frontend and backend error capture, stack traces, user context)
- **Performance Monitoring:** Sentry Performance Monitoring (transaction traces, slow queries)

### Key Metrics

**Frontend Metrics:**
- **Core Web Vitals:**
  - LCP (Largest Contentful Paint): <2.5s
  - FID (First Input Delay): <100ms
  - CLS (Cumulative Layout Shift): <0.1
- **JavaScript Errors:** Count and stack traces
- **API Response Times:** Time to fetch products, calculate shipping, process checkout
- **User Interactions:** Cart additions, checkout starts, checkout completions

**Backend Metrics:**
- **Request Rate:** Requests per minute/hour
- **Error Rate:** % of requests returning 4xx/5xx
- **Response Time:** P50, P95, P99 latencies for each endpoint
- **Database Query Performance:** Slow query log (>1s queries flagged)
- **Stripe Payment Success Rate:** % of successful vs. failed payments
- **External API Latency:** EasyPost and Resend response times

**Setup:**

```typescript
// instrumentation.ts (Next.js instrumentation hook)
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% of transactions for performance monitoring
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.Integrations.Prisma({ client: prisma }),
  ],
});
```

---

## Checklist Results Report

**Status:** Pending - To be completed after architecture review

---

*This architecture document is a living document. Update as technical decisions evolve, new patterns emerge, or scope changes occur.*

