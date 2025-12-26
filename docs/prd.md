# 4050 Product Requirements Document (PRD)

**Version:** 2.2 (Seeds of Kindness Refocus)  
**Date:** December 18, 2025  
**Status:** In Development  
**Project:** 4050 Homemade Kindness

---

## Goals and Background Context

### Goals

- Enable customers to browse and purchase homemade produce products through a simple, intuitive interface.
- **Support the Community:** Allow customers to choose which local cause their purchase supports using the **Seeds of Kindness** system.
- **Heartfelt Simplicity:** Provide a straightforward, kind experience that feels like a conversation over a garden fence at address 4050.
- Support both local pickup and shipping (flat rate) fulfillment options.
- Provide secure payment processing with Stripe integration.
- Enable admin to easily add/edit products and view orders with an **Impact Tracker**.

### Background Context

4050 sells homemade produce products (applesauce, apple butter, jams, jellies) born from two **heritage apple trees** in the backyard of the family home in the **Pacific Northwest**. What started as a solo, quiet endeavor to manage the bounty of these trees has grown into a mission of sharing. 

As the world has become harder, Ilene is looking to use her gifts—the smells of autumn, the warmth of a mason jar, and the comfort of homegrown food—to benefit those in need. The focus is on **"Homegrown with love for a purpose."**

**Key Simplifications & Strategic Refinements:**
- **Homemade Card:** A minimalist, "Kitchen Journal" style card that focuses on the honest story of what the garden provided.
- **Seeds of Kindness:** Customers pick a cause where their "seeds" are planted. $10 spent = 1 seed of kindness.
- **"Sow Extra Seeds":** A simple, no-pressure option for customers to add extra support to their chosen cause.
- **Basket Terminology:** Consistent use of "Basket" instead of "Cart" for a warmer, harvest-inspired feel.
- **Lean Operations:** Minimal pages and zero-friction checkout (Guest-first).

---

## Core Requirements

### Functional Requirements

**FR1:** Display a simple catalog of **Homemade Goods**. Each card tells an honest story of what the garden provided this season.

**FR2:** Allow customers to **"Add to Basket"** using a minimalist `+` icon without interrupting their browsing (non-intrusive toast feedback).

**FR3:** Allow customers to view their **Basket**, update quantities, and remove items.

**FR4:** Provide a straightforward Checkout that collects:
- Customer name, email, phone
- Fulfillment method (Local Pickup or Shipping)
- **The Share Choice:** A prompt asking: "Where would you like to plant your seeds today?"
- **Sow Extra Seeds:** Options to add extra margin (round up or set amount) which converts to more seeds for the chosen cause.
- Payment via Stripe

**FR5:** Automated impact calculation: The system calculates **Seeds of Kindness** (1 base seed + 1 per $10 shared) and tallies them for the chosen cause.

**FR6:** Thank you page that acknowledges the specific cause chosen and the "Seeds of Kindness" sown.

**FR7:** Admin "Impact Tracker": Admin can view orders and see the "Percentage of Growth" for each cause based on seeds sown, plus extra support funds.

**FR8:** Admin can add/edit/delete products (name, description, price, photo upload, availability).

**FR9:** Include an **About Page** that tells the story of the "Heritage Trees" and provides pickup details.

---

## User Flows

### Customer Purchase Flow

1. Browse **Homemade Goods** on `/shop` page.
2. Click the minimalist **`+` icon** to add products to your basket.
3. View your basket at `/basket`.
4. Click "Checkout".
5. Fill in contact info and select pickup or shipping.
6. **The Share Choice:** Select where to plant your seeds.
7. **Sow Extra Seeds:** Optional choice to amplify your impact.
8. Enter payment details via Stripe.
9. See thank you page acknowledging the seeds sown and the cause supported.

---

## Technical Simplifications

### Database Schema (Refocused)

**Product:**
- id, name, description, price, imageUrl, isAvailable, category

**Order:**
- id, customerName, customerEmail, customerPhone, shippingAddress, fulfillmentMethod
- **proceedsChoice**: The cause selected (ID)
- **extraSupportAmount**: Voluntary extra funds (cents)
- **seedCount**: Number of seeds sown ($10 = 1 seed)
- shippingCost, subtotal, total, paymentStatus, fulfillmentStatus, stripePaymentIntentId, createdAt

---

## Success Criteria

The 4050 Share is successful when:
1. A customer can browse homemade goods, add to basket, and checkout seamlessly as a guest.
2. The **Seeds of Kindness** logic correctly converts spend into community support.
3. Admin can see a clear visual tally of "Growth" for each community cause.
4. The "Homegrown" PNW backyard feeling is preserved throughout the digital experience.
