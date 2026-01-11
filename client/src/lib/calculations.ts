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

function safeNumber(value: number, fallback: number = 0): number {
  if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
    return fallback;
  }
  return value;
}

function safeDivide(numerator: number, denominator: number, fallback: number = 0): number {
  if (denominator === 0 || isNaN(denominator) || !isFinite(denominator)) {
    return fallback;
  }
  const result = numerator / denominator;
  return safeNumber(result, fallback);
}

export function calculateAustralianTax(grossIncome: number): TaxCalculation {
  // Guard against NaN/undefined/null inputs
  const income = isNaN(grossIncome) || grossIncome === null ? 0 : Math.max(0, grossIncome);
  let incomeTax = 0;
  
  if (income <= 18200) {
    incomeTax = 0;
  } else if (income <= 45000) {
    incomeTax = (income - 18200) * 0.19;
  } else if (income <= 120000) {
    incomeTax = 5092 + (income - 45000) * 0.325;
  } else if (income <= 180000) {
    incomeTax = 29467 + (income - 120000) * 0.37;
  } else {
    incomeTax = 51667 + (income - 180000) * 0.45;
  }
  
  const medicareLevy = income > 23365 ? income * 0.02 : 0;
  const netTakeHomePay = income - incomeTax - medicareLevy;
  
  return {
    grossIncome: income,
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
  
  const costPerYear = safeDivide(totalLifetimeCost, ownershipYears);
  const costPerPayCycle = calculateCostPerPayCycle(totalLifetimeCost, ownershipYears, inputs.payFrequency);
  
  return {
    method: 'outright',
    totalLifetimeCost: safeNumber(totalLifetimeCost),
    costPerYear: safeNumber(costPerYear),
    costPerPayCycle: safeNumber(costPerPayCycle),
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
  } else if (loanAmount > 0) {
    totalRepayments = loanAmount;
    monthlyPayment = loanAmount / numPayments;
    totalInterest = 0;
  }
  
  const totalRunningCosts = breakdown.fuel + breakdown.insurance + breakdown.servicing + breakdown.tyres + breakdown.regoCtp;
  // Pure cash outflow - no resale value deduction for consistent comparison
  const totalLifetimeCost = financeDeposit + totalRepayments + totalRunningCosts;
  
  const costPerYear = safeDivide(totalLifetimeCost, ownershipYears);
  const costPerPayCycle = calculateCostPerPayCycle(totalLifetimeCost, ownershipYears, inputs.payFrequency);
  
  return {
    method: 'finance',
    totalLifetimeCost: safeNumber(totalLifetimeCost),
    costPerYear: safeNumber(costPerYear),
    costPerPayCycle: safeNumber(costPerPayCycle),
    breakdown: { 
      ...breakdown, 
      interest: safeNumber(totalInterest),
      monthlyPayment: safeNumber(monthlyPayment),
      totalFinancePayments: safeNumber(totalRepayments),
    },
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
  
  // MONTHLY LEASE PAYMENT (ex-GST, fixed)
  let monthlyLeasePayment = 0;
  let totalLeasePayments = 0;
  
  if (monthlyRate > 0) {
    // Standard balloon payment loan formula
    monthlyLeasePayment = (financedAmount - residualValue / Math.pow(1 + monthlyRate, numPayments)) * 
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    totalLeasePayments = monthlyLeasePayment * numPayments;
  } else {
    totalLeasePayments = financedAmount - residualValue;
    monthlyLeasePayment = totalLeasePayments / numPayments;
  }
  
  const totalInterest = Math.max(0, totalLeasePayments - (financedAmount - residualValue));
  
  // RUNNING COSTS - calculate ex-GST and GST components
  // Insurance, servicing, tyres, fuel have GST - rego/CTP does not
  const gstableRunningCostsAnnual = (breakdown.fuel + breakdown.insurance + breakdown.servicing + breakdown.tyres) / ownershipYears;
  const nonGstableRunningCostsAnnual = breakdown.regoCtp / ownershipYears;
  
  // Running costs ex-GST (monthly)
  const runningCostsExGstMonthly = ((gstableRunningCostsAnnual / 1.1) + nonGstableRunningCostsAnnual) / 12;
  const runningCostsGstMonthly = (gstableRunningCostsAnnual - gstableRunningCostsAnnual / 1.1) / 12;
  
  // Admin fee (typical $20/month, ex-GST)
  const adminFeeMonthly = 20;
  
  // GROSS RENTAL (monthly, inc GST)
  // = (lease payment + running costs ex-GST + admin) + GST on these items
  const exGstTotalMonthly = monthlyLeasePayment + runningCostsExGstMonthly + adminFeeMonthly;
  const gstOnLeaseAndAdmin = (monthlyLeasePayment + adminFeeMonthly) * 0.1;
  const grossRentalMonthly = exGstTotalMonthly + gstOnLeaseAndAdmin + runningCostsGstMonthly;
  
  // FBT CALCULATION using Employee Contribution Method (ECM)
  // ECM = 20% of vehicle base value (GST-inclusive, excluding on-roads)
  // This matches the quote: $55,530 × 20% = $11,106 annual
  let annualECM = 0;
  let monthlyECM = 0;
  
  if (!isEV) {
    const statutoryFBTRate = 0.20;
    let fringeBenefitValue = vehicleBaseValue * statutoryFBTRate;
    
    // If >50% work use, operating cost method can reduce FBT by 50%
    if (workUseOver50) {
      fringeBenefitValue = fringeBenefitValue * 0.5;
    }
    
    annualECM = fringeBenefitValue;
    monthlyECM = annualECM / 12;
  }
  
  // PAYROLL SPLIT (the key calculation matching the quote)
  // Formula: Gross Rental = Pre-Tax Salary Sacrifice + ECM (Post-Tax) + Input Tax Credit
  // Where: Pre-Tax = (Gross Rental - ECM) / 1.1
  //        Input Tax Credit = (Gross Rental - ECM) - Pre-Tax = Pre-Tax × 0.1
  
  const remainderAfterECM = grossRentalMonthly - monthlyECM;
  const monthlyPreTaxDeduction = remainderAfterECM / 1.1;
  const monthlyInputTaxCredit = remainderAfterECM - monthlyPreTaxDeduction; // = Pre-Tax × 0.1
  
  // Annualize
  const annualPreTaxDeduction = monthlyPreTaxDeduction * 12;
  const annualInputTaxCredit = monthlyInputTaxCredit * 12;
  const annualGrossRental = grossRentalMonthly * 12;
  
  // TAX SAVINGS from salary sacrifice (only on the pre-tax portion)
  // Note: Novated lease quotes typically show income tax savings only (not Medicare levy)
  // This matches the PDF quote which shows $130/mo tax saving for $88k salary
  const baselineTax = calculateAustralianTax(annualSalary);
  const reducedTaxableIncome = Math.max(0, annualSalary - annualPreTaxDeduction);
  const novatedTax = calculateAustralianTax(reducedTaxableIncome);
  
  // Use income tax only (not Medicare) to match real-world quote methodology
  const annualIncomeTaxSaving = baselineTax.incomeTax - novatedTax.incomeTax;
  const totalIncomeTaxSaving = annualIncomeTaxSaving * ownershipYears;
  
  // TOTAL REDUCTION TO TAKE-HOME PAY
  // = (Pre-Tax Deduction - Income Tax Savings) + ECM
  // The pre-tax deduction reduces taxable income, providing tax savings
  // Quote shows: $1,201.29/mo = ($405.80 - $130) + $925.50
  const annualTakeHomePayReduction = (annualPreTaxDeduction - annualIncomeTaxSaving) + annualECM;
  
  // Total lifetime cost = take-home pay reduction over term + residual balloon payment
  const totalLifetimeCost = (annualTakeHomePayReduction * ownershipYears) + residualValue;
  
  const costPerYear = safeDivide(totalLifetimeCost, ownershipYears);
  const costPerPayCycle = calculateCostPerPayCycle(totalLifetimeCost, ownershipYears, payFrequency);
  
  // Take-home pay calculations for display
  const takeHomePayBefore = getPayCycleAmount(baselineTax.netTakeHomePay, payFrequency);
  const takeHomePayReduction = getPayCycleAmount(annualTakeHomePayReduction, payFrequency);
  const takeHomePayAfter = takeHomePayBefore - takeHomePayReduction;
  
  // GST savings shown separately
  const totalGstSavingsRunning = annualInputTaxCredit * ownershipYears;
  const totalGstSavings = gstOnVehicle + totalGstSavingsRunning;
  const totalCombinedSavings = totalIncomeTaxSaving + totalGstSavings;
  
  let keyInsight = '';
  if (isEV) {
    keyInsight = `FBT-exempt EV! Save ${formatCurrency(safeNumber(totalCombinedSavings))} (tax + GST).`;
  } else {
    keyInsight = `Save ${formatCurrency(safeNumber(totalCombinedSavings))} (${formatCurrency(safeNumber(totalIncomeTaxSaving))} tax + ${formatCurrency(safeNumber(totalGstSavings))} GST).`;
  }
  
  // Per-period values for display
  const preTaxDeductionPerPeriod = getPayCycleAmount(annualPreTaxDeduction, payFrequency);
  const postTaxDeductionPerPeriod = getPayCycleAmount(annualECM, payFrequency);
  
  return {
    method: 'novated',
    totalLifetimeCost: safeNumber(totalLifetimeCost),
    costPerYear: safeNumber(costPerYear),
    costPerPayCycle: safeNumber(costPerPayCycle),
    breakdown: { 
      ...breakdown, 
      interest: safeNumber(totalInterest), 
      fbt: safeNumber(annualECM * ownershipYears),
      balloonPayment: safeNumber(residualValue),
      gstSavingsVehicle: safeNumber(gstOnVehicle),
      gstSavingsRunning: safeNumber(totalGstSavingsRunning),
      preTaxDeduction: safeNumber(annualPreTaxDeduction * ownershipYears),
      postTaxDeduction: safeNumber(annualECM * ownershipYears),
      monthlyPayment: safeNumber(monthlyLeasePayment),
      totalFinancePayments: safeNumber(totalLeasePayments),
      grossRentalMonthly: safeNumber(grossRentalMonthly),
      inputTaxCreditMonthly: safeNumber(monthlyInputTaxCredit),
    },
    keyInsight,
    takeHomePayReduction: safeNumber(takeHomePayReduction),
    taxSavings: safeNumber(totalIncomeTaxSaving),
    takeHomePayBefore: safeNumber(takeHomePayBefore),
    takeHomePayAfter: safeNumber(takeHomePayAfter),
    preTaxDeductionPerPeriod: safeNumber(preTaxDeductionPerPeriod),
    postTaxDeductionPerPeriod: safeNumber(postTaxDeductionPerPeriod),
  };
}

function calculateCostPerPayCycle(totalCost: number, years: number, frequency: 'weekly' | 'fortnightly' | 'monthly'): number {
  const periodsPerYear = frequency === 'weekly' ? 52 : frequency === 'fortnightly' ? 26 : 12;
  return safeDivide(totalCost, years * periodsPerYear);
}

function getPayCycleAmount(annualAmount: number, frequency: 'weekly' | 'fortnightly' | 'monthly'): number {
  const periodsPerYear = frequency === 'weekly' ? 52 : frequency === 'fortnightly' ? 26 : 12;
  return safeDivide(annualAmount, periodsPerYear);
}

export function formatNumber(num: number): string {
  const safe = safeNumber(num);
  return Math.round(safe).toLocaleString('en-AU');
}

export function formatCurrency(num: number): string {
  return `$${formatNumber(num)}`;
}

export function convertToDisplayPeriod(annualAmount: number, displayPeriod: 'weekly' | 'fortnightly' | 'monthly' | 'annually'): number {
  const safe = safeNumber(annualAmount);
  switch (displayPeriod) {
    case 'weekly': return safe / 52;
    case 'fortnightly': return safe / 26;
    case 'monthly': return safe / 12;
    case 'annually': return safe;
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
