---
trigger: always_on
description: "Master UI/UX, Design Tokens, Component Styling, and Universal Responsiveness Rulebook for all frontend interfaces."
---

# Master UI/UX & Style Rulebook

This document is the **single source of truth** for all visual design, layout architecture, component styling, responsiveness, and interaction standards across the project. 

Every frontend interface, component, refactor, or modification **must strictly comply** with these rules. No arbitrary exceptions, hardcoded overrides, or unapproved aesthetic divergences are permitted.

---

## 1. Core Philosophy & Design Identity

### 1.1 Distinctive Visual Identity
* **Aesthetic Tone**: Warm, tactile, professional, and editorial. The interface balances high data density with calm, readable aesthetics.
* **Anti-AI Tropes Mandate**:
  * ❌ **NO** generic purple/blue neon gradients.
  * ❌ **NO** unprompted glassmorphism (`backdrop-filter: blur()`).
  * ❌ **NO** glowing box-shadows or floating decorative orb elements.
  * ❌ **NO** repetitive, generic card-grid spam when tabular or structured lists serve users better.
  * ❌ **NO** decorative badges or icons without functional meaning.
* **Form Follows Function**: Every line, border, color tint, and container must have an explicit domain purpose.

### 1.2 Decision Pre-Flight Rule
Before writing or modifying any UI code:
1. Identify the **target persona & workflow** (e.g., Platform Admin, Office Admin, Tenant, Member).
2. Prioritize **clarity and ergonomics** over visual ornamentation.
3. Verify that the component works gracefully on both a **360px mobile viewport** and a **2560px ultra-wide display**.

---

## 2. Design System Tokens (CSS Custom Properties)

All styles **must** reference these CSS variables. **Never write raw hex codes, raw rgb values, or arbitrary pixel widths inside component rules.**

### 2.1 Core Palette Tokens
```css
:root {
  /* Canvas & Surfaces */
  --color-bg: #F7F4F0;                 /* Warm Cream / Ivory (App Background) */
  --color-surface: #EFECE6;            /* Soft Oatmeal / Beige (Cards & Containers) */
  --color-surface-white: #FFFFFF;      /* Clean White (Inputs, Active Cards, Popovers) */
  --color-surface-hover: #E7E2D9;      /* Subtle Hover Surface */

  /* Typography Colors */
  --color-text-primary: #1F1D1A;       /* Deep Espresso / Charcoal (Headings & Body) */
  --color-text-muted: #7A736B;         /* Warm Taupe / Gray-Brown (Captions & Subtitles) */
  --color-dark: #26201D;               /* Rich Dark Brown (Dark Banners & Footers) */

  /* Borders & Dividers */
  --color-border: #E3DDD3;             /* Soft Warm Border (Standard Dividers/Outlines) */
  --color-border-subtle: #EDE7DE;      /* Ultra-light Hairline Divider */
  --color-border-strong: #D5CECE;      /* Emphasized Active/Input Border */

  /* Primary Interactive Brand Accent */
  --color-accent: #9E5334;             /* Terracotta / Rust (Primary CTA / Active) */
  --color-accent-hover: #854327;       /* Deep Burnt Sienna (Hover State) */
  --color-accent-active: #6E361E;      /* Pressed Active State */
  --color-accent-light: #F5EAE4;       /* Tinted Accent Wash */

  /* Semantic Feedback & Status Quads */
  --color-success: #235F42;
  --color-success-bg: #E8F2EC;
  --color-success-border: #C8E2D2;

  --color-danger: #962F2F;
  --color-danger-bg: #FBEBEB;
  --color-danger-border: #F1C8C8;

  --color-warning: #8C5E14;
  --color-warning-bg: #FAF2E3;
  --color-warning-border: #EEDCBD;

  --color-info: #355C7D;
  --color-info-bg: #EBF2F7;
  --color-info-border: #C8DCE9;
}
```

