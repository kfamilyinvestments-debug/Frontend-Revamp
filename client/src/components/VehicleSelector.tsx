import { Car, Fuel, Zap, Leaf } from 'lucide-react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Vehicle, SAMPLE_VEHICLES, FuelType } from '@/lib/types';
import { formatCurrency } from '@/lib/calculations';

interface VehicleSelectorProps {
  selectedVehicle: Vehicle;
  driveAwayPrice: number;
  onVehicleChange: (vehicle: Vehicle) => void;
  onPriceChange: (price: number) => void;
}

function getFuelIcon(fuelType: FuelType) {
  switch (fuelType) {
    case 'petrol':
    case 'diesel':
      return <Fuel className="h-4 w-4" />;
    case 'hybrid':
      return <Leaf className="h-4 w-4" />;
    case 'ev':
      return <Zap className="h-4 w-4" />;
  }
}

function getFuelLabel(fuelType: FuelType) {
  switch (fuelType) {
    case 'petrol': return 'Petrol';
    case 'diesel': return 'Diesel';
    case 'hybrid': return 'Hybrid';
    case 'ev': return 'Electric';
  }
}

function getFuelBadgeVariant(fuelType: FuelType): 'default' | 'secondary' | 'outline' {
  switch (fuelType) {
    case 'ev': return 'default';
    case 'hybrid': return 'secondary';
    default: return 'outline';
  }
}

export function VehicleSelector({ selectedVehicle, driveAwayPrice, onVehicleChange, onPriceChange }: VehicleSelectorProps) {
  const petrolDiesel = SAMPLE_VEHICLES.filter(v => v.fuelType === 'petrol' || v.fuelType === 'diesel');
  const hybrids = SAMPLE_VEHICLES.filter(v => v.fuelType === 'hybrid');
  const evs = SAMPLE_VEHICLES.filter(v => v.fuelType === 'ev');

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Car className="h-5 w-5 text-primary" />
          Vehicle Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="vehicle-select" className="text-sm font-medium">Select Vehicle</Label>
          <Select
            value={selectedVehicle.id}
            onValueChange={(value) => {
              const vehicle = SAMPLE_VEHICLES.find(v => v.id === value);
              if (vehicle) {
                onVehicleChange(vehicle);
                onPriceChange(vehicle.driveAwayPrice);
              }
            }}
          >
            <SelectTrigger id="vehicle-select" data-testid="select-vehicle">
              <SelectValue placeholder="Select a vehicle" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Petrol / Diesel</SelectLabel>
                {petrolDiesel.map(v => (
                  <SelectItem key={v.id} value={v.id} data-testid={`vehicle-option-${v.id}`}>
                    <div className="flex items-center gap-2">
                      {getFuelIcon(v.fuelType)}
                      <span>{v.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Hybrid</SelectLabel>
                {hybrids.map(v => (
                  <SelectItem key={v.id} value={v.id} data-testid={`vehicle-option-${v.id}`}>
                    <div className="flex items-center gap-2">
                      {getFuelIcon(v.fuelType)}
                      <span>{v.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Electric (EV)</SelectLabel>
                {evs.map(v => (
                  <SelectItem key={v.id} value={v.id} data-testid={`vehicle-option-${v.id}`}>
                    <div className="flex items-center gap-2">
                      {getFuelIcon(v.fuelType)}
                      <span>{v.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={getFuelBadgeVariant(selectedVehicle.fuelType)} className="gap-1">
            {getFuelIcon(selectedVehicle.fuelType)}
            {getFuelLabel(selectedVehicle.fuelType)}
          </Badge>
          {selectedVehicle.fuelType === 'ev' && (
            <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">
              <Zap className="h-3 w-3 mr-1" />
              FBT Exempt
            </Badge>
          )}
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
              data-testid="input-drive-away-price"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Default: {formatCurrency(selectedVehicle.driveAwayPrice)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
