export type FuelType = 'petrol' | 'diesel' | 'hybrid' | 'ev';

export interface Vehicle {
  id: string;
  name: string;
  fuelType: FuelType;
  driveAwayPrice: number;
  fuelConsumption: number;
  averageServicing: number;
}

export interface UserInputs {
  vehicle: Vehicle;
  driveAwayPrice: number;
  ownershipYears: number;
  kmPerYear: number;
  fuelPrice: number;
  electricityPrice: number;
  insuranceAnnual: number;
  servicingAnnual: number;
  tyresAnnual: number;
  regoCtpAnnual: number;
  annualSalary: number;
  payFrequency: 'weekly' | 'fortnightly' | 'monthly';
  financeInterestRate: number;
  financeDeposit: number;
  novatedInterestRate: number;
  workUseOver50: boolean;
  comparisonMethods: {
    outright: boolean;
    finance: boolean;
    novated: boolean;
  };
  displayPeriod: 'weekly' | 'fortnightly' | 'monthly' | 'annually';
}

export interface CostBreakdown {
  depreciation: number;
  fuel: number;
  insurance: number;
  servicing: number;
  tyres: number;
  regoCtp: number;
  interest?: number;
  fbt?: number;
  balloonPayment?: number;
}

export interface ComparisonResult {
  method: 'outright' | 'finance' | 'novated';
  totalLifetimeCost: number;
  costPerYear: number;
  costPerPayCycle: number;
  breakdown: CostBreakdown;
  keyInsight: string;
  takeHomePayReduction?: number;
  taxSavings?: number;
  takeHomePayBefore?: number;
  takeHomePayAfter?: number;
}

export interface TaxCalculation {
  grossIncome: number;
  incomeTax: number;
  medicareLevy: number;
  netTakeHomePay: number;
}

export const SAMPLE_VEHICLES: Vehicle[] = [
  {
    id: 'corolla-petrol',
    name: 'Toyota Corolla Ascent (Petrol)',
    fuelType: 'petrol',
    driveAwayPrice: 32990,
    fuelConsumption: 6.5,
    averageServicing: 450,
  },
  {
    id: 'mazda3-petrol',
    name: 'Mazda 3 G20 Pure (Petrol)',
    fuelType: 'petrol',
    driveAwayPrice: 35990,
    fuelConsumption: 6.2,
    averageServicing: 480,
  },
  {
    id: 'hilux-diesel',
    name: 'Toyota HiLux SR (Diesel)',
    fuelType: 'diesel',
    driveAwayPrice: 55490,
    fuelConsumption: 7.8,
    averageServicing: 650,
  },
  {
    id: 'ranger-diesel',
    name: 'Ford Ranger XL (Diesel)',
    fuelType: 'diesel',
    driveAwayPrice: 52990,
    fuelConsumption: 7.6,
    averageServicing: 680,
  },
  {
    id: 'corolla-hybrid',
    name: 'Toyota Corolla Hybrid (Hybrid)',
    fuelType: 'hybrid',
    driveAwayPrice: 36990,
    fuelConsumption: 4.2,
    averageServicing: 400,
  },
  {
    id: 'camry-hybrid',
    name: 'Toyota Camry Hybrid (Hybrid)',
    fuelType: 'hybrid',
    driveAwayPrice: 45990,
    fuelConsumption: 4.5,
    averageServicing: 450,
  },
  {
    id: 'model3-ev',
    name: 'Tesla Model 3 (EV)',
    fuelType: 'ev',
    driveAwayPrice: 59900,
    fuelConsumption: 14.0,
    averageServicing: 250,
  },
  {
    id: 'byd-seal-ev',
    name: 'BYD Seal Premium (EV)',
    fuelType: 'ev',
    driveAwayPrice: 65990,
    fuelConsumption: 15.2,
    averageServicing: 280,
  },
  {
    id: 'mg4-ev',
    name: 'MG4 Excite (EV)',
    fuelType: 'ev',
    driveAwayPrice: 41990,
    fuelConsumption: 16.5,
    averageServicing: 220,
  },
];

export const ATO_RESIDUAL_VALUES: Record<number, number> = {
  1: 0.6556,
  2: 0.5631,
  3: 0.4700,
  4: 0.3769,
  5: 0.2838,
};

export const DEPRECIATION_RATES: Record<number, number> = {
  1: 0.20,
  2: 0.35,
  3: 0.45,
  4: 0.52,
  5: 0.58,
};
