# Story 4.1a: Natural Ingredient Entry

## Overview
**Epic:** Cookbook & Recipe Management
**Status:** ✅ Complete
**Created:** December 28, 2025
**Completed:** December 28, 2025
**Depends On:** None
**Enables:** Story 4.1b (Batch-First Recipe Model)

## User Story
As Ilene (Mom), I want to type ingredients naturally—like writing on a recipe card—so I can quickly capture recipes without fighting dropdown menus.

## Problem Statement
The current recipe entry requires selecting ingredients one-by-one from a dropdown menu, then entering quantities separately. This is tedious and interrupts the natural flow of recipe capture. Ilene wants to type `2 cups sugar` and move on.

## Acceptance Criteria

### Natural Text Entry
- [ ] Replace dropdown ingredient selection with **text input field**
- [ ] User types in format: `[amount] [unit] [ingredient name]`
- [ ] Examples: `2 cups sugar`, `5 lbs apples`, `1/2 tbsp cinnamon`
- [ ] Support fractional amounts: `1/2`, `1/4`, `3/4`, `1/3`, `2/3`
- [ ] Support common units: cups, tbsp, tsp, lbs, oz, each, quarts, pints, gallons

### Multi-Line Ingredient Input
- [ ] Text area for ingredients (not individual row fields)
- [ ] Each line = one ingredient
- [ ] Enter/Return moves to next line
- [ ] Parse lines in real-time (on blur or keystroke pause)
- [ ] Show validation feedback inline:
  - ✓ Green check + source icon when matched
  - ⚠️ Yellow when ingredient is new (needs source)
  - ❌ Red if line can't be parsed

### Autocomplete from Existing Ingredients
- [ ] As user types ingredient name portion, show dropdown suggestions
- [ ] Match on partial text (e.g., "cin" matches "Cinnamon")
- [ ] Show source icon in suggestions (🌱 Garden, 🏪 Pantry, 📦 Packaging)
- [ ] Tab or click to accept suggestion and complete the line
- [ ] Escape to dismiss suggestions

### Inline New Ingredient Creation
- [ ] When typed ingredient doesn't match any existing, show inline prompt
- [ ] Prompt appears below the line: `"nutmeg" is new — what's the source?`
- [ ] Quick tap buttons: `🌱 Garden` | `🏪 Pantry` | `📦 Packaging`
- [ ] After source selection:
  - Ingredient is created in library (name + source, cost defaults to 0)
  - Line shows as validated (green check + source icon)
  - Focus returns to text area for next ingredient
- [ ] **No modal interruption** — user stays in typing flow
- [ ] New ingredient requires only: **name** + **source**

### Keyboard-Friendly Flow
- [ ] Tab through suggestions
- [ ] Enter accepts highlighted suggestion
- [ ] Typing continues to filter suggestions
- [ ] Can type full ingredient without selecting (triggers "new" flow if no match)

## Technical Implementation

### New File: Ingredient Parser

**`lib/ingredient-parser.ts`**

```typescript
export interface ParsedIngredient {
  amount: number;
  unit: string;
  name: string;
  rawLine: string;
  matchedIngredientId?: string;
  isNew?: boolean;
  parseError?: string;
}

export function parseIngredientLine(line: string): ParsedIngredient | null {
  // Returns null for empty lines
  // Parses: "2 cups sugar" → { amount: 2, unit: "cups", name: "sugar" }
  // Handles fractions: "1/2 tbsp cinnamon" → { amount: 0.5, unit: "tbsp", name: "cinnamon" }
}

export function parseFraction(str: string): number {
  // "1/2" → 0.5
  // "1 1/2" → 1.5
  // "2" → 2
  // "2.5" → 2.5
}

export function normalizeUnit(unit: string): string {
  // "tablespoon" → "tbsp"
  // "tablespoons" → "tbsp"
  // "T" → "tbsp"
  // "cup" → "cups"
  // etc.
}

export const KNOWN_UNITS = [
  'cups', 'cup',
  'tbsp', 'tablespoon', 'tablespoons', 'T',
  'tsp', 'teaspoon', 'teaspoons', 't',
  'lbs', 'lb', 'pounds', 'pound',
  'oz', 'ounces', 'ounce',
  'each', 'ea',
  'quarts', 'quart', 'qt',
  'pints', 'pint', 'pt',
  'gallons', 'gallon', 'gal',
];
```

### New Component: IngredientTextInput

**`app/admin/components/ingredient-text-input.tsx`**

```tsx
interface IngredientTextInputProps {
  value: string;  // Raw text (multiline)
  onChange: (value: string) => void;
  existingIngredients: Ingredient[];
  parsedIngredients: ParsedIngredient[];  // For display feedback
  onCreateIngredient: (name: string, source: IngredientSource) => Promise<Ingredient>;
}

// Features:
// - Textarea with line-by-line parsing
// - Autocomplete dropdown positioned near cursor
// - Inline "add new" UI when ingredient not found
// - Visual feedback per line (icons on right side)
```

