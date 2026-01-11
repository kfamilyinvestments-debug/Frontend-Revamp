# Design Guidelines: Australian Car Cost Comparison Calculator

## Design Approach: Clean Financial Utility

**Selected System**: Material Design 3 principles adapted for financial clarity
**Justification**: Information-dense financial calculator requiring trust, clarity, and efficient data comparison. Users need to understand complex calculations quickly without visual distraction.

**Core Principles**:
- Clarity over creativity - every element serves calculation transparency
- Trustworthy Australian finance aesthetic - professional, clean, data-forward
- Instant comprehension - users should grasp comparisons at a glance
- Zero friction input - sliders, dropdowns, and fields work seamlessly together

---

## Typography System

**Font Stack**: 
- Primary: Inter (via Google Fonts CDN) - exceptional readability for numbers and data
- Monospace: JetBrains Mono - for precise numerical displays

**Hierarchy**:
- Page Title: text-3xl font-semibold (Calculator heading)
- Section Headers: text-xl font-semibold (e.g., "Vehicle Details", "Your Salary")
- Subsection Labels: text-sm font-medium uppercase tracking-wide text-gray-600 (e.g., "OWNERSHIP PERIOD")
- Input Labels: text-sm font-medium
- Body Text: text-base
- Helper Text/Tooltips: text-xs text-gray-500
- Large Numbers (comparison cards): text-4xl font-bold (total costs)
- Small Numbers (breakdowns): text-lg font-semibold

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16** consistently
- Component internal padding: p-4 or p-6
- Section spacing: space-y-8 or space-y-12
- Card padding: p-6 or p-8
- Input field spacing: space-y-4
- Comparison card gaps: gap-6

**Grid Structure**:
- Desktop: Two-column layout (inputs left, results right)
- Left panel: max-w-md to max-w-lg (input forms)
- Right panel: flex-1 (results, charts, comparisons)
- Mobile: Stack to single column, inputs collapse into accordion sections

**Container Strategy**:
- Main container: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
- Cards/panels: rounded-lg border with subtle shadow
- Full-height sections for comparison results

---

## Component Library

### Input Components

**Sliders**:
- Range input with visible track, prominent thumb
- Display current value above or beside slider
- Min/max labels at ends
- Step indicators for key values
- Format: Standard HTML range with custom styling

**Dropdowns (Vehicle Selector)**:
- Clean select with chevron icon (Heroicons)
- Group vehicles by type: Petrol/Diesel, Hybrid, EV
- Large click target, clear selected state

**Number Inputs**:
- Currency inputs: Prefix with $ symbol, comma separators
- Kilometer inputs: Suffix with "km", comma separators
- Percentage inputs: Suffix with %
- All numeric fields right-aligned for scanning

**Toggle Switches**:
- Comparison method toggles (Outright/Finance/Novated)
- Large, clearly labeled switches
- Active state highly visible
- Stack vertically on mobile

**Radio Buttons (Pay Frequency)**:
- Button group style, not traditional radios
- Options: Weekly | Fortnightly | Monthly
- Selected state with filled background

### Display Components

**Comparison Cards**:
- Equal-width cards (3-column grid on desktop)
- Prominent total at top (text-4xl font-bold)
- Breakdown list below with clear labels
- Key insight badge/highlight at bottom
- Conditional rendering based on toggles

**Information Panels**:
- Light background (bg-blue-50 or bg-gray-50)
- Icon + text layout for key insights
- Clear hierarchy: number first, label second

**Tooltips**:
- Question mark icon (Heroicons) triggers tooltip
- Explain: FBT, pre-tax vs post-tax, balloon payments
- Subtle, non-intrusive placement

**Chart Integration**:
- Bar chart for total lifetime cost comparison
- Use chart.js or similar library (CDN)
- Horizontal bars for easy comparison
- Clear axis labels, legend if needed

### Navigation & Structure

**Header**:
- Simple top bar with calculator title
- No complex navigation (single-page app)
- Optional: Settings icon for advanced options

**Section Dividers**:
- Clear visual separation between input groups
- Horizontal rules (border-t) with spacing

**Footer**:
- Disclaimer text (text-xs text-gray-500)
- Subtle, doesn't compete with content

---

## Key UX Patterns

**Progressive Disclosure**:
- Advanced options (e.g., deposit amount, work usage toggle) start collapsed
- "Show advanced options" expandable sections

**Real-time Updates**:
- All changes trigger instant recalculation
- Smooth transitions (transition-all duration-200) for number changes
- Loading states unnecessary (calculations are instant)

**Mobile Optimization**:
- Sticky header with calculator title
- Inputs in collapsible accordion sections
- Comparison cards stack vertically
- Large touch targets (min-h-12 for all interactive elements)

**Data Clarity**:
- Use semantic color for context only (not specified here, but structure for it):
  - Success context: lowest cost
  - Neutral: standard display
  - Info: highlights, tax savings
- Clear separators between cost line items
- Whitespace to prevent visual clutter

---

## Icons

**Library**: Heroicons (via CDN)
**Usage**:
- Question mark (tooltip triggers)
- Chevron (dropdowns, accordions)
- Calculator, car, dollar sign (section headers)
- Check mark (selected states)
- Info circle (contextual help)

---

## Accessibility Notes

- All form inputs have associated labels
- ARIA labels for sliders showing current value
- Keyboard navigation for all interactive elements
- Focus states clearly visible (ring-2 ring-offset-2)
- Sufficient contrast for all text
- Skip to results link for screen readers

---

## Critical Execution Notes

1. **No Placeholder Content**: Every section fully built with real calculations
2. **Data Formatting**: Consistent number formatting (currency: $XX,XXX, km: XX,XXX km)
3. **Responsive Breakpoints**: sm:640px, md:768px, lg:1024px, xl:1280px
4. **Performance**: Debounce slider inputs (200ms) to prevent calculation spam
5. **Polish**: Rounded corners (rounded-lg), subtle shadows (shadow-sm), proper spacing throughout

This is a data tool, not a marketing page - prioritize clarity, scannability, and immediate comprehension over visual flair.