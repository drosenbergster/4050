# Handoff to Product Manager (John)
**Project:** 4050 Homemade Kindness  
**Refocus Theme:** Heartfelt Simplicity (No Gimmicks)  
**Date:** December 18, 2025

## 1. Core Vision Reset
The project has shifted from a generic "Marketplace" to a **Solo Stewardship** story. We are stripping away anything that feels "corporate," "cheesy," or "gimmicky." The focus is on **Ilene’s kitchen at 4050**, the **two ancient apple trees** in her backyard, and the act of **sharing** their bounty to support the community.

## 2. Terminology Guardrails (The "No-Gimmicks" Dictionary)
Use these terms consistently in all future User Stories and Acceptance Criteria:
- **"Homemade Goods"**: Use this for the product category (avoid "Backyard Bounty" or "Produce Marketplace").
- **"The Garden"**: The physical source of the products (Ilene's home at 4050).
- **"Basket"**: The customer's container (replace "Cart" or "Jars" everywhere in the UI).
- **"Add to Basket"**: The primary purchase action (no "Fill a Jar" or "Buy Now").
- **"Fill the Jar"**: Use this term *only* for the optional extra contribution at checkout.
- **"Impact Tracker"**: The admin view showing community support (replace "Bounty Tracker").

## 3. Key UX Strategic Shifts
- **Guest-First Checkout**: No account required. Messaging must be warm and straightforward.
- **Comfort Flow**: The checkout should feel like a conversation over a garden fence.
- **Non-Intrusive Feedback**: Use subtle toasts for "Added to Basket" (never auto-open the sidebar).
- **The Story Layer**: The Backyard Story (Two trees forced her hand) should be woven into the shopping experience, not just hidden on an About page.

## 4. Technical Requirements for Next Epic
- **Margin-Based Generosity**: Extra gifts are technically "Added Margin" (voluntary price increases).
- **Impact Fields**: The `Order` model must store `proceedsChoice` and `extraSupportAmount`.
- **Calculated Bounty**: The system must automatically calculate the extra margin generated per order for Ilene's Impact Tracker.

## 5. Immediate Priority: Epic 1 Refactoring
John, when you create the next stories, please focus on:
1. **Refactoring the Product Card**: Consolidation into a single `HomemadeCard` that tells the "Garden Story."
2. **Basket Renaming**: Updating all UI labels from "Cart" to "Basket."
3. **The Share Choice**: Implementing the simple cause selection and "Fill the Jar" option in checkout.

## 6. Maintenance Note
- **Admin Access**: Remind the team that Ilene's email needs to be added to `ADMIN_ALLOWED_EMAILS` in Vercel for her to access the Impact Tracker.

---
*Reference documents: `docs/prd.md`, `docs/architecture.md`, and `docs/STRATEGIC-REFOCUS-SUMMARY.md` for full details.*




