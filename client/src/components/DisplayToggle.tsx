import { Clock } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface DisplayToggleProps {
  displayPeriod: 'weekly' | 'fortnightly' | 'monthly' | 'annually';
  onDisplayChange: (period: 'weekly' | 'fortnightly' | 'monthly' | 'annually') => void;
}

export function DisplayToggle({ displayPeriod, onDisplayChange }: DisplayToggleProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>Show costs as:</span>
      </div>
      <RadioGroup
        value={displayPeriod}
        onValueChange={(value) => onDisplayChange(value as 'weekly' | 'fortnightly' | 'monthly' | 'annually')}
        className="flex flex-wrap gap-1"
      >
        {(['weekly', 'fortnightly', 'monthly', 'annually'] as const).map((period) => (
          <Label
            key={period}
            htmlFor={`display-${period}`}
            className={`flex items-center justify-center rounded-md border px-3 py-1.5 cursor-pointer transition-colors text-sm ${
              displayPeriod === period 
                ? 'border-primary bg-primary/10 text-primary font-medium' 
                : 'border-input hover:bg-accent'
            }`}
          >
            <RadioGroupItem value={period} id={`display-${period}`} className="sr-only" />
            <span data-testid={`display-${period}`}>{period.charAt(0).toUpperCase() + period.slice(1)}</span>
          </Label>
        ))}
      </RadioGroup>
    </div>
  );
}
