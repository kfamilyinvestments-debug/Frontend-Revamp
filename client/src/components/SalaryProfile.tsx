import { Wallet, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { TaxCalculation } from '@/lib/types';
import { formatCurrency } from '@/lib/calculations';

interface SalaryProfileProps {
  annualSalary: number;
  payFrequency: 'weekly' | 'fortnightly' | 'monthly';
  taxCalculation: TaxCalculation;
  onSalaryChange: (salary: number) => void;
  onFrequencyChange: (frequency: 'weekly' | 'fortnightly' | 'monthly') => void;
}

export function SalaryProfile({ 
  annualSalary, 
  payFrequency, 
  taxCalculation,
  onSalaryChange, 
  onFrequencyChange 
}: SalaryProfileProps) {
  const getPayCycleAmount = (annual: number) => {
    switch (payFrequency) {
      case 'weekly': return annual / 52;
      case 'fortnightly': return annual / 26;
      case 'monthly': return annual / 12;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wallet className="h-5 w-5 text-primary" />
          Your Salary & Pay Cycle
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Used to calculate your take-home pay impact, especially for novated leasing.</p>
            </TooltipContent>
          </Tooltip>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="annual-salary" className="text-sm font-medium">Annual Gross Salary</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="annual-salary"
              type="number"
              value={annualSalary}
              onChange={(e) => onSalaryChange(Number(e.target.value))}
              className="pl-7 text-right font-mono"
              data-testid="input-annual-salary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Pay Frequency</Label>
          <RadioGroup
            value={payFrequency}
            onValueChange={(value) => onFrequencyChange(value as 'weekly' | 'fortnightly' | 'monthly')}
            className="grid grid-cols-3 gap-2"
          >
            <Label
              htmlFor="weekly"
              className={`flex items-center justify-center rounded-md border px-3 py-2 cursor-pointer transition-colors ${
                payFrequency === 'weekly' 
                  ? 'border-primary bg-primary/10 text-primary' 
                  : 'border-input hover:bg-accent'
              }`}
            >
              <RadioGroupItem value="weekly" id="weekly" className="sr-only" />
              <span className="text-sm font-medium" data-testid="radio-weekly">Weekly</span>
            </Label>
            <Label
              htmlFor="fortnightly"
              className={`flex items-center justify-center rounded-md border px-3 py-2 cursor-pointer transition-colors ${
                payFrequency === 'fortnightly' 
                  ? 'border-primary bg-primary/10 text-primary' 
                  : 'border-input hover:bg-accent'
              }`}
            >
              <RadioGroupItem value="fortnightly" id="fortnightly" className="sr-only" />
              <span className="text-sm font-medium" data-testid="radio-fortnightly">Fortnightly</span>
            </Label>
            <Label
              htmlFor="monthly"
              className={`flex items-center justify-center rounded-md border px-3 py-2 cursor-pointer transition-colors ${
                payFrequency === 'monthly' 
                  ? 'border-primary bg-primary/10 text-primary' 
                  : 'border-input hover:bg-accent'
              }`}
            >
              <RadioGroupItem value="monthly" id="monthly" className="sr-only" />
              <span className="text-sm font-medium" data-testid="radio-monthly">Monthly</span>
            </Label>
          </RadioGroup>
        </div>

        <div className="mt-4 p-4 rounded-lg bg-muted/50 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Gross Income</span>
            <span className="font-mono font-medium">{formatCurrency(taxCalculation.grossIncome)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Income Tax</span>
            <span className="font-mono text-red-600 dark:text-red-400">-{formatCurrency(taxCalculation.incomeTax)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Medicare Levy</span>
            <span className="font-mono text-red-600 dark:text-red-400">-{formatCurrency(taxCalculation.medicareLevy)}</span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between">
              <span className="font-medium">Take-home Pay</span>
              <span className="font-mono font-semibold text-primary">{formatCurrency(getPayCycleAmount(taxCalculation.netTakeHomePay))}<span className="text-xs text-muted-foreground ml-1">/{payFrequency === 'weekly' ? 'wk' : payFrequency === 'fortnightly' ? 'fn' : 'mo'}</span></span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
