import { 
  UserInputs, 
  ComparisonResult, 
  TaxCalculation, 
  CostBreakdown,
  ATO_RESIDUAL_VALUES,
  DEPRECIATION_RATES,
  ATO_EV_COST_PER_KM,
  DEFAULT_FUEL_CONSUMPTION
} from './types';

export function calculateAustralianTax(grossIncome: number): TaxCalculation {
  let incomeTax = 0;
  
  if (grossIncome <= 18200) {
    incomeTax = 0;
  } else if (grossIncome <= 45000) {
    incomeTax = (grossIncome - 18200) * 0.19;
  } else if (grossIncome <= 120000) {
    incomeTax = 5092 + (grossIncome - 45000) * 0.325;
  } else if (grossIncome <= 180000) {
    incomeTax = 29467 + (grossIncome - 120000) * 0.37;
  } else {
    incomeTax = 51667 + (grossIncome - 180000) * 0.45;
  }
  
  const medicareLevy = grossIncome > 23365 ? grossIncome * 0.02 : 0;
  const netTakeHomePay = grossIncome - incomeTax - medicareLevy;
  
  return {
    grossIncome,
    incomeTax,
    medicareLevy,
    netTakeHomePay,
  };
}

export function calculateRunningCosts(inputs: UserInputs): CostBreakdown {
  const { fuelType, kmPerYear, ownershipYears, fuelPrice, insuranceAnnual, servicingAnnual, tyresAnnual, regoCtpAnnual, driveAwayPrice } = inputs;
  
  let fuelCost = 0;
  if (fuelType === 'ev') {
    fuelCost = ATO_EV_COST_PER_KM * kmPerYear * ownershipYears;
  } else {
    const consumption = DEFAULT_FUEL_CONSUMPTION[fuelType];
    fuelCost = (consumption / 100) * kmPerYear * fuelPrice * ownershipYears;
  }
  
  const depreciationRate = DEPRECIATION_RATES[ownershipYears] || 0.58;
  const depreciation = driveAwayPrice * depreciationRate;
  const resaleValue = driveAwayPrice - depreciation;
  
  const tyresNeeded = Math.ceil((kmPerYear * ownershipYears) / 45000);
  const totalTyres = tyresAnnual * tyresNeeded;
  
  return {
    vehicleCost: driveAwayPrice,
    depreciation,
    fuel: fuelCost,
    insurance: insuranceAnnual * ownershipYears,
    servicing: servicingAnnual * ownershipYears,
    tyres: totalTyres,
    regoCtp: regoCtpAnnual * ownershipYears,
    resaleValue,
  };
}

export function calculateOutrightPurchase(inputs: UserInputs): ComparisonResult {
  const { driveAwayPrice, ownershipYears } = inputs;
  const breakdown = calculateRunningCosts(inputs);
  
  const totalRunningCosts = breakdown.fuel + breakdown.insurance + breakdown.servicing + breakdown.tyres + breakdown.regoCtp;
  const totalLifetimeCost = driveAwayPrice + totalRunningCosts - (breakdown.resaleValue || 0);
  
  const costPerYear = totalLifetimeCost / ownershipYears;
  const costPerPayCycle = calculateCostPerPayCycle(totalLifetimeCost, ownershipYears, inputs.payFrequency);
  
  return {
    method: 'outright',
    totalLifetimeCost,
    costPerYear,
    costPerPayCycle,
    breakdown,
    keyInsight: `No interest paid. Full ownership from day one.`,
  };
}

export function calculateFinance(inputs: UserInputs): ComparisonResult {
  const { driveAwayPrice, ownershipYears, financeInterestRate, financeDeposit } = inputs;
  const breakdown = calculateRunningCosts(inputs);
  
  const loanAmount = driveAwayPrice - financeDeposit;
  const monthlyRate = financeInterestRate / 100 / 12;
  const numPayments = ownershipYears * 12;
  
  let monthlyPayment = 0;
  let totalRepayments = 0;
  let totalInterest = 0;
  
  if (monthlyRate > 0 && loanAmount > 0) {
    monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    totalRepayments = monthlyPayment * numPayments;
    totalInterest = totalRepayments - loanAmount;
  } else {
    totalRepayments = loanAmount;
  }
  
  const totalRunningCosts = breakdown.fuel + breakdown.insurance + breakdown.servicing + breakdown.tyres + breakdown.regoCtp;
  const totalLifetimeCost = financeDeposit + totalRepayments + totalRunningCosts - (breakdown.resaleValue || 0);
  
  const costPerYear = totalLifetimeCost / ownershipYears;
  const costPerPayCycle = calculateCostPerPayCycle(totalLifetimeCost, ownershipYears, inputs.payFrequency);
  
  return {
    method: 'finance',
    totalLifetimeCost,
    costPerYear,
    costPerPayCycle,
    breakdown: { ...breakdown, interest: totalInterest },
    keyInsight: `${formatCurrency(totalInterest)} in interest over ${ownershipYears} years.`,
  };
}

