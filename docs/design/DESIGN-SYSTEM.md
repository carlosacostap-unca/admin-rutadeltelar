# Design System Specification: The Modern Archivist Strategy

## 1. Overview & Creative North Star
This design system is built upon the Creative North Star of **"The Modern Archivist."** 

Unlike generic admin dashboards that rely on sterile whites and grey borders, this system treats the interface as a premium, tactile environment. It balances the authority of a legacy institution with the fluid efficiency of a modern digital tool. We achieve this through "Tactile Authority"—using a parchment-inspired palette to ground the user, and deep navy accents to drive action. 

The layout breaks the "template" look by favoring intentional asymmetry. Dashboards should not be perfectly mirrored; instead, use varying card widths and "floating" utility panels to create a rhythmic, editorial flow that feels curated rather than generated.

---

## 2. Colors & Tonal Architecture
The palette is designed to reduce ocular fatigue while maintaining high-contrast functional areas.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or containment. 
Boundary definition must be achieved through:
1.  **Background Shifts:** Use `surface-container-low` for secondary sidebar areas and `surface` for the main canvas.
2.  **Shadow-Depth:** Using the elevation principles in Section 4.
3.  **Negative Space:** Increasing the padding between logical groups to create "invisible" borders.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of fine paper. 
*   **Base Layer:** `surface` (#ecd2b4) as the signature parchment for wide-scale backgrounds.
*   **Secondary Layer:** `surface-container-low` (#e3c2a4) for grouping related content, creating a subtle inset.
*   **Emphasis Layer:** `surface-variant` (#d5b99b) for icon backgrounds or decorative elements requiring higher contrast against lower surface containers.
*   **Action Layer:** `surface-container-highest` (#f9dec0) for interactive cards or highlighted data points.
*   **The "Glass" Rule:** For floating modals or navigation overlays, use `surface-bright` (#fbf2e6) with a 70% opacity and a `20px` backdrop-blur. This creates a "frosted glass" effect that keeps the institutional background visible while focusing the user.

### Signature Textures
Main CTAs and Hero sections should utilize a subtle linear gradient: 
*   **Direction:** 135 degrees.
*   **From:** `primary_container` (#1a496b).
*   **To:** `primary` (#0f324b).
This subtle shift adds "soul" and depth to buttons, preventing them from looking like flat digital stickers.

---

## 3. Typography: The Editorial Voice
We use **Manrope** for its geometric clarity and institutional weight.

*   **Display (lg/md):** Used for primary data storytelling (e.g., total assets, user counts). Use `ExtraBold` weight with `-0.02em` letter spacing.
*   **Headline (sm/md):** Used for section titles. These should feel like newspaper headings—authoritative and clear.
*   **Title (sm):** Used for card headings. Always use `SemiBold` in the `primary` color (#0f324b) to ensure immediate scanability.
*   **Body (md):** Our workhorse. Use `Regular` weight in `on_surface_variant` (#42474d) for long-form descriptions to soften the reading experience.
*   **Label (md/sm):** Reserved for metadata, subtitles, and badges. Use `Bold` and `all-caps` with `0.05em` letter spacing. Use `primary` (#0f324b) instead of neutral text colors to create a stronger cohesive brand identity when paired with Display headings.

---

## 4. Elevation & Depth
Depth is not a stylistic choice; it is a functional tool for hierarchy.

*   **Tonal Layering:** Avoid shadows for static elements. Place a `surface_container_lowest` (#ffffff) card on a `surface_dim` (#f0d6b8) background to create a "natural lift."
*   **Ambient Shadows:** For "floating" elements (Modals, Popovers), use extra-diffused shadows.
    *   **Y-offset:** 8px | **Blur:** 24px.
    *   **Color:** `#261906` at 6% opacity. 
    *   *Note: Never use pure black shadows. Using the "on-surface" tint ensures the shadow feels like it’s being cast on parchment, not a screen.*
*   **The "Ghost Border" Fallback:** If a border is required for accessibility (e.g., in high-density data tables), use the `outline_variant` token at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Buttons (High-Contrast Focus)
*   **Primary:** Background: `primary_container` (#1a496b); Text: `surface` (#ecd2b4). This matching text-to-background color creates a premium "stencil" or "cutout" effect against the parchment. Radius: `md` (0.375rem).
*   **Secondary:** Background: Transparent; Border: `Ghost Border` (15% opacity); Text: `primary_container`.
*   **Interaction:** On hover, primary buttons should shift to `primary` (#0f324b) with a subtle `2px` vertical lift.

### Status & Role Badges
*   Use `full` (9999px) roundedness.
*   **Institutional Pattern:** Use a container-and-text approach. For a "Success" state, use a background of `secondary_container` (#d8e4f2) with `primary` (#0f324b) text. This keeps the look "Institutional" rather than "Christmas Tree" (avoiding bright reds/greens unless they are critical errors).

### Input Fields
*   **Styling:** No bottom line. Use a solid `surface_container_highest` background with a `md` radius.
*   **Focus State:** Transition the background to `surface_container_lowest` and apply a 1px `primary` ghost border.

### Cards & Data Lists
*   **No Dividers:** Prohibit the use of horizontal lines between list items. 
*   **Separation:** Use `8px` of vertical white space and a subtle background hover shift to `surface_container_low`.
*   **Layout:** Use asymmetrical padding (e.g., `padding-left: 32px`, `padding-right: 24px`) to create a more custom, editorial feel.

---

## 6. Do's and Don'ts

### Do:
*   **Embrace the Parchment:** Use the warm background to your advantage. Let the "white space" be "parchment space."
*   **Layer Intentionally:** Always ask "can I separate these sections with a color shift instead of a line?"
*   **Optical Alignment:** In institutional design, labels often need to be optically centered. Trust your eyes over the auto-layout grid.

### Don't:
*   **No Pure Black:** Never use #000000. Use `on_primary_fixed` (#0a2233) for your darkest tones.
*   **No Sharp Corners:** Avoid `none` or `sm` radius for cards. Use `md` (0.375rem) or `lg` (0.5rem) to maintain a modern, friendly institutional feel.
*   **No Default Shadows:** Never use the standard CSS `box-shadow: 0 2px 4px rgba(0,0,0,0.5)`. It destroys the premium parchment aesthetic.