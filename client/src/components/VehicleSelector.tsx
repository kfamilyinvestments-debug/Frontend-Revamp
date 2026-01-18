import { Car, Fuel, Zap, Leaf, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FuelType } from '@/lib/types';

// FBT Exemption Constants
const LCT_THRESHOLD = 91387;
const GOVT_COSTS_BUFFER = 5000;
const DRIVE_AWAY_THRESHOLD = LCT_THRESHOLD + GOVT_COSTS_BUFFER; // 96387

interface VehicleSelectorProps {
  fuelType: FuelType;
  driveAwayPrice: number;
  onFuelTypeChange: (fuelType: FuelType) => void;
  onPriceChange: (price: number) => void;
}

function getFuelIcon(fuelType: FuelType) {
  switch (fuelType) {
    case 'petrol_diesel':
      return <Fuel className="h-5 w-5" />;
    case 'plugin_hybrid':
      return <Leaf className="h-5 w-5" />;
    case 'ev':
      return <Zap className="h-5 w-5" />;
  }
}

function getFuelLabel(fuelType: FuelType) {
  switch (fuelType) {
    case 'petrol_diesel': return 'Petrol / Diesel';
    case 'plugin_hybrid': return 'Plug-in Hybrid';
    case 'ev': return 'Electric Vehicle';
  }
}

function getFuelDescription(fuelType: FuelType) {
  switch (fuelType) {
    case 'petrol_diesel': return 'Traditional combustion engine';
    case 'plugin_hybrid': return 'Combined petrol & electric';
    case 'ev': return 'Fully electric, FBT exempt';
  }
}

export function VehicleSelector({ fuelType, driveAwayPrice, onFuelTypeChange, onPriceChange }: VehicleSelectorProps) {
  // Check if EV exceeds FBT exemption threshold
  const isEV = fuelType === 'ev';
  const exceedsThreshold = isEV && driveAwayPrice > DRIVE_AWAY_THRESHOLD;
  
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Car className="h-5 w-5 text-primary" />
          Vehicle Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Vehicle Type</Label>
          <RadioGroup
            value={fuelType}
            onValueChange={(value) => onFuelTypeChange(value as FuelType)}
            className="space-y-2"
          >
            {(['petrol_diesel', 'plugin_hybrid', 'ev'] as FuelType[]).map((type) => (
              <Label
                key={type}
                htmlFor={`fuel-${type}`}
                className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                  fuelType === type 
                    ? 'border-primary bg-primary/5' 
                    : 'border-input hover:bg-accent/50'
                }`}
              >
                <RadioGroupItem value={type} id={`fuel-${type}`} className="sr-only" />
                <div className={`p-2 rounded-md ${fuelType === type ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {getFuelIcon(type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium" data-testid={`fuel-type-${type}`}>{getFuelLabel(type)}</span>
                    {type === 'ev' && (
                      <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-xs">
                        FBT Exempt
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{getFuelDescription(type)}</p>
                </div>
              </Label>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="drive-away-price" className="text-sm font-medium">Drive-away Price</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="drive-away-price"
              type="number"
              value={driveAwayPrice}
              onChange={(e) => onPriceChange(Number(e.target.value))}
              className="pl-7 text-right font-mono"
              placeholder="45000"
              data-testid="input-drive-away-price"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            The total price including all on-road costs
          </p>
        </div>

        {/* FBT Exemption Warning for EVs exceeding threshold */}
        {exceedsThreshold && (
          <Alert variant="destructive" className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <AlertDescription className="text-sm text-orange-800 dark:text-orange-200">
              <strong>⚠️ Warning:</strong> This drive-away price likely exceeds the ${LCT_THRESHOLD.toLocaleString()} Luxury Car Tax (LCT) threshold for EVs. 
              This vehicle may not be FBT exempt and could be calculated as a fuel vehicle.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