export function calculateNovatedLease(inputs: UserInputs): ComparisonResult {
  const { driveAwayPrice, ownershipYears, novatedInterestRate, fuelType, workUseOver50, annualSalary, payFrequency } = inputs;
  const breakdown = calculateRunningCosts(inputs);
  
  const residualRate = ATO_RESIDUAL_VALUES[ownershipYears] || 0.2838;
  const residualValue = driveAwayPrice * residualRate;
  
  const financedAmount = driveAwayPrice;
  const monthlyRate = novatedInterestRate / 100 / 12;
  const numPayments = ownershipYears * 12;
  
  let monthlyLeasePayment = 0;
  let totalLeasePayments = 0;
  
  if (monthlyRate > 0) {
    monthlyLeasePayment = (financedAmount - residualValue / Math.pow(1 + monthlyRate, numPayments)) * 
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    totalLeasePayments = monthlyLeasePayment * numPayments;
  } else {
    totalLeasePayments = financedAmount - residualValue;
  }
  
  const totalInterest = totalLeasePayments - (financedAmount - residualValue);
  
  const totalRunningCosts = breakdown.fuel + breakdown.insurance + breakdown.servicing + breakdown.tyres + breakdown.regoCtp;
  const annualRunningCosts = totalRunningCosts / ownershipYears;
  const annualLeasePayment = totalLeasePayments / ownershipYears;
  
  const isEV = fuelType === 'ev';
  
  let annualPreTaxDeduction = annualLeasePayment + annualRunningCosts;
  let annualFBT = 0;
  
  if (!isEV) {
    const statutoryFBTRate = 0.20;
    const grossUpFactor = 2.0802;
    const fbtRate = 0.47;
    
    let fbtableValue = driveAwayPrice * statutoryFBTRate;
    if (workUseOver50) {
      fbtableValue = fbtableValue * 0.5;
    }
    
    const grossedUpValue = fbtableValue * grossUpFactor;
    annualFBT = grossedUpValue * fbtRate;
  }
  
  const baselineTax = calculateAustralianTax(annualSalary);
  const reducedSalary = Math.max(0, annualSalary - annualPreTaxDeduction);
  const novatedTax = calculateAustralianTax(reducedSalary);
  
  const annualTaxSaving = (baselineTax.incomeTax + baselineTax.medicareLevy) - (novatedTax.incomeTax + novatedTax.medicareLevy);
  const totalTaxSaving = annualTaxSaving * ownershipYears;
  
  const annualNetCost = annualPreTaxDeduction - annualTaxSaving + annualFBT;
  
  const totalLifetimeCost = (annualNetCost * ownershipYears) + residualValue;
  
  const costPerYear = totalLifetimeCost / ownershipYears;
  const costPerPayCycle = calculateCostPerPayCycle(totalLifetimeCost, ownershipYears, payFrequency);
  
  const takeHomePayBefore = getPayCycleAmount(baselineTax.netTakeHomePay, payFrequency);
  const takeHomePayReductionAnnual = annualNetCost;
  const takeHomePayReduction = getPayCycleAmount(takeHomePayReductionAnnual, payFrequency);
  const takeHomePayAfter = takeHomePayBefore - takeHomePayReduction;
  
  let keyInsight = '';
  if (isEV) {
    keyInsight = `FBT-exempt EV! Save ${formatCurrency(totalTaxSaving)} in tax.`;
  } else {
    keyInsight = `Tax savings of ${formatCurrency(totalTaxSaving)} over ${ownershipYears} years.`;
  }
  
  return {
    method: 'novated',
    totalLifetimeCost,
    costPerYear,
    costPerPayCycle,
    breakdown: { 
      ...breakdown, 
      interest: totalInterest > 0 ? totalInterest : 0, 
      fbt: annualFBT * ownershipYears, 
      balloonPayment: residualValue 
    },
    keyInsight,
    takeHomePayReduction,
    taxSavings: totalTaxSaving,
    takeHomePayBefore,
    takeHomePayAfter,
  };
}

function calculateCostPerPayCycle(totalCost: number, years: number, frequency: 'weekly' | 'fortnightly' | 'monthly'): number {
  const periodsPerYear = frequency === 'weekly' ? 52 : frequency === 'fortnightly' ? 26 : 12;
  return totalCost / (years * periodsPerYear);
}

function getPayCycleAmount(annualAmount: number, frequency: 'weekly' | 'fortnightly' | 'monthly'): number {
  const periodsPerYear = frequency === 'weekly' ? 52 : frequency === 'fortnightly' ? 26 : 12;
  return annualAmount / periodsPerYear;
}

export function formatNumber(num: number): string {
  return Math.round(num).toLocaleString('en-AU');
}

export function formatCurrency(num: number): string {
  return `$${formatNumber(num)}`;
}

export function convertToDisplayPeriod(annualAmount: number, displayPeriod: 'weekly' | 'fortnightly' | 'monthly' | 'annually'): number {
  switch (displayPeriod) {
    case 'weekly': return annualAmount / 52;
    case 'fortnightly': return annualAmount / 26;
    case 'monthly': return annualAmount / 12;
    case 'annually': return annualAmount;
  }
}

export function getDisplayPeriodLabel(displayPeriod: 'weekly' | 'fortnightly' | 'monthly' | 'annually'): string {
  switch (displayPeriod) {
    case 'weekly': return '/week';
    case 'fortnightly': return '/fortnight';
    case 'monthly': return '/month';
    case 'annually': return '/year';
  }
}