### 2.2 Workspace Identity Themes
Different panels use targeted accent tokens while maintaining project-wide harmony:
```css
/* 1. Platform Admin */
body[data-workspace="platform"], body.ws-platform {
  --panel-accent: #9E5334;
  --panel-accent-light: #F5EAE4;
  --panel-accent-hover: #EBD8CD;
}

/* 2. Super Admin */
body[data-workspace="super-admin"], body.ws-super-admin {
  --panel-accent: #713B2B;
  --panel-accent-light: #F2E7E1;
  --panel-accent-hover: #E3CEBF;
}

/* 3. Tenant Workspace */
body[data-workspace="tenant"], body.ws-tenant {
  --panel-accent: #B77942;
  --panel-accent-light: #F8EFE3;
  --panel-accent-hover: #EEDCC8;
}

/* 4. Office Workspace */
body[data-workspace="office"], body.ws-office {
  --panel-accent: #65734B;
  --panel-accent-light: #EEF0E5;
  --panel-accent-hover: #D8DDC7;
}

/* 5. Office Admin */
body[data-workspace="office-admin"], body.ws-office-admin {
  --panel-accent: #A34F43;
  --panel-accent-light: #F6E9E6;
  --panel-accent-hover: #EBCBCA;
}

/* 6. Office Config */
body[data-workspace="office-config"], body.ws-office-config {
  --panel-accent: #78618A;
  --panel-accent-light: #F0EBF4;
  --panel-accent-hover: #DFD3EB;
}
```

### 2.3 Radii, Shadows & Elevation
```css
:root {
  /* Corner Radii */
  --radius-xs: 4px;                    /* Tags, Badges, Micro-chips */
  --radius-sm: 6px;                    /* Buttons, Form Inputs, Dropdown Menus */
  --radius-md: 8px;                    /* Cards, Modals, Popovers */
  --radius-lg: 12px;                   /* Nested Sheet Containers, Hero Panels */
  --radius-full: 9999px;               /* Circular Avatars, Pill Buttons */

  /* Elevation (Warm Tinted Shadows) */
  --shadow-xs: 0 1px 2px rgba(31, 29, 26, 0.04);
  --shadow-sm: 0 1px 3px rgba(31, 29, 26, 0.06), 0 1px 2px rgba(31, 29, 26, 0.04);
  --shadow-md: 0 4px 12px rgba(31, 29, 26, 0.07), 0 2px 4px rgba(31, 29, 26, 0.04);
  --shadow-lg: 0 12px 28px rgba(31, 29, 26, 0.10), 0 4px 8px rgba(31, 29, 26, 0.05);

  /* Shell Layout Dimensions */
  --sidebar-width: 256px;
  --sidebar-collapsed-width: 68px;
  --topbar-height: 60px;
  --content-max-width: 1400px;

  /* Transitions */
  --transition-fast: 0.15s cubic-bezier(0.16, 1, 0.3, 1);
  --transition-normal: 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

## 3. Typography & Text Hierarchy

### 3.1 Font Stacks
* **Primary Sans-Serif**: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;`
* **Monospace**: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;` (strictly for IDs, hashes, telemetry, and numerical alignment).

### 3.2 Typography Scale & Pairings
| Token / Level | Font Size | Line Height | Letter Spacing | Font Weight | Typical Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display / H1** | `clamp(24px, 4vw, 32px)` | 1.2 | `-0.02em` | `600` | Page Titles, Key Landing Headings |
| **H2 / Section** | `clamp(20px, 3vw, 24px)` | 1.25 | `-0.015em` | `600` | Section Headers, Modal Headings |
| **H3 / Subtitle**| `18px` | 1.3 | `-0.01em` | `600` | Card Headers, Panel Group Titles |
| **Body Large** | `16px` | 1.5 | `normal` | `400` / `500` | Lead paragraphs, Hero body text |
| **Body Regular** | `14px` | 1.5 | `normal` | `400` / `500` | Main interface text, Form labels, Table cells |
| **Caption / Small**| `12px` | 1.4 | `0.01em` | `500` | Helper text, Table headers, Badges |
| **Micro / Meta** | `11px` | 1.3 | `0.02em` | `500` | Status indicators, Timestamps, Breadcrumbs |

### 3.3 Weight Discipline
* Only 3 weights are permitted: **Regular (`400`)**, **Medium (`500`)**, and **Semi-bold (`600`)**.
* ❌ Avoid using `700`, `800`, or `900` bold weights, which distort the warm editorial aesthetic.

---

## 4. Spacing, Sizing & The Spatial Grid

### 4.1 Base 4px/8px Spacing Tokens
Use consistent spacing tokens to maintain vertical and horizontal rhythm:
* `--space-1`: `4px` (Tight padding, badge gaps)
* `--space-2`: `8px` (Icon gaps, compact button padding)
* `--space-3`: `12px` (Input padding, dropdown gaps)
* `--space-4`: `16px` (Standard component inner padding, card gaps)
* `--space-6`: `24px` (Major card padding, section gap)
* `--space-8`: `32px` (Page section spacing)
* `--space-12`: `48px` (Major layout structural division)

### 4.2 Spatial Layout Rules
* **Parent Gap over Child Margins**: Always use `gap: var(--space-*)` on flex and grid containers. Never rely on cascading `margin-bottom` or `margin-right` on child elements.
* **Text Truncation Defense**: Any flex item containing text that might truncate (`text-overflow: ellipsis`) **must** declare `min-width: 0;` on its flex container to prevent flex blowing past viewport boundaries.

---

## 5. Universal Responsiveness Mandate

Every single UI component, layout, modal, table, and form control **must adapt fluidly** across all screen sizes.

### 5.1 Viewport Breakpoints
```css
/* Mobile Viewports */
@media (max-width: 639px) { ... }

