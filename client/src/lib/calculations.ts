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
  // Pure cash outflow - no resale value deduction for consistent comparison
  const totalLifetimeCost = driveAwayPrice + totalRunningCosts;
  
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
  // Pure cash outflow - no resale value deduction for consistent comparison
  const totalLifetimeCost = financeDeposit + totalRepayments + totalRunningCosts;
  
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
  
  const isEV = fuelType === 'ev';
  
  // SEPARATE VEHICLE BASE VALUE FROM ON-ROAD COSTS
  // Drive-away price includes: vehicle (incl GST) + stamp duty + rego/CTP
  // We estimate on-road costs (stamp duty ~3.3% of vehicle + rego ~$900)
  // These are approximations - actual on-roads vary by state
  const estimatedRegoInDriveaway = 900;
  const stampDutyRate = 0.033; // Approx 3.3% of vehicle value (NSW typical)
  
  // Solve for vehicle base value: driveAway = vehicleBase + (vehicleBase * stampDutyRate) + rego
  // vehicleBase = (driveAway - rego) / (1 + stampDutyRate)
  const vehicleBaseValue = (driveAwayPrice - estimatedRegoInDriveaway) / (1 + stampDutyRate);
  const estimatedStampDuty = vehicleBaseValue * stampDutyRate;
  
  // GST SAVINGS ON VEHICLE PURCHASE
  // GST only applies to the vehicle portion (not stamp duty or rego/CTP)
  // Vehicle base value includes GST, so GST = vehicleBase * 10/110
  const gstOnVehicle = vehicleBaseValue * (10 / 110);
  const vehiclePriceExGst = vehicleBaseValue - gstOnVehicle;
  
  // GST SAVINGS ON RUNNING COSTS
  // Insurance, servicing, tyres, fuel have GST - rego/CTP does not
  const gstableRunningCostsAnnual = (breakdown.fuel + breakdown.insurance + breakdown.servicing + breakdown.tyres) / ownershipYears;
  const nonGstableRunningCostsAnnual = breakdown.regoCtp / ownershipYears;
  
  // Running costs ex-GST
  const gstOnRunningCostsAnnual = gstableRunningCostsAnnual * (10 / 110);
  const runningCostsExGstAnnual = (gstableRunningCostsAnnual - gstOnRunningCostsAnnual) + nonGstableRunningCostsAnnual;
  
  const totalGstSavingsRunning = gstOnRunningCostsAnnual * ownershipYears;
  
  // FINANCED AMOUNT: Ex-GST vehicle price + on-road costs (stamp duty + rego)
  // This is what gets financed in a novated lease
  const onRoadCosts = estimatedStampDuty + estimatedRegoInDriveaway;
  const financedAmount = vehiclePriceExGst + onRoadCosts;
  
  // ATO residual value based on ownership period
  // Residual is calculated on the financed amount (ex-GST vehicle + on-roads)
  const residualRate = ATO_RESIDUAL_VALUES[ownershipYears] || 0.2838;
  const residualValue = financedAmount * residualRate;
  const monthlyRate = novatedInterestRate / 100 / 12;
  const numPayments = ownershipYears * 12;
  
  let monthlyLeasePayment = 0;
  let totalLeasePayments = 0;
  
  if (monthlyRate > 0) {
    // Standard balloon payment loan formula
    monthlyLeasePayment = (financedAmount - residualValue / Math.pow(1 + monthlyRate, numPayments)) * 
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    totalLeasePayments = monthlyLeasePayment * numPayments;
  } else {
    totalLeasePayments = financedAmount - residualValue;
  }
  
  const totalInterest = Math.max(0, totalLeasePayments - (financedAmount - residualValue));
  const annualLeasePayment = totalLeasePayments / ownershipYears;
  
  // FBT CALCULATION using Employee Contribution Method (ECM)
  // FBT is calculated on the vehicle base value (GST-inclusive, excluding on-roads)
  // The employee makes a post-tax contribution equal to the fringe benefit value
  let annualECM = 0; // Employee Contribution Method - post-tax deduction
  
  if (!isEV) {
    const statutoryFBTRate = 0.20;
    // Statutory fringe benefit value = 20% of vehicle base value (incl GST, excl on-roads)
    // This matches the quote where base value $55,530 * 20% = $11,106 annual ECM
    let fringeBenefitValue = vehicleBaseValue * statutoryFBTRate;
    
    // If >50% work use, operating cost method can reduce FBT by 50%
    if (workUseOver50) {
      fringeBenefitValue = fringeBenefitValue * 0.5;
    }
    
    // ECM: Employee pays the fringe benefit value as a post-tax deduction
    // This eliminates the FBT liability entirely
    annualECM = fringeBenefitValue;
  }
  
  // PRE-TAX DEDUCTION: Lease payments + running costs (all ex-GST)
  const annualPreTaxDeduction = annualLeasePayment + runningCostsExGstAnnual;
  
  // TAX SAVINGS from salary sacrifice
  const baselineTax = calculateAustralianTax(annualSalary);
  const reducedTaxableIncome = Math.max(0, annualSalary - annualPreTaxDeduction);
  const novatedTax = calculateAustralianTax(reducedTaxableIncome);
  
  const annualIncomeTaxSaving = (baselineTax.incomeTax + baselineTax.medicareLevy) - (novatedTax.incomeTax + novatedTax.medicareLevy);
  const totalIncomeTaxSaving = annualIncomeTaxSaving * ownershipYears;
  
  // TOTAL REDUCTION TO TAKE-HOME PAY (what the employee actually pays per year)
  // = Pre-tax deduction - income tax savings + ECM (post-tax deduction)
  const annualTakeHomePayReduction = annualPreTaxDeduction - annualIncomeTaxSaving + annualECM;
  
  // Total lifetime cost = take-home pay reduction over term + residual balloon payment
  const totalLifetimeCost = (annualTakeHomePayReduction * ownershipYears) + residualValue;
  
  const costPerYear = totalLifetimeCost / ownershipYears;
  const costPerPayCycle = calculateCostPerPayCycle(totalLifetimeCost, ownershipYears, payFrequency);
  
  // Take-home pay calculations for display
  const takeHomePayBefore = getPayCycleAmount(baselineTax.netTakeHomePay, payFrequency);
  const takeHomePayReduction = getPayCycleAmount(annualTakeHomePayReduction, payFrequency);
  const takeHomePayAfter = takeHomePayBefore - takeHomePayReduction;
  
  // Combined savings: income tax + GST savings
  const totalGstSavings = gstOnVehicle + totalGstSavingsRunning;
  const totalCombinedSavings = totalIncomeTaxSaving + totalGstSavings;
  
  let keyInsight = '';
  if (isEV) {
    keyInsight = `FBT-exempt EV! Save ${formatCurrency(totalCombinedSavings)} (tax + GST).`;
  } else {
    keyInsight = `Save ${formatCurrency(totalCombinedSavings)} (${formatCurrency(totalIncomeTaxSaving)} tax + ${formatCurrency(totalGstSavings)} GST).`;
  }
  
  return {
    method: 'novated',
    totalLifetimeCost,
    costPerYear,
    costPerPayCycle,
    breakdown: { 
      ...breakdown, 
      interest: totalInterest, 
      fbt: annualECM * ownershipYears, // Now shows ECM total (which eliminates FBT)
      balloonPayment: residualValue,
      gstSavingsVehicle: gstOnVehicle,
      gstSavingsRunning: totalGstSavingsRunning,
      preTaxDeduction: annualPreTaxDeduction * ownershipYears,
      postTaxDeduction: annualECM * ownershipYears,
    },
    keyInsight,
    takeHomePayReduction,
    taxSavings: totalIncomeTaxSaving,
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
