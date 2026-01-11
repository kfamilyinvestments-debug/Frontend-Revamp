import { ToggleLeft, Banknote, CreditCard, Receipt, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ComparisonTogglesProps {
  outright: boolean;
  finance: boolean;
  novated: boolean;
  onToggle: (method: 'outright' | 'finance' | 'novated', enabled: boolean) => void;
}

export function ComparisonToggles({ outright, finance, novated, onToggle }: ComparisonTogglesProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ToggleLeft className="h-5 w-5 text-primary" />
          Compare Methods
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Banknote className="h-5 w-5 text-chart-1" />
            <div>
              <Label htmlFor="toggle-outright" className="text-sm font-medium cursor-pointer">Outright Purchase</Label>
              <p className="text-xs text-muted-foreground">Pay upfront in cash</p>
            </div>
          </div>
          <Switch
            id="toggle-outright"
            checked={outright}
            onCheckedChange={(checked) => onToggle('outright', checked)}
            data-testid="toggle-outright"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-chart-2" />
            <div>
              <Label htmlFor="toggle-finance" className="text-sm font-medium cursor-pointer">Car Finance</Label>
              <p className="text-xs text-muted-foreground">Traditional loan with interest</p>
            </div>
          </div>
          <Switch
            id="toggle-finance"
            checked={finance}
            onCheckedChange={(checked) => onToggle('finance', checked)}
            data-testid="toggle-finance"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Receipt className="h-5 w-5 text-chart-3" />
            <div className="flex items-center gap-1.5">
              <Label htmlFor="toggle-novated" className="text-sm font-medium cursor-pointer">Novated Lease</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>A salary sacrifice arrangement where your employer pays for your car from your pre-tax salary, potentially reducing your taxable income.</p>
                </TooltipContent>
              </Tooltip>
              <p className="text-xs text-muted-foreground ml-1">Pre-tax salary sacrifice</p>
            </div>
          </div>
          <Switch
            id="toggle-novated"
            checked={novated}
            onCheckedChange={(checked) => onToggle('novated', checked)}
            data-testid="toggle-novated"
          />
        </div>
      </CardContent>
    </Card>
  );
}