/* Tablet Viewports */
@media (min-width: 640px) and (max-width: 1023px) { ... }

/* Laptop / Desktop Viewports */
@media (min-width: 1024px) and (max-width: 1439px) { ... }

/* Wide Desktop Viewports */
@media (min-width: 1440px) { ... }
```

### 5.2 Responsive Standard Specifications
1. **Fluid Containers & Boundaries**:
   * Never declare fixed pixel widths on layout containers (e.g., `width: 900px` is **forbidden**).
   * Always use `max-width`, percentages, and flex-wrapping:
     ```css
     .container {
       width: 100%;
       max-width: var(--content-max-width);
       margin-inline: auto;
       padding-inline: 16px;
     }
     @media (min-width: 768px) {
       .container { padding-inline: 24px; }
     }
     ```
   * Enforce universal box sizing:
     ```css
     *, *::before, *::after {
       box-sizing: border-box;
     }
     ```

2. **Data Tables & Wide Views**:
   * All tables must be encased in a dedicated overflow container:
     ```css
     .table-responsive {
       width: 100%;
       overflow-x: auto;
       -webkit-overflow-scrolling: touch;
       border: 1px solid var(--color-border);
       border-radius: var(--radius-md);
     }
     ```
   * Table headers must support sticky behavior when scrolling vertically: `position: sticky; top: 0; z-index: 1;`.
   * On mobile screens (`< 640px`), table action buttons must remain accessible without requiring erratic multi-directional scrolling.

3. **Touch Target Sizing**:
   * On touch devices (`@media (pointer: coarse)` or `< 640px`), interactive targets (buttons, icon toggles, select options, checkboxes) must have a minimum clickable area of **36px – 44px**.

4. **Modals, Drawers & Overlays**:
   * Modals must never clip offscreen:
     ```css
     .modal-content {
       width: 90vw;
       max-width: 580px;
       max-height: 90vh;
       overflow-y: auto;
       margin: auto;
       border-radius: var(--radius-md);
     }
     ```
   * Modal forms must automatically stack into single-column layouts on mobile viewports (`flex-direction: column;`).

---

## 6. Interactive State Machine

Every interactive element (buttons, cards, links, inputs, rows) must have explicit styles defined for **all 6 fundamental states**:

```
┌─────────────────────────────────────────────────────────────┐
│                      STATE MACHINE                          │
├─────────────┬─────────────┬─────────────┬───────────────────┤
│ 1. Rest     │ 2. Hover    │ 3. Active   │ 4. Focus-Visible  │
├─────────────┼─────────────┼─────────────┴───────────────────┤
│ 5. Disabled │ 6. Feedback │ (Loading, Empty, Error, Success)│
└─────────────┴─────────────┴─────────────────────────────────┘
```

1. **Rest**: Clean baseline appearance using semantic design tokens.
2. **Hover**:
   * Subtle color shift (`background-color: var(--color-surface-hover)` or `var(--color-accent-hover)`).
   * Pointer cursor (`cursor: pointer`).
   * Never hide essential controls behind hover on mobile/touch interfaces.
3. **Active / Pressed**:
   * Subtle physical compression: `transform: translateY(1px);`.
4. **Focus-Visible (Mandatory Accessibility)**:
   * **Never** use `outline: none` without providing an immediate `:focus-visible` replacement.
   * Standard Focus Ring:
     ```css
     :focus-visible {
       outline: 2px solid var(--color-accent);
       outline-offset: 2px;
     }
     ```
5. **Disabled**:
   * `opacity: 0.5;`
   * `cursor: not-allowed;`
   * `pointer-events: none;` on inner child elements.
6. **Feedback States**:
   * **Loading / Pending**: Shimmer skeleton animations using `--color-surface` and `--color-surface-hover`.
   * **Empty State**: Clear contextual graphic/icon, distinct explanatory title, informative subtext, and a direct primary CTA button.
   * **Error State**: Inline validation message with an icon, paired with `border-color: var(--color-danger);`. Never rely solely on red color without text explanation.

---

## 7. Component Blueprints & Patterns

### 7.1 Buttons (`.btn`)
* **Base Anatomy**:
  ```css
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px 16px;
    height: 38px;
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 500;
    line-height: 1;
    cursor: pointer;
    border: 1px solid transparent;
    transition: var(--transition-fast);
    white-space: nowrap;
  }
  ```
* **Variants**:
  * `.btn-primary`: Background `var(--color-accent)`, Text `#FFFFFF`, Hover `var(--color-accent-hover)`.
  * `.btn-secondary`: Background `var(--color-surface-white)`, Border `var(--color-border)`, Text `var(--color-text-primary)`.
  * `.btn-outline`: Background `transparent`, Border `var(--color-border)`, Hover `var(--color-surface)`.
  * `.btn-ghost`: Background `transparent`, Border `transparent`, Hover `var(--color-surface)`.
  * `.btn-danger`: Background `var(--color-danger)`, Text `#FFFFFF`, Hover `#7D2626`.
