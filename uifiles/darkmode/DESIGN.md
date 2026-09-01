---
name: SpendSense Intelligence
colors:
  surface: '#051424'
  surface-dim: '#051424'
  surface-bright: '#2c3a4c'
  surface-container-lowest: '#010f1f'
  surface-container-low: '#0d1c2d'
  surface-container: '#122131'
  surface-container-high: '#1c2b3c'
  surface-container-highest: '#273647'
  on-surface: '#d4e4fa'
  on-surface-variant: '#c3c6d7'
  inverse-surface: '#d4e4fa'
  inverse-on-surface: '#233143'
  outline: '#8d90a0'
  outline-variant: '#434655'
  surface-tint: '#b4c5ff'
  primary: '#b4c5ff'
  on-primary: '#002a78'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#0053db'
  secondary: '#d2bbff'
  on-secondary: '#3f008e'
  secondary-container: '#6001d1'
  on-secondary-container: '#c9aeff'
  tertiary: '#bec6e0'
  on-tertiary: '#283044'
  tertiary-container: '#656d84'
  on-tertiary-container: '#eef0ff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#eaddff'
  secondary-fixed-dim: '#d2bbff'
  on-secondary-fixed: '#25005a'
  on-secondary-fixed-variant: '#5a00c6'
  tertiary-fixed: '#dae2fd'
  tertiary-fixed-dim: '#bec6e0'
  on-tertiary-fixed: '#131b2e'
  on-tertiary-fixed-variant: '#3f465c'
  background: '#051424'
  on-background: '#d4e4fa'
  surface-variant: '#273647'
  income-green: '#059669'
  expense-red: '#DC2626'
  warning-amber: '#D97706'
  slate-800: '#1E293B'
  slate-700: '#334155'
  ice-blue: '#F0F6FF'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  title-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
  body-bold:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 22px
  body-reg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.05em
  display-lg-mobile:
    fontFamily: Montserrat
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 40px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style
The design system for SpendSense is built on the narrative of **"Predictive Clarity."** It positions the app as an intelligent, high-security financial partner that doesn't just track history but illuminates the future. The target audience includes tech-savvy professionals and proactive savers who value data-driven insights.

The design style is **Modern Corporate with Glassmorphism**. This aesthetic utilizes deep, slate-based backgrounds to establish a sense of security and depth, while translucent "glass" layers and vibrant cobalt accents signify cutting-edge AI technology. The interface is characterized by high contrast in financial indicators, generous padding, and a refined use of blurs to maintain focus on critical balance data.

## Colors
The color strategy employs a **Dark Default** mode to maximize the "glass" effects and highlight AI-driven data points. 

- **Primary Cobalt (#2563EB)**: Used for high-priority actions, active states, and brand reinforcement.
- **Accent Royal Purple (#7C3AED)**: Exclusively reserved for AI insights, machine learning predictions, and future-dated forecast lines.
- **Semantic Logic**: Financial indicators follow a strict binary: **Income Green (#059669)** for growth and deposits, and **Expense Red (#DC2626)** for outflows and warnings. 
- **Neutrality**: The background utilizes **Slate 900 (#0F172A)**, providing a stable, high-contrast base for white typography and vibrant accent colors.

## Typography
The typography system uses a high-contrast pairing to balance impact with legibility. 

**Montserrat** is used for display and headline levels, specifically for currency balances and screen titles, providing a bold, geometric authority. **Inter** is the workhorse for all UI elements, inputs, and body text, ensuring maximum readability for complex financial data.

For mobile-specific views, the primary balance display (`display-lg`) scales down to `display-lg-mobile` to ensure the currency symbols and large totals remain within the viewport without breaking. Use all-caps with increased letter spacing for the `label-caps` role to denote category overlines and secondary metadata.

## Layout & Spacing
This design system utilizes a **Fluid Grid** model with a base-4 rhythm. On mobile devices, the layout uses a 4-column grid with 20px side margins and 16px gutters. For desktop/web views, this expands to a 12-column grid with a maximum content width of 1200px.

Spacing is categorized by "Stacks":
- **Stack-sm (8px)**: Internal padding for chips and small list items.
- **Stack-md (16px)**: Standard gutter between cards and vertical spacing between related elements.
- **Stack-lg (24px)**: Generous spacing between distinct sections (e.g., separating the Hero Balance card from the Recent Transactions list).

## Elevation & Depth
Depth is conveyed through **Glassmorphism** and **Tonal Layering**. In the dark theme, the background is the lowest tier (`#0F172A`). 

- **Level 1 (Surfaces)**: Primary cards use `#1E293B` with a subtle 1px border (`#334155`) to create separation.
- **Level 2 (Interactive/Glass)**: Modals and floating elements use a semi-transparent background (`rgba(30, 41, 59, 0.7)`) with a `20px` backdrop blur. 
- **AI Accents**: Elements related to predictions use a soft purple glow (`rgba(124, 58, 237, 0.15)`) instead of standard shadows to signify "intelligent" depth.
- **Shadows**: When used, shadows are extremely diffused (Blur: 24px, Opacity: 30%) and tinted with the background Navy to avoid a "dirty" gray appearance.

## Shapes
The shape language is consistently **Rounded**, reflecting a modern, approachable, yet structured fintech product.

- **Standard Elements**: Buttons and Input fields use a `0.5rem (8px)` radius.
- **Large Containers**: Hero cards and Modal sheets use `rounded-lg (16px)` or `rounded-xl (24px)` to soften the visual impact of data-heavy screens.
- **Interactive Pill**: Filter chips and status badges use a fully rounded/pill-shaped geometry to distinguish them from structural cards.

## Components
- **Buttons**: The `PrimaryButton` is a solid Cobalt Blue with white text, featuring a high-gloss finish when used on AI screens. The `SecondaryButton` uses a ghost style with a `#BFDBFE` border.
- **Transaction Tiles**: These must feature a circular icon container using `ice-blue` at 10% opacity, providing a soft background for category-specific icons.
- **Cards**: Use a subtle inner border (1px) that is slightly lighter than the card surface to simulate a "beveled" glass edge.
- **Inputs**: Field backgrounds should be slightly darker than the surface level (`#0F172A`) with a Cobalt Blue border appearing only on focus.
- **Charts**: Use "Income Green" and "Expense Red" for historical data, but switch to a dashed line style or "Royal Purple" for any data points occurring in the future (Predictions).
- **Glass Sheets**: All bottom sheets must include a "handle" indicator and a significant backdrop blur to maintain the glassmorphic theme.