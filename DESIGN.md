---
name: AI Trip Planner
description: Bright, playful travel itinerary planner with map integration.
colors:
  primary: "#ff3f78"
  primary-light: "#ff6b95"
  neutral-bg: "#9de9f4"
  neutral-fg: "#0f3a64"
  hotel-active: "#f59e0b"
  card-active-bg: "rgba(255, 255, 255, 0.6)"
typography:
  display:
    fontFamily: "Kanit, sans-serif"
    fontSize: "clamp(2.0rem, 5vw, 4.0rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Kanit, sans-serif"
    fontSize: "1.0rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.primary-light}"
  card-itinerary:
    backgroundColor: "{colors.card-active-bg}"
    rounded: "{rounded.md}"
    padding: "12px"
---

# Design System: AI Trip Planner

## 1. Overview

**Creative North Star: "The Cheerful Explorer"**

The AI Trip Planner interface is designed to evoke excitement, joy, and wanderlust, matching the high-energy anticipation of planning a new trip. The visual language relies on a bright sky-to-aqua canvas, high-contrast coral/pink accents, friendly rounded geometry, and breezy floating animations that make the application feel alive and responsive.

The system rejects cold, generic corporate grays, sterile dashboard bento boxes, and heavy drop-shadows. Instead, it prioritizes a soft, clean aesthetic with generous white space and friendly, readable Thai typography (Kanit) to ensure planning remains a delightful, stress-free experience.

**Key Characteristics:**
- High-vibrancy sky-blue and cyan background washes.
- Soft, highly rounded geometry (`rounded-xl` or `12px+` radii).
- Energetic hot-pink and coral primary action triggers.
- Physics-driven, smooth sinusoidal floating animations (no tacky elastic bounces).

## 2. Colors

The color palette is inspired by tropical coastal shores, where sky-blue backgrounds meet warm pink highlights.

### Primary
- **Coral Pink** (#ff3f78): Used exclusively for main interactive actions, markers, and primary highlight highlights.
- **Bright Rose** (#ff6b95): Used as the hover state for primary pink elements.

### Neutral
- **Clear Sky** (#9de9f4): The main background wash of the application. It creates an airy, cheerful, and spacious look.
- **Deep Ink Navy** (#0f3a64): The primary text and typography color. It provides excellent legibility (exceeding WCAG AA contrast ratios) against clear sky washes.
- **Soft Cloud White** (#ffffff): Used for card surfaces and container sheets to frame content gracefully.

### Named Rules
**The 10% Coral Rule.** Primary Coral Pink is restricted to ≤10% of any screen surface. By keeping it rare, it serves as an immediate, high-priority beacon for user interaction.

## 3. Typography

**Display Font:** Kanit (sans-serif)
**Body Font:** Kanit (sans-serif)

**Character:** Kanit is a friendly, clean, modern sans-serif typeface that bridges Thai and Latin text seamlessly. It retains excellent legibility at small sizes while offering strong geometric presence in display headers.

### Hierarchy
- **Display** (Bold (700), clamp(2.0rem, 5vw, 4.0rem), 1.1): Reserved for primary landing headlines and hero callouts.
- **Headline** (Semi-Bold (600), 1.5rem, 1.2): Section headings, trip days, and map panel labels.
- **Title** (Medium (500), 1.2rem, 1.3): Card titles, hotel names, and list options.
- **Body** (Regular (400), 1.0rem, 1.5): Descriptive itinerary blocks, addresses, and details. Max line length is restricted to 65-75 characters to avoid reader fatigue.
- **Label** (Medium (500), 0.8rem, 1.2): Badges, category indicators, prices, and small buttons.

## 4. Elevation

The depth system is built around soft tonal layers and interaction-based highlights rather than heavy, structural drop-shadows.

Surfaces rest flat on the sky-blue canvas, blending with soft backgrounds. Depth is communicated during interaction, where elements scale slightly or gain a soft glowing shadow in response to state transitions.

### Named Rules
**The Flat-by-Default Rule.** All cards, panels, and lists rest flat on their background canvas. Shadows and borders only appear as responsive visual feedback when hovered or active.

## 5. Components

### Buttons
- **Shape:** Highly rounded corners (16px / `rounded-lg`).
- **Primary:** High-contrast Coral Pink with a white label, padded generously (`10px 20px`).
- **Hover:** Transitions smoothly using `ease-out-expo` to Bright Rose while lifting slightly (`translateY(-1px)`).

### Cards / Containers
- **Corner Style:** Extra-rounded corners (12px / `rounded-xl`).
- **Background:** White (`#ffffff`) at rest with subtle border outlines.
- **Hover/Selected:** Scales up slightly (`scale-[1.01]`) with a soft colored border outline matching the specific day or category theme (e.g., `border-pink-300 bg-pink-50/70`).

### Map Pins
- **Style:** Dynamic circular pins with a gradient of `#ff3f78` to `#ff6b95`, outlined by a thick white border (`3px solid #fff`).
- **Motion:** Active pins glide up and down smoothly using a physics-based gravitational curve (`globe-glide`).

## 6. Do's and Don'ts

### Do:
- **Do** maintain high typographic contrast (≥4.5:1 ratio) for Thai text using the Deep Ink Navy against sky-tinted backgrounds.
- **Do** use full-border outlines (`border border-amber-300`) and slight scales (`scale-[1.01]`) to indicate active items instead of thick colored side borders.
- **Do** implement a physics-based `globe-glide` animation utilizing individual cubic-bezier ease-out and ease-in curves for upward and downward movement.

### Don't:
- **Don't** use thick colored borders on one side of a card (`border-l-4`) as a selection indicator.
- **Don't** use generic corporate gray bento grids, saturated primary-color buttons, or heavy structural shadows.
- **Don't** use decorative glassmorphism or combine text gradients with transparent sheets.
- **Don't** apply bouncy or elastic animations to icons, images, or interactive cards.
