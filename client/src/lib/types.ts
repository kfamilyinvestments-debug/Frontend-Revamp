export type FuelType = 'petrol_diesel' | 'plugin_hybrid' | 'ev';

export interface UserInputs {
  fuelType: FuelType;
  driveAwayPrice: number;
  ownershipYears: number;
  kmPerYear: number;
  fuelPrice: number;
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
  vehicleCost: number;
  depreciation: number;
  fuel: number;
  insurance: number;
  servicing: number;
  tyres: number;
  regoCtp: number;
  interest?: number;
  fbt?: number;
  balloonPayment?: number;
  resaleValue?: number;
  gstSavingsVehicle?: number;
  gstSavingsRunning?: number;
  preTaxDeduction?: number;
  postTaxDeduction?: number;
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

export const ATO_EV_COST_PER_KM = 0.042;

export const DEFAULT_FUEL_CONSUMPTION: Record<FuelType, number> = {
  petrol_diesel: 8.5,
  plugin_hybrid: 6.0,
  ev: 0,
};

export const DEFAULT_SERVICING_COSTS: Record<FuelType, number> = {
  petrol_diesel: 550,
  plugin_hybrid: 450,
  ev: 250,
};

export const ATO_RESIDUAL_VALUES: Record<number, number> = {
  1: 0.6563,
  2: 0.5625,
  3: 0.4688,
  4: 0.3750,
  5: 0.2813,
};

export const DEPRECIATION_RATES: Record<number, number> = {
  1: 0.20,
  2: 0.35,
  3: 0.45,
  4: 0.52,
  5: 0.58,
};
