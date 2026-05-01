---
name: SmartAngan Design System
colors:
  surface: '#f7faf8'
  surface-dim: '#d7dbd9'
  surface-bright: '#f7faf8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f4f2'
  surface-container: '#ebeeed'
  surface-container-high: '#e6e9e7'
  surface-container-highest: '#e0e3e1'
  on-surface: '#181c1c'
  on-surface-variant: '#414844'
  inverse-surface: '#2d3130'
  inverse-on-surface: '#eef1f0'
  outline: '#717973'
  outline-variant: '#c1c8c2'
  surface-tint: '#3f6653'
  primary: '#012d1d'
  on-primary: '#ffffff'
  primary-container: '#1b4332'
  on-primary-container: '#86af99'
  inverse-primary: '#a5d0b9'
  secondary: '#486459'
  on-secondary: '#ffffff'
  secondary-container: '#c8e7d9'
  on-secondary-container: '#4c685d'
  tertiary: '#3f1d00'
  on-tertiary: '#ffffff'
  tertiary-container: '#5f2f00'
  on-tertiary-container: '#ea9147'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c1ecd4'
  primary-fixed-dim: '#a5d0b9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#274e3d'
  secondary-fixed: '#cae9db'
  secondary-fixed-dim: '#afcdc0'
  on-secondary-fixed: '#042018'
  on-secondary-fixed-variant: '#314c42'
  tertiary-fixed: '#ffdcc4'
  tertiary-fixed-dim: '#ffb781'
  on-tertiary-fixed: '#2f1400'
  on-tertiary-fixed-variant: '#6f3800'
  background: '#f7faf8'
  on-background: '#181c1c'
  surface-variant: '#e0e3e1'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 20px
  lg: 32px
  xl: 48px
  margin-mobile: 20px
  gutter: 16px
---

## Brand & Style

This design system establishes a visual language of "Organic Professionalism." It is designed to empower Anganwadi workers by balancing the clinical precision of healthcare with the nurturing warmth of community education. The aesthetic moves away from cold, institutional styles toward a human-centric approach that feels both expert and approachable.

The style leverages **Modernism** with a **Tactile** touch. It utilizes soft surfaces and high-clarity layouts to ensure that information is digestible even in high-stress or outdoor environments. The emotional response is one of stability and reliability—positioning the app as a dependable partner in the field.

## Colors

The palette is rooted in the natural world to evoke growth and health. 

- **Primary (Forest Green):** Used for key branding, primary actions, and headers to establish authority and trust.
- **Secondary (Sage):** Used for supportive UI elements and subtle highlights, providing a calming presence.
- **Tertiary (Terracotta):** Reserved for meaningful calls to action or educational highlights, grounding the app in earthy, human tones.
- **Neutrals (Sand & Warm Gray):** Replaces harsh blacks and whites to reduce eye strain and provide a premium, paper-like quality to the interface.

Maintain a minimum contrast ratio of 4.5:1 for all functional text. Use the Mint and Sand accents for background tints in cards to differentiate content sections without adding visual noise.

## Typography

The design system utilizes **Inter** for its exceptional legibility and systematic weight distribution. Given the mobile-first nature of the app, font sizes are slightly enlarged to accommodate outdoor viewing and diverse literacy levels.

Headlines use tighter letter spacing and heavier weights to create a strong information hierarchy. Body text is set with generous line height (1.5x) to ensure readability during rapid scanning. Labels use a medium or semi-bold weight to remain distinct when placed near larger body elements.

## Layout & Spacing

The layout follows a **fluid grid** model optimized for handheld devices. A 4-column grid is used for mobile, with a significant 20px side margin to prevent accidental palm touches on edge-to-edge screens.

The spacing rhythm is based on an 8px scale. Generous "breathable" margins (md/lg) are prioritized between functional groups to reduce cognitive load. Touch targets must never fall below 48px in height or width, ensuring accessibility for workers who may be using the device while multitasking or in motion.

## Elevation & Depth

This design system uses **Ambient Shadows** and **Tonal Layering** to create a sense of organized depth. Surfaces do not "float" aggressively; instead, they appear slightly lifted from the sand-colored background.

- **Level 1 (Cards):** Soft, diffused shadow with a subtle Sage-tinted hex (#708D81 at 8% opacity). Used for primary content containers.
- **Level 2 (Modals/Active States):** Increased blur radius and slightly higher opacity to indicate temporary focus.
- **Tonal Depth:** Use slight variations in background color (e.g., Sand to White) to denote hierarchy without relying solely on shadows. This maintains a clean, professional look that performs well in high-brightness environments.

## Shapes

The shape language is defined by "Rounded" geometry. This level of curvature (0.5rem base) removes the clinical "sharpness" of traditional software, making the app feel more inviting and safe.

- **Small Components (Checkboxes/Inputs):** 4px to 8px radius.
- **Medium Components (Buttons/Cards):** 16px (1rem) radius.
- **Large Components (Bottom Sheets):** 24px (1.5rem) radius on top corners.

Avoid perfectly circular "pill" shapes for buttons to maintain a professional, architectural feel; use the 1rem rounded-lg standard instead.

## Components

### Buttons
Primary buttons use the Forest Green background with White text. Secondary buttons use a Sage-tinted border with Sage text. All buttons must maintain a minimum height of 52px for mobile accessibility.

### Cards
Cards are the primary container. They should feature a white background, the Level 1 ambient shadow, and a 16px corner radius. Content inside cards should have a 16px internal padding.

### Input Fields
Inputs use a light Warm Gray border that thickens and changes to Forest Green on focus. Labels should always be visible (never placeholder-only) to assist with cognitive recall.

### Chips & Tags
Used for categorization (e.g., "Vaccination," "Nutrition"). Chips use the Mint accent color with Forest Green text for high-contrast legibility.

### Lists
List items should have a minimum vertical height of 64px. Use dividers in a very light Warm Gray (#E5E5E5) to separate items without breaking the visual flow.

### Additional Components
- **Progress Indicators:** Use the Terracotta color for "Active" or "Incomplete" steps to draw attention, and Forest Green for "Completed" tasks.
- **Bottom Navigation:** Large icons with clear text labels to ensure the primary navigation is unmistakable.