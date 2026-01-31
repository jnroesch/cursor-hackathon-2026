# Scharf Design System v1.0

A high-contrast, minimalist design system characterized by its "split-screen" layout, editorial serif typography, and monochromatic palette using subtle borders instead of shadows for depth.

> **Font Note:** This system uses [Playfair Display](https://fonts.google.com/specimen/Playfair+Display) for headings and [Inter](https://fonts.google.com/specimen/Inter) for body text. Both are free on Google Fonts.

---

## 1. Design Tokens

| Token | Value | Description |
|-------|-------|-------------|
| Primary Background | `#F4F4F4` | The soft grey main content area |
| Secondary Sidebar | `#0D0D0D` | The deep black right-hand utility panel |
| Accent Border | `#D1D1D1` | Thin, 1px lines used for UI separation |
| Primary Text | `#1A1A1A` | High legibility near-black for body copy |
| Muted Text | `#666666` | Greyed out metadata (e.g., dates, author) |
| Body Text | `#222222` | Standard body copy color |

---

## 2. Layout Principles

- **Asymmetric Balance:** Main content sits on a light canvas (`#F4F4F4`) while utility/metadata lives in a dark right-panel (`#0D0D0D`).
- **The "Left Rail":** A slim, icon-only navigation bar (approx. 60px wide) with hairline borders.
- **No Shadows:** Use hairline borders (`0.5px` or `1px`) for depth and separation instead of box shadows.

---

## 3. Typography Scale

### Headings
- **H1 (Article Title):** 48px - 56px | Serif (Playfair Display) | Medium Weight | `#1A1A1A`
- **Sub-headings:** 12px | Sans (Inter) | All Caps | Tracking: 0.1em | `#666666`

### Body
- **Body Text:** 18px | Sans (Inter) | Line Height: 1.6 | `#222222`

### Font Families
- **Headings:** Playfair Display (serif), fallback to Georgia
- **Body/UI:** Inter (sans-serif), fallback to system-ui

### Font Loading (Google Fonts)
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">
```

Or via CSS import:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@400;500;600;700&display=swap');
```

---

## 4. Component Specifications

### Admonitions / Callouts

Instead of colorful boxes, use the "Scharf" minimalist approach:

- **Note:** Left-border 2px, `#0D0D0D`, Sans-serif, italicized.
- **Tip:** Background `#FFFFFF`, thin border, icon prefix.

### Navigation Sidebar

- **Background:** `#FFFFFF` (Left) / `#0D0D0D` (Right)
- **Icons:** Thin-stroke (2pt), uniform size.
- **Active State:** Border-left 3px solid `#0D0D0D`.
- **Width:** 60px for icon-only rail

### Buttons

- **Primary:** Solid `#0D0D0D`, Text `#FFFFFF`, 0px border-radius.
- **Secondary:** Transparent, 1px border `#D1D1D1`, Text `#1A1A1A`.

### Links (Dark Panel)

- Color: `#FFFFFF`
- Text decoration: underline
- Underline offset: 4px
- Opacity: 0.8 (1.0 on hover)

### Code Blocks

- Background: `#1E1E1E`
- Border-radius: 0px (stay sharp!)
- Padding: 1.5rem
- Left border: 4px solid `#D1D1D1`

---

## 5. Utility Classes (Tailwind)

```html
<!-- Main content area -->
<main class="bg-brand-canvas text-text-primary">

<!-- Dark sidebar -->
<aside class="bg-brand-panel text-white">

<!-- Hairline divider -->
<div class="border-hairline border-brand-border">

<!-- Display heading -->
<h1 class="font-serif text-display">

<!-- Muted metadata -->
<span class="text-text-muted text-subheading uppercase">
```

---

## 6. File Structure

```
├── tailwind.config.js    # Tailwind configuration with design tokens
├── base.css              # CSS variables and base prose styles
└── DESIGN_SYSTEM.md      # This documentation file
```
