---
name: SpendSense Intelligence
colors:
  surface: '#FFFFFF'
  surface-dim: '#F0F6FF'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#434655'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#3755c3'
  on-secondary: '#ffffff'
  secondary-container: '#708cfd'
  on-secondary-container: '#00217a'
  tertiary: '#6a1edb'
  on-tertiary: '#ffffff'
  tertiary-container: '#8343f4'
  on-tertiary-container: '#f7edff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#dde1ff'
  secondary-fixed-dim: '#b8c4ff'
  on-secondary-fixed: '#001453'
  on-secondary-fixed-variant: '#173bab'
  tertiary-fixed: '#eaddff'
  tertiary-fixed-dim: '#d2bbff'
  on-tertiary-fixed: '#25005a'
  on-tertiary-fixed-variant: '#5a00c6'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
  border: '#E2E8F0'
  border-accent: '#BFDBFE'
  income: '#059669'
  expense: '#DC2626'
  warning: '#D97706'
  text-primary: '#0F172A'
  text-secondary: '#475569'
  text-muted: '#94A3B8'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Montserrat
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 36px
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
  caption:
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
  base: 4px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 40px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style

The design system is defined by the narrative of **"Predictive Clarity,"** reimagining the financial tracking experience from a passive ledger into a proactive, intelligent partner. It is designed to evoke a sense of high-security trust, precision, and forward-looking optimism. 

The chosen style is **Corporate Modern with Glassmorphism elements**. This approach utilizes a crisp, light-mode foundation to ensure accessibility and professional reliability, while strategically using translucent layers and vibrant cobalt accents to signify advanced AI capabilities. The interface prioritizes clean white space and high-contrast typography to make complex financial data immediately digestible.

**Key visual principles:**
- **Clarity over Complexity:** Use generous white space to prevent data-heavy screens from feeling overwhelming.
- **Intelligence Accents:** Reserve Royal Purple and soft blurs specifically for AI-driven insights and future-dated forecasts.
- **Trust-Focused:** Use a stable blue-based palette to reinforce financial security.

## Colors

The color strategy transitions the product into a **Light Mode** environment that emphasizes cleanliness and "High-Definition" financial visibility. 

- **Primary & Header**: The brand is anchored by **Royal Blue (#1E40AF)** for structural headers and **Cobalt Blue (#2563EB)** for primary actions. These blues provide a sense of institutional stability.
- **Surfaces**: The background uses a cool **#F8FAFC** to maintain a "crisp" feel, while primary cards are pure **#FFFFFF** to provide maximum elevation and separation.
- **AI Accent**: **Royal Purple (#7C3AED)** is the "Intelligence" color. It is used sparingly for predictive data, forecast lines, and machine-learning insights.
- **Semantic Logic**: Financial indicators are strictly binary for instant recognition: **Income Green (#059669)** for deposits and growth, and **Expense Red (#DC2626)** for outflows and warnings.

## Typography

This system employs a high-contrast typographic pairing to balance authority with utility.

- **Montserrat** provides geometric strength for display and headline levels. It is used exclusively for currency balances, screen titles, and primary headers to establish a bold brand voice.
- **Inter** acts as the functional workhorse. It is used for all body text, list items, and inputs, ensuring that dense financial data remains legible across all screen sizes.
- **Styling Notes**: Use `label-caps` for overline category titles or secondary metadata. All currency displays should use the `display-lg` (or mobile equivalent) to ensure financial totals are the most prominent element on the screen.

## Layout & Spacing

The design system utilizes a **Fluid Grid** model with a base-4 rhythm, ensuring consistent scaling between mobile and desktop environments.

- **Mobile**: A 4-column grid with 20px side margins. 
- **Desktop**: A 12-column grid with a maximum content width of 1200px and 40px margins.
- **Spacing Logic**: Vertical layout is managed through "Stacks." Use `stack-sm` (8px) for internal padding within components like chips or list items. Use `stack-md` (16px) for standard gaps between cards. Use `stack-lg` (24px) to separate major content sections (e.g., between the Hero Balance and the Transaction list).

## Elevation & Depth

In Light Mode, depth is achieved through **Tonal Layering** and **Soft Shadows**, moving away from the heavy blurs of the dark theme to maintain a "crisp" aesthetic.

- **Tier 0 (Background)**: The base floor using `#F8FAFC`.
- **Tier 1 (Surfaces)**: Primary interactive cards use a pure white surface (`#FFFFFF`) with a subtle 1px border (`#E2E8F0`) instead of heavy shadows for a clean, modern look.
- **Tier 2 (Interactive Elements)**: Floating buttons and active modals use a soft, highly diffused shadow (Blur: 24px, Opacity: 8%, Color: `#1E40AF`) to simulate physical lift without appearing muddy.
- **AI Layering**: Elements containing predictions or machine-learning data should incorporate a "Glass" effect: a semi-transparent surface with a `20px` backdrop blur and a thin `#BFDBFE` border to distinguish them as "intelligent" layers.

## Shapes

The shape language is **Rounded**, conveying an approachable and modern fintech personality.

- **Standard Radius (8px)**: Applied to most interactive elements, including primary buttons and input fields.
- **Large Radius (16px/24px)**: Used for major containers like Hero cards, Modal sheets, and bottom sheets to soften the interface's overall structure.
- **Pill Geometry**: Reserved for status badges (Income/Expense indicators) and filter chips to distinguish them from structural, square-cornered elements.

## Components

- **Buttons**:
    - **Primary**: Solid Cobalt Blue (`#2563EB`) with white text. Height should be 52px with 16px corner radius for a "sturdy" feel.
    - **Secondary**: Ghost style with a 1.5px border in `#BFDBFE`. Used for less urgent actions like "Export" or "Cancel."
- **Transaction Tiles**: Use a flex row on a white surface. Icons should be housed in a 44x44px circular container using `surface-dim` (`#F0F6FF`) to provide a soft background for category symbols.
- **Cards**: All cards must feature a 1px border (`#E2E8F0`) to ensure visibility against the light background. Hero cards should use a gradient of Royal Blue (`#1E40AF`) to Cobalt Blue (`#2563EB`).
- **Inputs**: Use a white background with a 1px border. On focus, the border transitions to Cobalt Blue with a 2px outer glow.
- **Progress Bars**: Used for budget tracking. The track uses `#E2E8F0` while the fill uses semantic colors (Green/Amber/Red) depending on the percentage of budget remaining.
- **AI Recommendation Cards**: These should be styled with a thin Purple border (`#7C3AED`) and a very faint purple tint background to indicate they are generated by the machine learning engine.