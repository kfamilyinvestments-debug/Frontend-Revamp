import { useState, useMemo, useCallback } from 'react';
import { Calculator as CalculatorIcon, AlertCircle } from 'lucide-react';
import { VehicleSelector } from '@/components/VehicleSelector';
import { UsageAssumptions } from '@/components/UsageAssumptions';
import { RunningCosts } from '@/components/RunningCosts';
import { ComparisonToggles } from '@/components/ComparisonToggles';
import { FinanceOptions } from '@/components/FinanceOptions';
import { ComparisonCard } from '@/components/ComparisonCard';
import { CostChart } from '@/components/CostChart';
import { DisplayToggle } from '@/components/DisplayToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Wallet } from 'lucide-react';
import Footer from '@/components/Footer';
import { 
  FuelType,
  UserInputs,
  ComparisonResult,
  DEFAULT_SERVICING_COSTS,
  DEFAULT_NOVATED_RATES
} from '@/lib/types';
import { 
  calculateAustralianTax, 
  calculateOutrightPurchase, 
  calculateFinance, 
  calculateNovatedLease,
  formatCurrency,
  convertToDisplayPeriod
} from '@/lib/calculations';

export default function Calculator() {
  const [fuelType, setFuelType] = useState<FuelType>('petrol_diesel');
  const [driveAwayPrice, setDriveAwayPrice] = useState(45000);
  const [ownershipYears, setOwnershipYears] = useState(3);
  const [kmPerYear, setKmPerYear] = useState(15000);
  const [fuelCostAmount, setFuelCostAmount] = useState(100);
  const [fuelCostPeriod, setFuelCostPeriod] = useState<'weekly' | 'monthly' | 'annually'>('weekly');
  const [insuranceAnnual, setInsuranceAnnual] = useState(1200);
  const [servicingAnnual, setServicingAnnual] = useState(550);
  const [tyresAnnual, setTyresAnnual] = useState(800);
  const [regoCtpAnnual, setRegoCtpAnnual] = useState(900);
  const [annualSalary, setAnnualSalary] = useState(100000);
  const [payFrequency, setPayFrequency] = useState<'weekly' | 'fortnightly' | 'monthly'>('fortnightly');
  const [financeInterestRate, setFinanceInterestRate] = useState(8.5);
  const [financeDeposit, setFinanceDeposit] = useState(0);
  const [novatedInterestRate, setNovatedInterestRate] = useState(DEFAULT_NOVATED_RATES['petrol_diesel']);
  const [workUseOver50, setWorkUseOver50] = useState(false);
  const [businessUsePercentage, setBusinessUsePercentage] = useState(75);
  const [comparisonMethods, setComparisonMethods] = useState({
    outright: true,
    finance: true,
    novated: true,
  });
  const [displayPeriod, setDisplayPeriod] = useState<'weekly' | 'fortnightly' | 'monthly' | 'annually'>('annually');

  const handleFuelTypeChange = useCallback((newFuelType: FuelType) => {
    setFuelType(newFuelType);
    setServicingAnnual(DEFAULT_SERVICING_COSTS[newFuelType]);
    setNovatedInterestRate(DEFAULT_NOVATED_RATES[newFuelType]);
  }, []);

  const handleToggle = useCallback((method: 'outright' | 'finance' | 'novated', enabled: boolean) => {
    setComparisonMethods(prev => ({ ...prev, [method]: enabled }));
  }, []);

  // SAFE INPUT BUNDLE: Ensures no undefined values are passed to the engine
  const userInputs: UserInputs = useMemo(() => ({
    fuelType: fuelType || 'petrol_diesel',
    driveAwayPrice: Number(driveAwayPrice) || 0,
    ownershipYears: Number(ownershipYears) || 1,
    kmPerYear: Number(kmPerYear) || 0,
    fuelCostAmount: Number(fuelCostAmount) || 0,
    fuelCostPeriod,
    insuranceAnnual: Number(insuranceAnnual) || 0,
    servicingAnnual: Number(servicingAnnual) || 0,
    tyresAnnual: Number(tyresAnnual) || 0,
    regoCtpAnnual: Number(regoCtpAnnual) || 0,
    annualSalary: Number(annualSalary) || 0,
    payFrequency: payFrequency || 'fortnightly',
    financeInterestRate: Number(financeInterestRate) || 0,
    financeDeposit: Number(financeDeposit) || 0,
    novatedInterestRate: Number(novatedInterestRate) || 0,
    workUseOver50: !!workUseOver50,
    businessUsePercentage: Number(businessUsePercentage) || 50,
    comparisonMethods,
    displayPeriod,
  }), [
    fuelType, driveAwayPrice, ownershipYears, kmPerYear, fuelCostAmount, fuelCostPeriod, insuranceAnnual,
    servicingAnnual, tyresAnnual, regoCtpAnnual, annualSalary, payFrequency,
    financeInterestRate, financeDeposit, novatedInterestRate, workUseOver50, businessUsePercentage,
    comparisonMethods, displayPeriod,
  ]);

  // SAFE TAX CALC: Wraps the tax calculation in a try-catch to prevent sidebar crashes
  const taxCalculation = useMemo(() => {
    try {
      return calculateAustralianTax(annualSalary || 0);
    } catch (e) {
      console.error("Tax calculation failed", e);
      return { grossIncome: 0, incomeTax: 0, medicareLevy: 0, netTakeHomePay: 0 };
    }
  }, [annualSalary]);

  // SAFE RESULTS: Prevents one bad method from crashing the whole list
  const results: ComparisonResult[] = useMemo(() => {
    const arr: ComparisonResult[] = [];
    try {
      if (comparisonMethods.outright) arr.push(calculateOutrightPurchase(userInputs));
      if (comparisonMethods.finance) arr.push(calculateFinance(userInputs));
      if (comparisonMethods.novated) arr.push(calculateNovatedLease(userInputs));
    } catch (e) {
      console.error("Comparison calculation failed", e);
    }
    return arr;
  }, [userInputs, comparisonMethods]);

  const lowestCostMethod = useMemo(() => {
    if (results.length === 0) return null;
    return results.reduce((min, r) => r.totalLifetimeCost < min.totalLifetimeCost ? r : min, results[0]).method;
  }, [results]);

  const hasNoMethods = !comparisonMethods.outright && !comparisonMethods.finance && !comparisonMethods.novated;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CalculatorIcon className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold hidden sm:block">Car Lease vs Loan Calculator Australia</h1>
            <h1 className="text-lg font-semibold sm:hidden">Lease vs Loan Calculator</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ASIDE WITH MIN-WIDTH: Ensures column exists even if content errors */}
          <aside className="w-full lg:w-[450px] lg:min-w-[450px] flex-none box-border px-4 overflow-x-visible">
              <ScrollArea>
                <ErrorBoundary fallbackMessage="Calculations hit a snag. Please check your inputs or refresh.">
                <div className="space-y-4 pb-6 box-border">
                  <VehicleSelector
                    fuelType={fuelType}
                    driveAwayPrice={driveAwayPrice}
                    onFuelTypeChange={handleFuelTypeChange}
                    onPriceChange={setDriveAwayPrice}
                  />
                
                  <UsageAssumptions
                    ownershipYears={ownershipYears}
                    kmPerYear={kmPerYear}
                    onOwnershipChange={setOwnershipYears}
                    onKmChange={setKmPerYear}
                  />

                  <RunningCosts
                    fuelType={fuelType}
                    fuelCostAmount={fuelCostAmount}
                    fuelCostPeriod={fuelCostPeriod}
                    kmPerYear={kmPerYear}
                    insuranceAnnual={insuranceAnnual}
                    servicingAnnual={servicingAnnual}
                    tyresAnnual={tyresAnnual}
                    regoCtpAnnual={regoCtpAnnual}
                    onFuelCostAmountChange={setFuelCostAmount}
                    onFuelCostPeriodChange={setFuelCostPeriod}
                    onInsuranceChange={setInsuranceAnnual}
                    onServicingChange={setServicingAnnual}
                    onTyresChange={setTyresAnnual}
                    onRegoCtpChange={setRegoCtpAnnual}
                  />

                  {/* Simplified Salary Component - Stable Version */}
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Wallet className="h-5 w-5 text-primary" />
                        Your Salary & Pay Cycle
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="annual-salary" className="text-sm font-medium">Annual Gross Salary</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input
                            id="annual-salary"
                            type="number"
                            value={annualSalary || ''}
                            onChange={(e) => {
                              const val = e.target.value === '' ? 0 : Number(e.target.value);
                              if (!isNaN(val)) setAnnualSalary(val);
                            }}
                            className="pl-7 text-right font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Pay Frequency</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['weekly', 'fortnightly', 'monthly'] as const).map((freq) => (
                            <button
                              key={freq}
                              onClick={() => setPayFrequency(freq)}
                              className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                                payFrequency === freq 
                                  ? 'border-primary bg-primary/10 text-primary' 
                                  : 'border-input hover:bg-accent'
                              }`}
                            >
                              {freq === 'weekly' ? 'Weekly' : freq === 'fortnightly' ? 'Fortnightly' : 'Monthly'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1 text-sm pt-2 border-t">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Take-home ({payFrequency}):</span>
                          <span className="font-mono">{formatCurrency(convertToDisplayPeriod(taxCalculation.netTakeHomePay, payFrequency))}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <ComparisonToggles
                    outright={comparisonMethods.outright}
                    finance={comparisonMethods.finance}
                    novated={comparisonMethods.novated}
                    onToggle={handleToggle}
                  />

                  <FinanceOptions
                    showFinance={comparisonMethods.finance}
                    showNovated={comparisonMethods.novated}
                    fuelType={fuelType}
                    financeInterestRate={financeInterestRate}
                    financeDeposit={financeDeposit}
                    novatedInterestRate={novatedInterestRate}
                    workUseOver50={workUseOver50}
                    businessUsePercentage={businessUsePercentage}
                    driveAwayPrice={driveAwayPrice}
                    onFinanceInterestChange={setFinanceInterestRate}
                    onFinanceDepositChange={setFinanceDeposit}
                    onNovatedInterestChange={setNovatedInterestRate}
                    onWorkUseChange={setWorkUseOver50}
                    onBusinessUsePercentageChange={setBusinessUsePercentage}
                  />
                </div>
                </ErrorBoundary>
              </ScrollArea>
          </aside>

          <div className="flex-1 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl font-semibold">Cost Comparison</h2>
              <DisplayToggle
                displayPeriod={displayPeriod}
                onDisplayChange={setDisplayPeriod}
              />
            </div>

            {hasNoMethods ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No comparison methods selected</h3>
                <p className="text-muted-foreground max-w-md">
                  Toggle at least one comparison method in the left panel to see the cost analysis.
                </p>
              </div>
            ) : (
              <>
                <CostChart results={results} />

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {results.map(result => (
                    <ComparisonResultCard
                      key={result.method}
                      result={result}
                      displayPeriod={displayPeriod}
                      isLowest={result.method === lowestCostMethod}
                      ownershipYears={ownershipYears}
                      payFrequency={payFrequency}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Wrapper for the card to ensure it doesn't crash if passed bad props
function ComparisonResultCard(props: any) {
  return (
    <ErrorBoundary fallbackMessage="Could not display this comparison.">
      <ComparisonCard {...props} />
    </ErrorBoundary>
  );
}