* **Icon-Only Buttons & Action Triggers**:
  * Aspect ratio `1:1`, fixed dimensions (e.g. `32px × 32px`, `36px × 36px`, or `48px × 48px`).
  * Must include an `aria-label` or `title` for screen readers.
  * **Icon Centering Rule (Mandatory)**: Always ensure icons and glyphs are strictly and perfectly centered inside their containers (`display: flex; align-items: center; justify-content: center; margin: 0; padding: 0; line-height: 1;`). Never permit icons to be off-center, misaligned, or skewed by typographical baseline drift or unbalanced paddings. Prefer normalized SVG vectors with explicit viewboxes and zero margins.

### 7.2 Form Controls (`.form-control`, `.input`, `.select`)
* Height standards: **Small (`32px`)**, **Medium/Default (`38px–40px`)**, **Large (`46px`)**.
* Background: `var(--color-surface-white)`.
* Border: `1px solid var(--color-border)`.
* Focus: `border-color: var(--color-accent); box-shadow: 0 0 0 3px var(--color-accent-light);`.
* Labels: Always positioned above or clearly paired; font-size `12px–13px`, font-weight `500`, color `var(--color-text-primary)`.

### 7.3 Cards & Containers (`.card`)
* Background: `var(--color-surface)` or `var(--color-surface-white)`.
* Border: `1px solid var(--color-border)`.
* Border Radius: `var(--radius-md)`.
* Shadow: `var(--shadow-xs)` or `var(--shadow-sm)`.
* Padding: `16px` on mobile, `20px–24px` on desktop.

