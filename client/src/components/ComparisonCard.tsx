import { Check, TrendingDown, Zap, CreditCard, Banknote, Receipt, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ComparisonResult } from '@/lib/types';
import { formatCurrency, convertToDisplayPeriod, getDisplayPeriodLabel } from '@/lib/calculations';

interface ComparisonCardProps {
  result: ComparisonResult;
  displayPeriod: 'weekly' | 'fortnightly' | 'monthly' | 'annually';
  isLowest: boolean;
  isLowestPayImpact: boolean;
  ownershipYears: number;
  payFrequency: 'weekly' | 'fortnightly' | 'monthly';
}

function getMethodIcon(method: 'outright' | 'finance' | 'novated') {
  switch (method) {
    case 'outright': return <Banknote className="h-5 w-5" />;
    case 'finance': return <CreditCard className="h-5 w-5" />;
    case 'novated': return <Receipt className="h-5 w-5" />;
  }
}

function getMethodTitle(method: 'outright' | 'finance' | 'novated') {
  switch (method) {
    case 'outright': return 'Outright Purchase';
    case 'finance': return 'Car Finance';
    case 'novated': return 'Novated Lease';
  }
}

function getMethodColor(method: 'outright' | 'finance' | 'novated') {
  switch (method) {
    case 'outright': return 'text-chart-1';
    case 'finance': return 'text-chart-2';
    case 'novated': return 'text-chart-3';
  }
}

export function ComparisonCard({ result, displayPeriod, isLowest, isLowestPayImpact, ownershipYears, payFrequency }: ComparisonCardProps) {
  const periodLabel = getDisplayPeriodLabel(displayPeriod);
  const displayCost = convertToDisplayPeriod(result.totalLifetimeCost / ownershipYears, displayPeriod);
  const payFrequencyLabel = payFrequency === 'weekly' ? 'week' : payFrequency === 'fortnightly' ? 'fortnight' : 'month';

  return (
    <Card className={`relative overflow-visible ${isLowest ? 'ring-2 ring-primary' : ''}`}>
      {isLowest && (
        <Badge className="absolute -top-2.5 left-4 bg-primary text-primary-foreground gap-1">
          <Check className="h-3 w-3" />
          Lowest Cost
        </Badge>
      )}
      {isLowestPayImpact && !isLowest && result.method === 'novated' && (
        <Badge className="absolute -top-2.5 left-4 bg-chart-3 text-white gap-1">
          <TrendingDown className="h-3 w-3" />
          Best Pay Impact
        </Badge>
      )}
      
      <CardHeader className="pb-2">
        <CardTitle className={`flex items-center gap-2 text-lg ${getMethodColor(result.method)}`}>
          {getMethodIcon(result.method)}
          {getMethodTitle(result.method)}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Total Lifetime Cost</p>
          <p className="text-3xl font-bold font-mono" data-testid={`cost-total-${result.method}`}>
            {formatCurrency(result.totalLifetimeCost)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-0.5">Cost{periodLabel}</p>
            <p className="text-lg font-semibold font-mono" data-testid={`cost-period-${result.method}`}>
              {formatCurrency(displayCost)}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-0.5">Per Year</p>
            <p className="text-lg font-semibold font-mono">
              {formatCurrency(result.costPerYear)}
            </p>
          </div>
        </div>

        {result.method === 'novated' && result.takeHomePayReduction !== undefined && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">Take-home Pay Impact</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>This shows how much your take-home pay reduces each {payFrequencyLabel} under a novated lease arrangement.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Before car</span>
                <span className="font-mono">{formatCurrency(result.takeHomePayBefore || 0)}/{payFrequencyLabel.slice(0, 2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">After novated lease</span>
                <span className="font-mono">{formatCurrency(result.takeHomePayAfter || 0)}/{payFrequencyLabel.slice(0, 2)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium pt-1 border-t mt-1">
                <span>Reduction</span>
                <span className="font-mono text-amber-600 dark:text-amber-400" data-testid="novated-pay-reduction">
                  -{formatCurrency(result.takeHomePayReduction)}/{payFrequencyLabel.slice(0, 2)}
                </span>
              </div>
            </div>
            {result.taxSavings && result.taxSavings > 0 && (
              <div className="mt-2 pt-2 border-t flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-600" />
                <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                  {formatCurrency(result.taxSavings)} tax saved over {ownershipYears} years
                </span>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2 pt-2 border-t">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Cost Breakdown</p>
          <div className="space-y-1 text-sm">
            {result.method === 'outright' && (
              <div className="flex justify-between font-medium">
                <span>Vehicle Purchase</span>
                <span className="font-mono">{formatCurrency(result.breakdown.vehicleCost)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fuel/Electricity</span>
              <span className="font-mono">{formatCurrency(result.breakdown.fuel)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Insurance</span>
              <span className="font-mono">{formatCurrency(result.breakdown.insurance)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Servicing</span>
              <span className="font-mono">{formatCurrency(result.breakdown.servicing)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tyres</span>
              <span className="font-mono">{formatCurrency(result.breakdown.tyres)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rego + CTP</span>
              <span className="font-mono">{formatCurrency(result.breakdown.regoCtp)}</span>
            </div>
            {result.breakdown.interest !== undefined && result.breakdown.interest > 0 && (
              <div className="flex justify-between text-amber-600 dark:text-amber-400">
                <span>Interest</span>
                <span className="font-mono">{formatCurrency(result.breakdown.interest)}</span>
              </div>
            )}
            {result.breakdown.fbt !== undefined && result.breakdown.fbt > 0 && (
              <div className="flex justify-between text-amber-600 dark:text-amber-400">
                <span className="flex items-center gap-1">
                  FBT
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3 w-3 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Fringe Benefits Tax - additional tax on non-cash employee benefits like company cars.</p>
                    </TooltipContent>
                  </Tooltip>
                </span>
                <span className="font-mono">{formatCurrency(result.breakdown.fbt)}</span>
              </div>
            )}
            {result.breakdown.balloonPayment !== undefined && result.breakdown.balloonPayment > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1">
                  Balloon Payment
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3 w-3 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>The residual value payable at end of lease term (ATO minimum). You can pay this, refinance, or return the vehicle.</p>
                    </TooltipContent>
                  </Tooltip>
                </span>
                <span className="font-mono">{formatCurrency(result.breakdown.balloonPayment)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-sm text-primary font-medium" data-testid={`insight-${result.method}`}>
            {result.keyInsight}
          </p>
        </div>

        {result.method !== 'novated' && result.breakdown.resaleValue !== undefined && result.breakdown.resaleValue > 0 && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                Est. Resale Value
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3 w-3 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Estimated value of the vehicle at end of ownership. Shown for reference only - not deducted from total cost to ensure fair comparison across all methods.</p>
                  </TooltipContent>
                </Tooltip>
              </span>
              <span className="font-mono text-muted-foreground">{formatCurrency(result.breakdown.resaleValue)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
