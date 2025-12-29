# Story 3.2: Garden Layout Sandbox

## Story

**As an** admin planning the heritage orchard garden  
**I want** a visual sandbox where I can design raised bed layouts and place crops  
**So that** I can optimize space, plan future changes, and document where things are actually planted

---

## Status: Complete

---

## Context

The Garden Planner already has:
- Growing Calendar (timeline view showing crops with harvest/planting phases)
- Potential Harvest calculator (plant counts × yield per unit)
- Crops management (CRUD operations)
- Seasonal tasks with checklist

This story adds a **spatial planning dimension** — a visual canvas where the user can:
1. Brainstorm future garden layouts (add/remove/rearrange beds)
2. Lock in "this year's actual garden" as a saved layout
3. Visualize plant spacing and optimize space usage

---

## Acceptance Criteria

### 1. Canvas & Grid
- [ ] 50ft × 50ft canvas (600" × 600")
- [ ] Grid at 12" increments (1 sq ft cells)
- [ ] Grid displayed as subtle intersection dots (very light, not overwhelming)
- [ ] Zoom in/out controls (mouse wheel or buttons)
- [ ] Pan/drag to move around canvas

### 2. Raised Beds
- [ ] Create new beds by clicking "Add Bed" then drawing/placing on canvas
- [ ] Set dimensions by:
  - Typing width × length (in feet or inches)
  - Dragging corner handles to resize
- [ ] Move beds by click-and-drag
- [ ] Rotate beds in 90° increments (button or keyboard shortcut)
- [ ] Delete beds
- [ ] Beds have a distinct fill color (earthy brown) with subtle border

### 3. Crop Placement
- [ ] Crop palette/sidebar showing available crops (from Crop database)
- [ ] Drag crop from palette onto canvas OR click to place
- [ ] Crops can be placed **anywhere** on canvas (inside or outside beds)
  - Some crops like raspberries, sorrel, potatoes may grow outside raised beds
