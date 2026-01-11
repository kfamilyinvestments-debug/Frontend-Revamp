import { Settings, Percent, Wallet, Briefcase, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { FuelType } from '@/lib/types';

interface FinanceOptionsProps {
  showFinance: boolean;
  showNovated: boolean;
  fuelType: FuelType;
  financeInterestRate: number;
  financeDeposit: number;
  novatedInterestRate: number;
  workUseOver50: boolean;
  driveAwayPrice: number;
  onFinanceInterestChange: (rate: number) => void;
  onFinanceDepositChange: (deposit: number) => void;
  onNovatedInterestChange: (rate: number) => void;
  onWorkUseChange: (workUse: boolean) => void;
}

export function FinanceOptions({
  showFinance,
  showNovated,
  fuelType,
  financeInterestRate,
  financeDeposit,
  novatedInterestRate,
  workUseOver50,
  driveAwayPrice,
  onFinanceInterestChange,
  onFinanceDepositChange,
  onNovatedInterestChange,
  onWorkUseChange,
}: FinanceOptionsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const isEV = fuelType === 'ev';

  if (!showFinance && !showNovated) return null;

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-4">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full flex items-center justify-between p-0 h-auto hover:bg-transparent">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5 text-primary" />
                Finance Options
              </CardTitle>
              <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {showFinance && (
              <div className="space-y-4 pb-4 border-b">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Car Finance</h4>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm font-medium">Interest Rate</Label>
                    </div>
                    <span className="font-mono font-semibold text-primary">{financeInterestRate.toFixed(1)}%</span>
                  </div>
                  <Slider
                    value={[financeInterestRate]}
                    onValueChange={([value]) => onFinanceInterestChange(value)}
                    min={4}
                    max={15}
                    step={0.1}
                    className="w-full"
                    data-testid="slider-finance-rate"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>4%</span>
                    <span>15%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm font-medium">Deposit</Label>
                    </div>
                    <div className="relative w-28">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        type="number"
                        value={financeDeposit}
                        onChange={(e) => onFinanceDepositChange(Math.min(Number(e.target.value), driveAwayPrice))}
                        className="pl-6 text-right font-mono"
                        data-testid="input-finance-deposit"
                      />
                    </div>
                  </div>
                  <Slider
                    value={[financeDeposit]}
                    onValueChange={([value]) => onFinanceDepositChange(value)}
                    min={0}
                    max={driveAwayPrice * 0.5}
                    step={500}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {showNovated && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Novated Lease</h4>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm font-medium">Interest Rate</Label>
                    </div>
                    <span className="font-mono font-semibold text-primary">{novatedInterestRate.toFixed(1)}%</span>
                  </div>
                  <Slider
                    value={[novatedInterestRate]}
                    onValueChange={([value]) => onNovatedInterestChange(value)}
                    min={5}
                    max={15}
                    step={0.1}
                    className="w-full"
                    data-testid="slider-novated-rate"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>5%</span>
                    <span>15%</span>
                  </div>
                </div>

                {!isEV && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <Label htmlFor="work-use" className="text-sm font-medium cursor-pointer">Work use over 50%</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help inline ml-1.5" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>If you use the vehicle primarily for work, you may qualify for the Operating Cost Method which can reduce FBT.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                    <Switch
                      id="work-use"
                      checked={workUseOver50}
                      onCheckedChange={onWorkUseChange}
                      data-testid="toggle-work-use"
                    />
                  </div>
                )}

                {isEV && (
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                    <p className="text-sm text-emerald-700 dark:text-emerald-400">
                      <strong>FBT Exempt:</strong> Electric vehicles qualify for FBT exemption. All lease payments and running costs are fully pre-tax.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