### 7.4 Badges & Status Pills (`.badge`, `.pill`)
* Padding: `2px 8px`.
* Border Radius: `var(--radius-full)`.
* Font Size: `11px–12px`; weight `500`.
* Must utilize semantic quads (e.g., `.badge-success` uses `var(--color-success-bg)`, `var(--color-success)`, `var(--color-success-border)`).

---

## 8. Accessibility (A11y) & Inclusive Design

1. **Contrast Standard**:
   * Text vs. background must satisfy **WCAG AA** minimum contrast ratios:
     * Minimum **4.5:1** for regular body text.
     * Minimum **3:1** for large headings (≥ 18px bold or ≥ 24px regular).
     * Minimum **3:1** for interactive UI borders and icons.
2. **Semantic Elements**:
   * Use `<button>` for clickable triggers, `<a>` for page navigations. Never attach click handlers to unstyled `<div>` or `<span>` without full ARIA and keyboard handling.
   * Structure pages using `<header>`, `<nav>`, `<main>`, `<aside>`, `<section>`, and `<footer>`.
3. **Keyboard Operability**:
   * All actionable items must be reachable via the `Tab` key and triggerable via `Enter` or `Space`.
   * Overlays and dropdown menus must close when the `Escape` key is pressed.
4. **Motion Preference**:
   * Honor user settings for reduced motion:
     ```css
     @media (prefers-reduced-motion: reduce) {
       *, *::before, *::after {
         animation-duration: 0.01ms !important;
         animation-iteration-count: 1 !important;
         transition-duration: 0.01ms !important;
         scroll-behavior: auto !important;
       }
     }
     ```

---

## 9. Strict CSS Implementation & Hygiene Rules

1. **Tokens Only**: Never introduce ad-hoc color codes (e.g., `#2b2b2b`, `rgba(0,0,0,0.5)`). Reference the tokens defined in Section 2.
2. **No `!important`**: Never use `!important` to force overrides. Manage specificity through clean cascade structure and selector hierarchy.
3. **Selector Nesting Depth**: Keep CSS selectors clean and shallow (maximum 3 levels of nesting).
4. **Zero Cumulative Layout Shift (CLS)**: Always reserve explicit aspect ratios or minimum heights on images, icons, and dynamic asynchronous containers.

---

## 10. The Forbidden Anti-Patterns (Thou Shalt Not)

* ❌ **Never** hardcode container widths in pixels (`width: 750px` → use `max-width: 750px; width: 100%;`).
* ❌ **Never** permit uncontained horizontal viewport scrolling.
* ❌ **Never** remove browser outline without providing a visible `:focus-visible` ring.
* ❌ **Never** use unstyled, raw browser alert dialogs (`window.alert`) for production interactions.
* ❌ **Never** leave asynchronous operations without loading skeletons or visual state indicators.
* ❌ **Never** display truncated text without providing access to the full content via a tooltip or expansion.
* ❌ **Never** introduce dark/light mode hacks that bypass the central CSS custom property system.

---

## 11. Pre-Flight Delivery Checklist

Before marking any UI task, component, or screen as complete, verify that every item below passes:

- [ ] **Responsiveness Check**: Tested across 360px (mobile), 768px (tablet), 1280px (laptop), and 1920px (desktop) with zero horizontal page blowout.
- [ ] **Token Purity**: Every color, shadow, border radius, and spacing value references a `--color-*`, `--radius-*`, or `--space-*` CSS variable.
- [ ] **Full State Coverage**: Checked and styled for Default, Hover, Active, Focus-Visible, and Disabled states.
- [ ] **Table & Grid Overflow Handling**: Data tables and wide elements are wrapped in responsive containers with touch-smooth scrolling.
- [ ] **Keyboard & A11y Navigation**: Navigable using `Tab` and `Shift+Tab`, activatable via `Enter`/`Space`, with high-contrast `:focus-visible` indicators.
- [ ] **Aesthetic Integrity**: Adheres strictly to the warm editorial aesthetic (Ivory / Oatmeal / Espresso / Terracotta), completely free of generic AI-generated visual clichés.
