import { Calendar, Route } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';

interface UsageAssumptionsProps {
  ownershipYears: number;
  kmPerYear: number;
  onOwnershipChange: (years: number) => void;
  onKmChange: (km: number) => void;
}

export function UsageAssumptions({ ownershipYears, kmPerYear, onOwnershipChange, onKmChange }: UsageAssumptionsProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-primary" />
          Usage Assumptions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Ownership Period</Label>
            <span className="text-lg font-semibold font-mono text-primary">{ownershipYears} {ownershipYears === 1 ? 'year' : 'years'}</span>
          </div>
          <Slider
            value={[ownershipYears]}
            onValueChange={([value]) => onOwnershipChange(value)}
            min={1}
            max={5}
            step={1}
            className="w-full"
            data-testid="slider-ownership-years"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 year</span>
            <span>5 years</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Route className="h-4 w-4" />
              Annual Kilometres
            </Label>
            <div className="relative w-32">
              <Input
                type="number"
                value={kmPerYear}
                onChange={(e) => onKmChange(Number(e.target.value))}
                className="text-right font-mono pr-10"
                data-testid="input-km-per-year"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">km</span>
            </div>
          </div>
          <Slider
            value={[kmPerYear]}
            onValueChange={([value]) => onKmChange(value)}
            min={5000}
            max={40000}
            step={1000}
            className="w-full"
            data-testid="slider-km-per-year"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>5,000 km</span>
            <span>40,000 km</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
