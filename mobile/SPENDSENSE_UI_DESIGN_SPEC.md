# 🎨 SpendSense — UI/UX & Logo Design Specification

A complete design specification document for **SpendSense** (Intelligent Personal Finance Analytics & Prediction System). Use this guide to design custom logos, visual assets, Figma mockups, and UI design systems.

---

## 📑 Table of Contents
1. [Brand Identity & Logo Design Guidelines](#1-brand-identity--logo-design-guidelines)
2. [Color Palette & Theme Tokens](#2-color-palette--theme-tokens)
3. [Typography & Iconography](#3-typography--iconography)
4. [Navigation Architecture](#4-navigation-architecture)
5. [Screen-by-Screen UI Blueprints](#5-screen-by-screen-ui-blueprints)
   - [Auth & Lock Screens](#-auth--lock-screens)
   - [Main 5 Tabs](#-main-5-tabs)
   - [Secondary Feature Screens](#-secondary-feature-screens)
6. [Component Library Specification](#6-component-library-specification)
7. [UI States & Edge Cases](#7-ui-states--edge-cases)

---

## 1. 🎨 Brand Identity & Logo Design Guidelines

### App Name
**SpendSense**  
*Tagline*: Intelligent Personal Finance & ML Expense Predictions

### Logo Concept Ideas & Symbolism
| Concept | Visual Symbol | Meaning / Vibe |
| :--- | :--- | :--- |
| **Concept A: The Sensing Coin / Ring** | A sleek metallic coin encircled by glowing neural network nodes or pulsing wave arcs | Blends money management with artificial intelligence / predictive sensing |
| **Concept B: The Growth Spark (`S` Monogram)** | Stylized double-letter **S** forming a trending upward arrow wrapped in a shield | Security, wealth growth, and smart financial direction |
| **Concept C: Modern Glassmorphic Wallet** | Minimalist geometry of overlapping translucent shapes with a glowing spark icon | Modern, premium, tech-forward aesthetic |

### Required Logo Export Formats & Dimensions
- **App Icon (Square)**: `1024 x 1024 px` (PNG, transparent & solid background variants)
- **Adaptive Android Icon**: `512 x 512 px` (Foreground mark + background color `#0F172A`)
- **Web Favicon**: `32 x 32 px` and `192 x 192 px`
- **Splash Screen Logo**: Vector SVG / `512 x 512 px` transparent PNG
- **Header Mark**: `40 x 40 px` horizontal lockup with text

---

## 2. 🎨 Color Palette & Theme Tokens

SpendSense uses a dual-mode palette with a **crisp Blue & White Theme** for Light Mode and a **Dark Slate Glassmorphism Theme** for Dark Mode.

### Primary Brand Palette
```
Primary Cobalt Blue #2563EB  (Buttons, Active Tabs, Highlights)
Primary Dark Blue   #1E40AF  (Hero Balance Cards, Headers)
Primary Light Blue  #EFF6FF  (Pill Backgrounds, Selected States)
Primary Border Blue #BFDBFE  (Subtle Card Borders)

Accent Royal Purple #7C3AED  (AI Insights, Predictions, Forecast Lines)
Accent Glow         rgba(124, 58, 237, 0.25)
```

### Semantic Financial Colors
```
Income Green       #059669  (Positive Balance, Deposits, Best-case savings)
Income Light       #D1FAE5

Expense Red        #DC2626  (Outflows, Over-budget warnings, Worst-case)
Expense Light      #FEE2E2

Warning Amber      #D97706  (Close to budget limit, Medium anomaly)
Warning Light      #FEF3C7
```

### Neutral Surface Tokens

#### Light Theme (Major Colors: Pure White & Royal Blue)
```
Background         #F8FAFC  (Crisp Cool Slate/White)
Primary Card       #FFFFFF  (Pure Clean White Card Surface)
Sub-Card / Pill    #F0F6FF  (Soft Ice Blue Tinted Surface)
Card Border        #E2E8F0  (Clean Subtle Divider)
Header Background  #1E40AF  (Rich Royal Blue Hero Banner)
Primary Text       #0F172A  (Deep Slate Navy)
Secondary Text     #475569  (Slate Grey Text)
Muted Text         #94A3B8  (Light Slate Text)
```

#### Dark Theme (Default)
```
Background         #0F172A  (Slate 900)
Card / Surface     #1E293B  (Slate 800)
Border / Divider   #334155  (Slate 700)
Primary Text       #FFFFFF  (Pure White)
Secondary Text     #94A3B8  (Slate 400)
Muted Text         #64748B  (Slate 500)
```

---

## 3. 🔤 Typography & Iconography

### Font Hierarchy
- **Display Bold**: `32px / 800 Weight` (Headings, Total Balance)
- **Title 1**: `24px / 700 Weight` (Screen Titles)
- **Title 2**: `18px / 700 Weight` (Section Headings, Card Headers)
- **Body Bold**: `15px / 600 Weight` (Item Titles, Amounts)
- **Body Regular**: `14px / 400 Weight` (Descriptions, Input text)
- **Caption / Meta**: `12px / 500 Weight` (Dates, Badges, Secondary labels)
- **Micro**: `10px / 700 Weight` (Category chips, Overline labels)

### Icon System
- **Navigation & Controls**: `@expo/vector-icons` (Ionicons / Feathers)
- **Categories**:
  - 🍔 **Food**: `#F59E0B`
  - 🚕 **Transport**: `#2563EB`
  - 🛒 **Shopping**: `#EC4899`
  - 💡 **Bills**: `#8B5CF6`
  - 🎮 **Entertainment**: `#14B8A6`
  - ❤️ **Health**: `#EF4444`
  - 📚 **Education**: `#6366F1`
  - 📦 **Other**: `#64748B`

---

## 4. 🗺️ Navigation Architecture

The app uses a **5-Tab Navigation Bar** at the bottom, while specialized tools (Scanner, SMS, Subscriptions, Forecast, Reports, Settings) live inside sub-routes linked directly from the **Transactions** and **Profile Hub** screens.

```
App Root Stack
├── Lock Screen (Biometric Authentication)
├── Auth Stack (Login / Signup)
└── Main Tab Navigator (5 Tabs)
    ├── Tab 1: Home Dashboard (Overview, Health Score, Recent, AI Card)
    ├── Tab 2: Transactions (Filterable list, Add Button, Receipt Scanner launch)
    ├── Tab 3: Analytics & Forecast (Historical trends, Pie Chart, ML Forecast line chart, Savings scenarios)
    ├── Tab 4: AI Predictions (Health Score, Anomaly Alert, Practical Ghanaian Tips)
    └── Tab 5: Profile Hub (Stats, Settings link, Subscriptions, SMS Import, Reports)
        │
        └── Sub-routes (Pushed screens):
            ├── Settings (Currency Picker Modal, Dark Mode, Notifications, Security)
            ├── Budget Tracker (Category progress bars, Overspending warnings)
            ├── Subscriptions Tracker (Auto-log overdue, 13 templates)
            ├── Receipt Scanner (Camera viewfinder, Gallery picker, Edit form)
            ├── SMS Import (Clipboard paste, MoMo/Bank auto-parser)
            └── CSV Reports (Period selector, Category breakdown, Sharing)
```

---

## 5. 📱 Screen-by-Screen UI Blueprints

### 🔒 Auth & Lock Screens

#### 1. Biometric Lock Screen (`lock.tsx`)
- **Header**: SpendSense icon + logo text.
- **Center**: Glowing lock circle (`100x100px`) with animated pulse.
- **Title**: "App is locked" — "Authenticate to continue".
- **Primary CTA**: Large gradient blue button ("Unlock with Face ID" / "Unlock with Fingerprint").
- **Footer**: Subtle fallback text ("You can also use your device PIN").

---

### 📱 Main 5 Tabs

#### Tab 1: Home Dashboard (`index.tsx`)
- **Header**: Dynamic greeting ("Good Morning 👋") + User name.
- **Hero Card**: Deep royal blue gradient card (`#1E40AF`) showing **Total Balance** (large `32px` crisp white text) and side-by-side **Income vs Expense** pill indicators.
- **Quick Actions Row**: 3 Pill Buttons (`Add Income 💰`, `Add Expense 💸`, `Budget 📊`).
- **Financial Health Score Widget**: Pure white card with blue accents, score gauge (`78/100`), colored progress bar, and status badge ("Good").
- **Recent Transactions Section**: Header with "See All" link + 5 transaction list items.
- **Spending Categories Pie Chart**: Interactive chart widget.
- **AI Recommendation Card**: Blue banner card (`#0C4A6E`) with white text and light blue border.

#### Tab 2: Transactions Screen (`transactions.tsx`)
- **Title**: "Transactions".
- **Filter Row**: Horizontal scroll chips (`All`, `💰 Income`, `💸 Expense`).
- **Dual Action Bar**:
  - `+ Add Transaction` (Primary Blue `#2563EB` button)
  - `🧾 Scan Receipt` (Emerald Green `#059669` button — direct camera launch)
- **Transaction List**: List item on pure white card (`#FFFFFF`) with soft blue icon container (`#F0F6FF`), title, date/category text, and right-aligned amount (`+GH₵` green / `-GH₵` red).
- **Interactive Action**: Long-press item to trigger Delete confirmation sheet.

#### Tab 3: Analytics & Forecast (`analytics.tsx`)
- **Title**: "Analytics & Forecast".
- **Top Metrics Row**: 3 White Cards (**Income**, **Expenses**, **Savings Rate %**).
- **Historical Monthly Line Chart**: Cobalt Blue Line Chart showing past 6 months.
- **Income vs Expense Bar Chart**: Comparative double bar chart on white surface.
- **Category Breakdown**: Pie chart + expandable category progress list.
- **Divider**: Visual section separator ("🔮 ML Expense Forecast").
- **Next Month Prediction Banner**: Large forecasted amount + trend badge (`📈 Rising` / `📉 Falling`).
- **4-Month Projected Line Chart**: Royal purple projection chart for upcoming months.
- **Savings Scenarios Widget**: 3 Progress rows (`Best Case -15%`, `Expected`, `Worst Case +15%`).

#### Tab 4: AI Predictions & Practical Advice (`predictions.tsx`)
- **Title**: "🤖 AI Analytics & Tips".
- **Prediction Cards**: Next month expected total + confidence badge (`High` / `Medium` / `Low`).
- **Financial Health Bar**: Score bar with personalized recommendation text.
- **Anomaly Detection Box**: Warning banner listing unusual high-value expenses.
- **Category Practical Tips List**: Real-world actionable suggestions:
  - 🚕 **Transport**: Short walks for short distances to cut trotro/ride-hailing costs.
  - 🍔 **Food**: Bulk foodstuffs purchase at Makola/Kejetia market.
  - 💡 **Bills**: ECG appliance management & LED lighting.
  - 🛒 **Shopping**: 48-hour pause rule before non-essential purchases.

#### Tab 5: Profile Hub (`profile.tsx`)
- **Avatar Banner**: Round royal blue avatar circle (`#2563EB`), user full name, and email.
- **Lifetime Stats Grid**: Pure white cards displaying Total Income, Total Expenses, Transaction count, Savings rate.
- **Navigation Options**:
  - ⚙️ **Settings** (Badge: current active currency e.g. `GHS (GH₵)`)
  - 📊 **Budget Tracker**
  - 🔄 **Subscriptions** (Badge: monthly recurring cost)
  - 🧾 **Receipt Scanner**
  - 📩 **SMS Import**
  - 📈 **Expense Forecast**
  - 📄 **Reports & CSV**
  - 💡 **Insights**
- **Footer**: `Sign Out` button (red ghost style) + Version tag.

---

### ⚙️ Secondary Feature Screens

#### Settings Screen (`settings.tsx`)
- **Top Bar**: `‹ Back` link + "Settings" title.
- **Preferences Card**:
  - 💱 **Currency Selector**: Opens bottom sheet modal to choose `GH₵ GHS`, `$ USD`, `€ EUR`, `£ GBP`, `₦ NGN`, `KSh KES`, `R ZAR`, `₹ INR`, `CA$ CAD`.
  - 🌙 **Dark Mode Toggle**: Smooth switch animation.
  - 🔔 **Push Notifications Toggle**
- **Security Card**:
  - 🔓 **Biometric Lock Switch**: Requires verification before activating.
- **About SpendSense Card**: System description & version details.

#### Subscriptions Screen (`subscriptions.tsx`)
- **Header**: Total monthly and yearly recurring expenditure cards.
- **Due Soon Banner**: Highlights bills due within 3 days.
- **Quick-Add Templates**: Scrollable chip bar (`Netflix 🍿`, `Spotify 🎵`, `MTN Bundle 📶`, `DSTV 📺`, `Gym 🏋️`, etc.).
- **Add Modal**: Cycle selector (`Daily`, `Weekly`, `Monthly`, `Yearly`), amount input, and next due date picker.

#### Receipt Scanner Screen (`receipt-scanner.tsx`)
- **Camera Viewfinder Mode**: Full-screen camera view with corner alignment guides, flip button, and photo capture button.
- **Gallery Mode**: Native image picker button.
- **Review & Edit Form Mode**: Pre-populated title, amount, category chips, and notes input before saving.

#### SMS Import Screen (`sms-import.tsx`)
- **Step-by-step Guide**: 4-step instructions on copying MoMo/Bank SMS text.
- **Text Area Input**: Multiline text box with `📋 Paste SMS` and `🔍 Analyze` buttons.
- **Auto-Extraction Form**: Detected transaction type (`Income` / `Expense`), parsed title, extracted amount, and category dropdown.

#### CSV Reports Exporter (`reports.tsx`)
- **Period Filter Chips**: `This Month`, `Last Month`, `Last 3 Months`, `All Time`.
- **Period Summary**: Total Income, Total Expenses, Net Balance, Savings Rate.
- **Category Progress Bars**: Percentage breakdown of expenses during period.
- **Primary Export Button**: `⬇️ Download CSV Report` (Downloads `.csv` directly on Web; opens native Share sheet on Mobile).

---

## 6. 🧱 Component Library Specification

| Component | Props / Structure | Visual Styling (Light Mode: Blue & White) |
| :--- | :--- | :--- |
| **`PrimaryButton`** | `label`, `onPress`, `isLoading`, `icon`, `color` | Height `52px`, Radius `16px`, Solid Royal Blue (`#2563EB`), Bold White text |
| **`SecondaryButton`** | `label`, `onPress`, `icon` | Height `48px`, Radius `14px`, Border `1.5px` (`#BFDBFE`), Pure White background, Blue text |
| **`TransactionTile`** | `title`, `amount`, `category`, `date`, `type` | Flex row, Pure White surface (`#FFFFFF`), `44x44px` Ice Blue icon container (`#F0F6FF`), `16px` radius |
| **`StatCard`** | `label`, `value`, `valueColor`, `subtext` | Pure White surface, Border `#E2E8F0`, Padding `16px`, Radius `18px`, Center aligned |
| **`FilterChip`** | `label`, `isSelected`, `onPress`, `icon` | Height `38px`, Radius `12px`, Border `1.5px`, Active state primary blue (`#2563EB`) with White text |
| **`ModalSheet`** | `visible`, `onClose`, `title`, `children` | Translucent overlay (`rgba(0,0,0,0.6)`), Pure White modal container, Top radius `28px`, Padding `24px` |
| **`ProgressBar`** | `progress` (0-100), `color`, `height` | Background `#E2E8F0`, Fill radius `8px` |

---

## 7. 🎭 UI States & Edge Cases

### 1. Loading States
- **Skeleton Shimmers**: Use light pulsing ice-blue/white blocks for Balance card and Transaction list items while fetching.
- **Button Loading**: Replace button text with centered `ActivityIndicator`.

### 2. Empty States
- **No Transactions**: Centered emoji `📭`, message "No transactions yet", and CTA button "+ Add First Transaction".
- **No Subscriptions**: Centered emoji `📋`, message "No recurring subscriptions tracked".

### 3. Error States
- **Biometric Failure**: Red alert banner ("Authentication failed. Try device PIN fallback").
- **Invalid CSV / Form**: Red input border highlight + inline error text.

---

*Use this document as your blueprint when designing in Figma, Illustrator, or crafting custom CSS/React Native styles for SpendSense!*
