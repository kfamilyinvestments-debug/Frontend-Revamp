# Car Cost Calculator - Australia

## Overview
A modern, frontend-only web application for Australian consumers comparing the true lifetime cost of owning a car under three scenarios:
- **Outright Purchase** (cash)
- **Traditional Car Finance**
- **Novated Leasing**

The calculator helps users understand what a car really costs them per pay cycle, with special emphasis on novated lease take-home pay impact.

## Project Architecture

### Tech Stack
- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Charts**: Recharts for bar chart visualization
- **Routing**: Wouter (single-page application)
- **State Management**: React useState/useMemo hooks
- **Build Tool**: Vite

### Directory Structure
```
client/src/
├── components/          # UI components
│   ├── ui/             # shadcn/ui base components
│   ├── VehicleSelector.tsx
│   ├── UsageAssumptions.tsx
│   ├── RunningCosts.tsx
│   ├── SalaryProfile.tsx
│   ├── ComparisonToggles.tsx
│   ├── FinanceOptions.tsx
│   ├── ComparisonCard.tsx
│   ├── CostChart.tsx
│   ├── DisplayToggle.tsx
│   └── ThemeToggle.tsx
├── hooks/
│   └── use-theme.ts    # Dark/light mode hook
├── lib/
│   ├── types.ts        # TypeScript interfaces & sample data
│   ├── calculations.ts # All calculation logic
│   └── utils.ts        # Utility functions
├── pages/
│   └── Calculator.tsx  # Main calculator page
└── App.tsx             # Root component with routing
```

## Key Features

### Vehicle Selection
- Sample vehicles across fuel types: Petrol, Diesel, Hybrid, EV
- Editable drive-away price
- FBT exemption badge for EVs

### Usage Assumptions
- Ownership period (1-5 years)
- Annual kilometres driven

### Running Costs
- Fuel/Electricity costs based on vehicle type
- Insurance, servicing, tyres, registration + CTP
- All costs editable with sliders and inputs

### Salary & Tax Profile
- Annual gross salary input
- Pay frequency (weekly/fortnightly/monthly)
- Australian tax bracket calculations including Medicare levy

### Comparison Methods
- Toggle each method on/off
- Finance: configurable interest rate and deposit
- Novated: interest rate, work use toggle for FBT reduction

### Calculations
Located in `client/src/lib/calculations.ts`:
- **calculateAustralianTax()**: 2024-25 Australian tax brackets + Medicare levy
- **calculateRunningCosts()**: Fuel, insurance, servicing, tyres, rego over ownership period
- **calculateOutrightPurchase()**: Upfront cost + running costs - resale value
- **calculateFinance()**: Loan amortization + interest + running costs
- **calculateNovatedLease()**: Pre-tax deductions, FBT calculations, take-home pay impact

### Financial Assumptions
- ATO minimum residual values for novated leases (1-5 year terms)
- Depreciation rates by ownership period
- Statutory FBT method with optional Operating Cost method for >50% work use
- Full FBT exemption for EVs

## Running the Application
The application runs on port 5000:
```bash
npm run dev
```

## Recent Changes
- Initial implementation (Jan 2026): Complete calculator with all features
  - Vehicle selector with sample vehicles
  - Usage and running cost inputs
  - Salary/tax profile with Australian tax calculations
  - Three comparison methods with toggles
  - Real-time calculation engine
  - Comparison cards with cost breakdowns
  - Bar chart visualization
  - Display period toggle
  - Dark/light theme support
  - Responsive design

## User Preferences
- Professional, clean Australian finance aesthetic
- No sales language - purely informational tool
- Tooltips for financial terms (FBT, pre-tax, balloon payments)
- Mobile responsive design
