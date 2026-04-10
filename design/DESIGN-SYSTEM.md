# Design System Document: Territorial Management & Institutional Oversight

## 1. Overview & Creative North Star: "The Digital Cartographer"

This design system is engineered for the serious work of territorial management. It rejects the "app-like" playfulness of consumer software in favor of a sophisticated, high-density editorial aesthetic. 

**The Creative North Star: The Digital Cartographer.**
The UI should feel like a high-end physical atlas or a master architectural plan. It is structured, authoritative, and precise. We move beyond the "template" look by using intentional white space, rhythmic typography, and a "No-Line" philosophy that defines structure through tonal shifts rather than rigid borders. The result is a platform that feels less like a database and more like a curated command center.

---

## 2. Colors & Surface Architecture

The palette is a dialogue between the calm of slate-tinted neutrals and the absolute authority of a deep Navy Blue.

### The Color Tokens
- **Primary (`#002046`):** The "Institutional Navy." Reserved for high-priority actions and signature navigation elements.
- **Surface & Background (`#f6fafe`):** A cool-tinted white that reduces eye strain during long periods of data management.
- **Secondary (`#515f74`):** A muted slate used for supporting information and secondary actions.
- **The Accents:** 
    - `on_tertiary_container` (`#3cafa2`): For "Approved" or success states.
    - `error` (`#ba1a1a`): For "Inactive" or critical alerts.

### The "No-Line" Rule
To achieve a premium feel, **1px solid borders for sectioning are prohibited.** You must define boundaries through background color shifts:
*   **Main Canvas:** `surface` (`#f6fafe`)
*   **Navigation Sidebar:** `surface_container_low` (`#f0f4f8`)
*   **Content Cards:** `surface_container_lowest` (`#ffffff`)
*   **Header/Utility Bars:** `surface_container` (`#eaeef2`)

### The "Glass & Gradient" Rule
For floating elements (modals, dropdowns, or hovering tooltips), use **Glassmorphism**. Apply `surface_container_lowest` at 85% opacity with a `20px` backdrop blur. 
*   **Signature Texture:** Primary CTAs should not be flat. Use a subtle linear gradient from `primary` (`#002046`) to `primary_container` (`#1b365d`) at a 135-degree angle to provide a "weighted" feel.

---

## 3. Typography: Editorial Authority

We use a dual-typeface system to balance modern precision with structural readability.

*   **Display & Headlines (Manrope):** Chosen for its geometric but authoritative character. Use `headline-lg` for page titles to establish a clear sense of place. The wider tracking in Manrope gives the system an "architectural" feel.
*   **Body & Labels (Inter):** Chosen for its exceptional legibility at high densities. All data tables, property lists, and administrative logs must use Inter.

**Hierarchy Strategy:**
- **Information Density:** Use `label-md` for metadata. Despite the small size, Inter’s x-height ensures readability.
- **Contrast:** Pair `title-lg` (Inter, Semi-bold) for card titles with `body-sm` (Inter, Regular) for descriptions to create a clear editorial hierarchy.

---

## 4. Elevation & Depth: Tonal Layering

Traditional drop shadows are too "cheap" for this system. We achieve depth through the **Layering Principle.**

*   **Tonal Stacking:** An inner data table sits on `surface_container_high` (`#e4e9ed`) while the surrounding page content sits on `surface` (`#f6fafe`). This creates "insets" rather than "lifts."
*   **Ambient Shadows:** If an element must float (e.g., a map marker or a context menu), use an extra-diffused shadow:
    *   *Shadow:* `0 12px 32px -4px rgba(23, 28, 31, 0.06)` (Tinted with `on_surface`).
*   **The "Ghost Border" Fallback:** If a container requires a border for accessibility (e.g., in a high-contrast mode or complex form), use `outline_variant` (`#c4c6cf`) at **20% opacity**. Never use a 100% opaque border.

---

## 5. Components

### Buttons & Inputs
*   **Primary Button:** Gradient (`primary` to `primary_container`), `8px` radius, white text. High-contrast and authoritative.
*   **Secondary/Ghost:** `surface_container_high` background. No border. Subtle hover transition to `surface_container_highest`.
*   **Input Fields:** `surface_container_lowest` background. Use a bottom-only 2px "indicator line" in `outline_variant` that transitions to `primary` on focus.

### The Badge System (Institutional Stamps)
Badges should feel like official stamps. Use a semi-transparent background with high-contrast text.
*   **Status Badges:**
    *   *Draft:* `secondary_container` / `on_secondary_container` (Muted Slate).
    *   *In Review:* `primary_fixed` / `primary` (Navy Blue).
    *   *Approved:* `tertiary_fixed` / `on_tertiary_fixed_variant` (Teal/Green).
    *   *Inactive:* `error_container` / `on_error_container` (Soft Red).
*   **Role Badges:** Use `label-sm` with all-caps styling and `1px` letter spacing. Role badges should always use the `surface_variant` background to remain neutral and not compete with status colors.

### Cards & Lists
*   **Forbid Divider Lines:** Separate list items using vertical white space (use the `md` 12px or `lg` 16px scale). 
*   **Zebra Striping:** For high-density tables, use a subtle shift between `surface` and `surface_container_low` every other row.

### Territorial Map Overlay (Custom Component)
For map-based management, overlays should use the "Glassmorphism" rule. Floating controls should be nested in `surface_container_lowest` with a `xl` (1.5rem) corner radius to differentiate them from the `8px` "working" UI.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use asymmetrical layouts for dashboards. A large primary map/chart area offset by a smaller, high-density data sidebar.
*   **Do** lean into `surface_container` shifts to group related information.
*   **Do** use `headline-sm` for section headers to maintain an "institutional" tone.

### Don’t
*   **Don’t** use pure black (#000000) for text. Use `on_surface` (`#171c1f`) to maintain the slate-navy sophistication.
*   **Don’t** use shadows on buttons. Let the color weight and gradient provide the "clickability" signifier.
*   **Don’t** use icons without labels in primary navigation. This is a professional tool; clarity precedes minimalism.