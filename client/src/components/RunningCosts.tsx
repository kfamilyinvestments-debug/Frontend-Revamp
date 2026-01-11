import { DollarSign, Fuel, Shield, Wrench, CircleDot, FileText, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { FuelType } from '@/lib/types';

interface RunningCostsProps {
  fuelType: FuelType;
  fuelPrice: number;
  electricityPrice: number;
  insuranceAnnual: number;
  servicingAnnual: number;
  tyresAnnual: number;
  regoCtpAnnual: number;
  onFuelPriceChange: (price: number) => void;
  onElectricityPriceChange: (price: number) => void;
  onInsuranceChange: (amount: number) => void;
  onServicingChange: (amount: number) => void;
  onTyresChange: (amount: number) => void;
  onRegoCtpChange: (amount: number) => void;
}

interface CostInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  suffix?: string;
  icon: React.ReactNode;
  tooltip?: string;
  defaultHint?: string;
  testId: string;
}

function CostInput({ label, value, onChange, min, max, step, prefix = '$', suffix, icon, tooltip, defaultHint, testId }: CostInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {icon}
          <Label className="text-sm font-medium">{label}</Label>
          {tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <div className="relative w-28">
          {prefix && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{prefix}</span>}
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className={`text-right font-mono ${prefix ? 'pl-6' : ''} ${suffix ? 'pr-12' : 'pr-3'}`}
            data-testid={testId}
          />
          {suffix && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{suffix}</span>}
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
      {defaultHint && (
        <p className="text-xs text-muted-foreground">{defaultHint}</p>
      )}
    </div>
  );
}

export function RunningCosts({
  fuelType,
  fuelPrice,
  electricityPrice,
  insuranceAnnual,
  servicingAnnual,
  tyresAnnual,
  regoCtpAnnual,
  onFuelPriceChange,
  onElectricityPriceChange,
  onInsuranceChange,
  onServicingChange,
  onTyresChange,
  onRegoCtpChange,
}: RunningCostsProps) {
  const isEV = fuelType === 'ev';

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <DollarSign className="h-5 w-5 text-primary" />
          Running Costs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {isEV ? (
          <CostInput
            label="Electricity Price"
            value={electricityPrice}
            onChange={onElectricityPriceChange}
            min={0.15}
            max={0.50}
            step={0.01}
            prefix="$"
            suffix="/kWh"
            icon={<Fuel className="h-4 w-4 text-muted-foreground" />}
            tooltip="Average cost per kWh for home charging"
            defaultHint="Average: $0.30/kWh"
            testId="input-electricity-price"
          />
        ) : (
          <CostInput
            label="Fuel Price"
            value={fuelPrice}
            onChange={onFuelPriceChange}
            min={1.20}
            max={2.50}
            step={0.01}
            prefix="$"
            suffix="/L"
            icon={<Fuel className="h-4 w-4 text-muted-foreground" />}
            tooltip={`Average cost per litre of ${fuelType === 'diesel' ? 'diesel' : 'petrol'}`}
            defaultHint="Average: $1.85/L"
            testId="input-fuel-price"
          />
        )}

        <CostInput
          label="Insurance (Annual)"
          value={insuranceAnnual}
          onChange={onInsuranceChange}
          min={500}
          max={5000}
          step={50}
          prefix="$"
          icon={<Shield className="h-4 w-4 text-muted-foreground" />}
          tooltip="Comprehensive insurance premium per year"
          defaultHint="Estimate based on vehicle value"
          testId="input-insurance"
        />

        <CostInput
          label="Servicing (Annual)"
          value={servicingAnnual}
          onChange={onServicingChange}
          min={100}
          max={2000}
          step={25}
          prefix="$"
          icon={<Wrench className="h-4 w-4 text-muted-foreground" />}
          tooltip="Average annual service costs including scheduled maintenance"
          defaultHint="Based on manufacturer schedule"
          testId="input-servicing"
        />

        <CostInput
          label="Tyres (Per Set)"
          value={tyresAnnual}
          onChange={onTyresChange}
          min={400}
          max={2000}
          step={50}
          prefix="$"
          icon={<CircleDot className="h-4 w-4 text-muted-foreground" />}
          tooltip="Cost for a full set of tyres (replaced every ~45,000km)"
          defaultHint="Average tyre life: 45,000 km"
          testId="input-tyres"
        />

        <CostInput
          label="Rego + CTP (Annual)"
          value={regoCtpAnnual}
          onChange={onRegoCtpChange}
          min={500}
          max={2000}
          step={25}
          prefix="$"
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          tooltip="Registration and Compulsory Third Party insurance"
          defaultHint="State average estimate"
          testId="input-rego-ctp"
        />
      </CardContent>
    </Card>
  );
}
