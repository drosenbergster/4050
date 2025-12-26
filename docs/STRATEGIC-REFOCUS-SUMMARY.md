# Strategic Refocus: Homemade Kindness
**Date:** December 2024  
**Status:** Approved for Implementation

## 1. Brand Heart: The PNW Heritage Garden
The brand is defined by **Homegrown Kindness.**
- **The Source:** Two **heritage apple trees** in the backyard of the family home (4050) in the Pacific Northwest.
- **The Vibe:** Solo endeavor, quiet kitchen, honest work, warmth and communal support.
- **The Product:** Simple mason jars, "What the garden provided." No gimmicks.

## 2. Straightforward Actions
The shopping experience is simple and heartfelt.
- **The Shop:** "From the Garden" (Homemade Goods).
- **The Action:** Minimalist `+` icon to add to basket.
- **The Choice:** "Where would you like to plant your seeds today?" — A final checkout step to support community causes.
- **"Seeds of Kindness":** Customers earn 1 base seed + 1 per $10 spent. More seeds = more help for that cause to "flourish."
- **"Sow Extra Seeds":** A simple, optional way to increase the impact through extra gifts.
- **Guest-First:** Clean, streamlined checkout with "No account required" messaging.

## 3. Technical Implementation: "Garden Math"
- **Seed-Based Support:** Spend is converted into "Seeds of Kindness" to determine monthly profit distribution.
- **Schema Updates:** The `Order` model includes `proceedsChoice`, `extraSupportAmount`, and `seedCount`.
- **Admin Seed Tracker:** Ilene sees a live tally of "Percentage of Growth" for each cause based on community seeds.
- **Lean Logic:** Automated calculations keep the solo endeavor easy to manage.

## 4. Completed Implementation Steps
1. **Refactored Product Components:** Consolidated into a minimalist `HomemadeCard` with "Kitchen Journal" styling.
2. **Updated Checkout UI:** Added the "Seeds of Kindness" dropdown and "Sow Extra Seeds" options.
3. **Database Migration:** Added `proceedsChoice`, `extraSupportAmount`, and `seedCount` to the Prisma schema.
4. **Admin View Update:** Added the **Seed Growth Tracker** cards and order-level seed details.
5. **Terminology Sweep:** Consistently used "Basket" and "Sowing" terminology throughout the app.

## 5. Maintenance Notes
- **Cause Management:** Update `lib/causes.ts` to change the organizations available for sowing.
- **Story Updates:** Keep product descriptions grounded in what the garden is currently providing.