### Files to Modify

| File | Changes |
|------|---------|
| `lib/ingredient-parser.ts` | **NEW** — Parse natural text to structured data |
| `app/admin/components/ingredient-text-input.tsx` | **NEW** — Text input with autocomplete |
| `app/admin/components/cookbook.tsx` | Update `RecipeEditorModal` to use new input |
| `app/api/admin/cogs/ingredients/route.ts` | Ensure POST works for minimal data (name + source) |

### API Considerations

The existing `POST /api/admin/cogs/ingredients` should already support creating with just name + source. Verify:
- `unitCost` defaults to 0 if not provided
- `unit` can default to "each" or be omitted for new inline ingredients

## UX Design

### Ingredient Input Area

```
┌─────────────────────────────────────────────────────────┐
│ Ingredients (type naturally, one per line)              │
├─────────────────────────────────────────────────────────┤
│ 20 lbs apples                                    ✓ 🌱   │
│ 4 cups sugar                                     ✓ 🏪   │
│ 2 tbsp cinnamon                                  ✓ 🏪   │
│ 1/2 tsp nut|                                            │
│    ┌────────────────────────────────┐                   │
│    │ 🏪 Nutmeg                      │ ← autocomplete    │
│    │ 🏪 Nutritional Yeast           │                   │
│    └────────────────────────────────┘                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### New Ingredient Flow

```
User types: "1/2 tsp cardamom" (not in library)
Line shows: "1/2 tsp cardamom                        ⚠️"

Below line:
┌─────────────────────────────────────────────────────────┐
│ "cardamom" is new — what's the source?                  │
│                                                         │
│   [🌱 Garden]    [🏪 Pantry]    [📦 Packaging]          │
└─────────────────────────────────────────────────────────┘

User clicks "Pantry"

Line updates: "1/2 tsp cardamom                      ✓ 🏪"
Cardamom added to ingredient library
```

### Edge Cases

| Scenario | Behavior |
|----------|----------|
| Empty line | Ignored (no error) |
| Just a number: `2` | Parse error — show red, hint "add unit and ingredient" |
| No amount: `sugar` | Allow? Or require amount? **Decision: Require amount** |
| Unknown unit: `2 handfuls basil` | Treat "handfuls" as unit, accept it |
| Duplicate ingredient on two lines | Allow (user may have meant it) |

## Testing Notes

- [ ] Parse `1/2` → 0.5
- [ ] Parse `1 1/2` → 1.5  
- [ ] Parse `2.5` → 2.5
- [ ] Parse `1/3` → 0.333...
- [ ] Normalize `tablespoon` → `tbsp`
- [ ] Normalize `pounds` → `lbs`
- [ ] Autocomplete filters as user types
- [ ] Tab selects first suggestion
- [ ] New ingredient creates with correct source
- [ ] Works on mobile (virtual keyboard)
- [ ] Paste multiple lines works

## Definition of Done

- [x] Text area replaces dropdown for ingredient entry
- [x] Parser handles fractions and common units
- [x] Autocomplete shows existing ingredients
- [x] New ingredients can be created inline (name + source)
- [x] Visual feedback shows parse status per line
- [x] Keyboard navigation works (Tab, Enter, Escape)
- [x] Existing recipe editing still works
- [x] Mobile-friendly experience

---

## Dev Agent Record

### File List

| File | Action | Description |
|------|--------|-------------|
| `lib/ingredient-parser.ts` | Created | Parser for natural text ingredient entry |
| `app/admin/components/ingredient-text-input.tsx` | Created | Text input component with autocomplete |
| `app/admin/components/cookbook.tsx` | Modified | Integrated new text input into RecipeEditorModal |

### Change Log

| Date | Changes |
|------|---------|
| 2025-12-28 | Created ingredient parser with fraction support, unit normalization, and ingredient matching |
| 2025-12-28 | Created IngredientTextInput component with autocomplete and inline new ingredient creation |
| 2025-12-28 | Replaced dropdown-based ingredient selection with natural text input in RecipeEditorModal |

### Agent Model Used
Claude Opus 4.5

### Completion Notes
- Parser supports fractions (1/2, 1/4, 1 1/2), decimals, and whole numbers
- Unit aliases normalize variations (tablespoon → tbsp, pounds → lbs)
- Autocomplete shows top 5 matches from ingredient library
- Inline prompt for new ingredients captures just name + source
- Visual feedback shows ✓ for matched, ⚠️ for new, ❌ for parse errors
- Keyboard navigation: Tab/Enter to select, Escape to dismiss, Arrow keys to navigate