- [ ] Each placed crop shows:
  - Small dot/icon for the plant center (uses crop's color)
  - Semi-transparent circle showing spacing radius
- [ ] Same crop can be placed multiple times
- [ ] Click to select a placed crop, then delete or move it
- [ ] Freely positioned (no grid snapping required)

### 4. Spacing & Overlap Warnings
- [ ] Each Crop has new `spacingInches` field (pre-populated with recommended values)
- [ ] Spacing circle radius = `spacingInches / 2`
- [ ] When circles overlap:
  - Show gentle red/pink tint on overlapping circles
  - Allow placement anyway (warning only, not blocking)

### 5. Layout Management
- [ ] Multiple named layouts (e.g., "2025 Actual", "New Bed Ideas", "Scratch")
- [ ] Save/Load layouts from database
- [ ] Create new layout (prompts for name)
- [ ] Rename layout
- [ ] Delete layout (with confirmation)
- [ ] Layouts are independent from calendar/yield tracking (no sync to plantCount)
- [ ] First visit: Show empty state with "Create Your First Layout" button

### 6. Plant Summary Key
- [ ] Sidebar or panel showing crops used in current layout
- [ ] For each crop placed:
  - Crop name with color dot
  - Count of plants placed
  - Expected yield (count × yieldPerUnit from Crop model)
- [ ] Only shows crops that appear in current layout
- [ ] Updates in real-time as crops are added/removed

### 7. Print/Export
- [ ] "Print" button generates print-friendly view
- [ ] Optional: Export as PNG/image

### 8. Tab Integration
- [ ] New "Layout Sandbox" tab in Garden Planner (alongside Calendar and Harvest)

---

## Data Model Changes

### Updated: Crop Model
```prisma
model Crop {
  // ... existing fields ...
  spacingInches  Int?  @default(12)  // Recommended spacing between plants in inches
}
```

### New: GardenLayout Model
```prisma
model GardenLayout {
  id          String   @id @default(uuid())
  name        String
  canvasData  Json     // Stores beds and placed crops
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("garden_layouts")
}
```

**canvasData JSON structure:**
```json
{
  "beds": [
    {
      "id": "bed-uuid-1",
      "x": 100,
      "y": 50,
      "width": 96,
      "height": 48,
      "rotation": 0
    }
  ],
  "plants": [
    {
      "id": "plant-uuid-1",
      "cropId": "uuid-of-tomato-crop",
      "x": 120,
      "y": 70
    }
  ]
}
```

---

## Pre-populated Spacing Data

Migration should add `spacingInches` to existing crops:

| Crop | spacingInches | Notes |
|------|---------------|-------|
| Tomatoes | 24 | Indeterminate varieties |
| Peppers | 18 | Can be tighter for small varieties |
| Cucumbers | 12 | On trellis; 36" if sprawling |
| Green Beans | 6 | Bush beans |
| Peas | 3 | Tight spacing, they like company |
| Basil | 12 | Can harvest-thin to 18" |
| Parsley | 9 | |
| Sorrel | 12 | Spreads over time |
| Raspberries | 30 | In rows 6ft apart |
| Blueberries | 60 | Bushes need room |
| Apples | 180 | Dwarf rootstock (15ft) |
| Plums | 180 | Semi-dwarf spacing (15ft) |

---

## UI Design

### Tab Layout
```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🌱 Garden Planner    [Calendar] [Harvest] [Layout Sandbox]              │
├─────────────────────────────────────────────────────────────────────────┤
```

### Sandbox Layout
```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  Layout: [2025 Actual ▼]  [+ New]  [Rename]  [🗑️]     [Print] [Export]  │
│                                                                         │
│ ┌──────────────┬────────────────────────────────────────────────────┐  │
│ │ 🌿 CROPS     │                                                    │  │
│ │              │    · · · · · · · · · · · · · · · · · · · · ·       │  │
│ │ 🍅 Tomatoes  │    · · · · · · · · · · · · · · · · · · · · ·       │  │
│ │ 🌶️ Peppers   │    · · ┌─────────────────┐ · · · · · · · · ·       │  │
│ │ 🥒 Cucumbers │    · · │ ░░░░░░░░░░░░░░░ │ · · · · · · · · ·       │  │
│ │ 🫛 Peas      │    · · │ ░░🍅○░░░🍅○░░░░ │ · · · · · · · · ·       │  │
│ │ 🌿 Basil     │    · · │ ░░░░░░░░░░░░░░░ │ · · · · · · · · ·       │  │
│ │ ...          │    · · │ ░░░🍅○░░░░░░░░░ │ · · · · · · · · ·       │  │
│ │              │    · · └─────────────────┘ · · · · · · · · ·       │  │
│ │ ──────────── │    · · · · · · · · · · · · · · · · · · · · ·       │  │
│ │ BEDS         │    · · · · · · 🫐○ · · · · · · · · · · · · ·       │  │
│ │ [+ Add Bed]  │    · · · · · · · · · · · · · · · · · · · · ·       │  │
│ │              │    · · · · · · · · · · · · · · · · · · · · ·       │  │
│ │ ──────────── │                                                    │  │
│ │ 📊 SUMMARY   │                                    [−] 100% [+]    │  │
│ │              │                                                    │  │
│ │ 🍅 Tomatoes  │                                                    │  │
│ │   3 plants   │                                                    │  │
│ │   ~6 lbs     │                                                    │  │
│ │              │                                                    │  │
│ │ 🫐 Blueberry │                                                    │  │
│ │   1 bush     │                                                    │  │
│ │   ~8 lbs     │                                                    │  │
│ └──────────────┴────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

Legend: ░ = raised bed fill, ○ = spacing circle (faded), 🍅 = plant dot
```

---

## API Endpoints

### Garden Layouts
- `GET /api/admin/layouts` - List all layouts
- `POST /api/admin/layouts` - Create layout
- `GET /api/admin/layouts/[id]` - Get layout
- `PATCH /api/admin/layouts/[id]` - Update layout (name or canvasData)
- `DELETE /api/admin/layouts/[id]` - Delete layout

### Crops (existing, minor update)
- Existing endpoints unchanged
- `spacingInches` field included in responses

---

## Technical Considerations

### Canvas Library Options
Consider using one of:
- **Konva.js** - React-friendly canvas library with built-in drag/drop
- **Fabric.js** - Full-featured canvas library
- **React-Konva** - React bindings for Konva
- **Plain SVG** - Simpler, but more manual work for interactions

Recommendation: **React-Konva** for its React integration and good drag/drop support.

### State Management
- React state for current layout editing
- Save to DB on explicit "Save" button (not auto-save, to allow scratch experimentation)
- Or: Auto-save with debounce after changes

### Zoom/Pan
- Transform matrix on canvas container
- Mouse wheel for zoom
- Click-drag on empty space to pan

### Print/Export
- CSS `@media print` for print view
- `canvas.toDataURL()` or library method for PNG export

---

## Implementation Phases

### Phase 1: Canvas + Beds
- Set up canvas with grid
- Add/resize/move/rotate/delete beds
- Basic layout CRUD (save/load)

### Phase 2: Crop Placement
- Crop palette sidebar
- Place crops on canvas
- Spacing circles with overlap detection

### Phase 3: Polish
- Summary panel with counts and yields
- Print/export functionality
- Zoom/pan controls
- Empty state and onboarding

---

## Out of Scope (Future)
- Paths, trees, house outlines, other garden elements
- Companion planting suggestions
- Succession planting visualization
- Mobile/touch optimization (desktop-first for MVP)
- Undo/redo history
- Version history for layouts
- Sync with plantCount in Crop model

---

## Definition of Done
- [ ] Canvas renders with subtle grid dots
- [ ] Can create, move, resize, rotate, delete beds
- [ ] Can place, move, delete crops from palette
- [ ] Spacing circles display with overlap warnings
- [ ] Multiple layouts can be saved/loaded/renamed/deleted
- [ ] Summary panel shows crop counts and expected yields
- [ ] Print functionality works
- [ ] New tab appears in Garden Planner
- [ ] `spacingInches` field added to Crop model with pre-populated data
- [ ] No console errors
- [ ] Responsive on desktop (tablet nice-to-have)

---

## Change Log
| Date | Change | Author |
|------|--------|--------|
| 2025-12-28 | Initial draft from PM discussion | PM |

