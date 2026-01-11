import { useState, useMemo, useCallback } from 'react';
import { Calculator as CalculatorIcon, AlertCircle } from 'lucide-react';
import { VehicleSelector } from '@/components/VehicleSelector';
import { UsageAssumptions } from '@/components/UsageAssumptions';
import { RunningCosts } from '@/components/RunningCosts';
import { SalaryProfile } from '@/components/SalaryProfile';
import { ComparisonToggles } from '@/components/ComparisonToggles';
import { FinanceOptions } from '@/components/FinanceOptions';
import { ComparisonCard } from '@/components/ComparisonCard';
import { CostChart } from '@/components/CostChart';
import { DisplayToggle } from '@/components/DisplayToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FuelType,
  UserInputs,
  ComparisonResult,
  DEFAULT_SERVICING_COSTS
} from '@/lib/types';
import { 
  calculateAustralianTax, 
  calculateOutrightPurchase, 
  calculateFinance, 
  calculateNovatedLease 
} from '@/lib/calculations';

export default function Calculator() {
  const [fuelType, setFuelType] = useState<FuelType>('petrol_diesel');
  const [driveAwayPrice, setDriveAwayPrice] = useState(45000);
  const [ownershipYears, setOwnershipYears] = useState(3);
  const [kmPerYear, setKmPerYear] = useState(15000);
  const [fuelPrice, setFuelPrice] = useState(1.85);
  const [insuranceAnnual, setInsuranceAnnual] = useState(1200);
  const [servicingAnnual, setServicingAnnual] = useState(550);
  const [tyresAnnual, setTyresAnnual] = useState(800);
  const [regoCtpAnnual, setRegoCtpAnnual] = useState(900);
  const [annualSalary, setAnnualSalary] = useState(100000);
  const [payFrequency, setPayFrequency] = useState<'weekly' | 'fortnightly' | 'monthly'>('fortnightly');
  const [financeInterestRate, setFinanceInterestRate] = useState(8.5);
  const [financeDeposit, setFinanceDeposit] = useState(0);
  const [novatedInterestRate, setNovatedInterestRate] = useState(9.0);
  const [workUseOver50, setWorkUseOver50] = useState(false);
  const [comparisonMethods, setComparisonMethods] = useState({
    outright: true,
    finance: true,
    novated: true,
  });
  const [displayPeriod, setDisplayPeriod] = useState<'weekly' | 'fortnightly' | 'monthly' | 'annually'>('annually');

  const handleFuelTypeChange = useCallback((newFuelType: FuelType) => {
    setFuelType(newFuelType);
    setServicingAnnual(DEFAULT_SERVICING_COSTS[newFuelType]);
  }, []);

  const handleToggle = useCallback((method: 'outright' | 'finance' | 'novated', enabled: boolean) => {
    setComparisonMethods(prev => ({ ...prev, [method]: enabled }));
  }, []);

  const userInputs: UserInputs = useMemo(() => ({
    fuelType,
    driveAwayPrice,
    ownershipYears,
    kmPerYear,
    fuelPrice,
    insuranceAnnual,
    servicingAnnual,
    tyresAnnual,
    regoCtpAnnual,
    annualSalary,
    payFrequency,
    financeInterestRate,
    financeDeposit,
    novatedInterestRate,
    workUseOver50,
    comparisonMethods,
    displayPeriod,
  }), [
    fuelType,
    driveAwayPrice,
    ownershipYears,
    kmPerYear,
    fuelPrice,
    insuranceAnnual,
    servicingAnnual,
    tyresAnnual,
    regoCtpAnnual,
    annualSalary,
    payFrequency,
    financeInterestRate,
    financeDeposit,
    novatedInterestRate,
    workUseOver50,
    comparisonMethods,
    displayPeriod,
  ]);

  const taxCalculation = useMemo(() => calculateAustralianTax(annualSalary), [annualSalary]);

  const results: ComparisonResult[] = useMemo(() => {
    const arr: ComparisonResult[] = [];
    if (comparisonMethods.outright) arr.push(calculateOutrightPurchase(userInputs));
    if (comparisonMethods.finance) arr.push(calculateFinance(userInputs));
    if (comparisonMethods.novated) arr.push(calculateNovatedLease(userInputs));
    return arr;
  }, [userInputs, comparisonMethods]);

  const lowestCostMethod = useMemo(() => {
    if (results.length === 0) return null;
    return results.reduce((min, r) => r.totalLifetimeCost < min.totalLifetimeCost ? r : min, results[0]).method;
  }, [results]);

  const lowestPayImpactMethod = useMemo(() => {
    const novatedResult = results.find(r => r.method === 'novated');
    if (novatedResult && novatedResult.takeHomePayReduction !== undefined) {
      const otherMethods = results.filter(r => r.method !== 'novated');
      const novatedPayImpact = novatedResult.takeHomePayReduction;
      const allLower = otherMethods.every(r => {
        const otherPayImpact = r.costPerPayCycle;
        return novatedPayImpact < otherPayImpact;
      });
      if (allLower) return 'novated';
    }
    return null;
  }, [results]);

  const hasNoMethods = !comparisonMethods.outright && !comparisonMethods.finance && !comparisonMethods.novated;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CalculatorIcon className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold hidden sm:block">Car Cost Calculator</h1>
            <h1 className="text-lg font-semibold sm:hidden">Cost Calculator</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-96 lg:flex-shrink-0">
            <ScrollArea className="lg:h-[calc(100vh-8rem)]">
              <div className="space-y-4 pb-6 pr-2">
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
                  fuelPrice={fuelPrice}
                  kmPerYear={kmPerYear}
                  insuranceAnnual={insuranceAnnual}
                  servicingAnnual={servicingAnnual}
                  tyresAnnual={tyresAnnual}
                  regoCtpAnnual={regoCtpAnnual}
                  onFuelPriceChange={setFuelPrice}
                  onInsuranceChange={setInsuranceAnnual}
                  onServicingChange={setServicingAnnual}
                  onTyresChange={setTyresAnnual}
                  onRegoCtpChange={setRegoCtpAnnual}
                />

                <SalaryProfile
                  annualSalary={annualSalary}
                  payFrequency={payFrequency}
                  taxCalculation={taxCalculation}
                  onSalaryChange={setAnnualSalary}
                  onFrequencyChange={setPayFrequency}
                />

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
                  driveAwayPrice={driveAwayPrice}
                  onFinanceInterestChange={setFinanceInterestRate}
                  onFinanceDepositChange={setFinanceDeposit}
                  onNovatedInterestChange={setNovatedInterestRate}
                  onWorkUseChange={setWorkUseOver50}
                />
              </div>
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
                    <ComparisonCard
                      key={result.method}
                      result={result}
                      displayPeriod={displayPeriod}
                      isLowest={result.method === lowestCostMethod}
                      isLowestPayImpact={result.method === lowestPayImpactMethod}
                      ownershipYears={ownershipYears}
                      payFrequency={payFrequency}
                    />
                  ))}
                </div>
              </>
            )}

            <footer className="pt-8 pb-4 border-t">
              <p className="text-xs text-muted-foreground text-center max-w-2xl mx-auto">
                This calculator provides estimates only and does not constitute financial or tax advice. 
                Actual costs may vary based on individual circumstances, market conditions, and specific 
                vehicle and financing terms. Please consult with a qualified financial advisor for 
                personalized advice.
              </p>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}
