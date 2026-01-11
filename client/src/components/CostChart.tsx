import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { ComparisonResult } from '@/lib/types';
import { formatCurrency } from '@/lib/calculations';

interface CostChartProps {
  results: ComparisonResult[];
}

const COLORS = {
  outright: 'hsl(var(--chart-1))',
  finance: 'hsl(var(--chart-2))',
  novated: 'hsl(var(--chart-3))',
};

const LABELS = {
  outright: 'Outright',
  finance: 'Finance',
  novated: 'Novated',
};

export function CostChart({ results }: CostChartProps) {
  if (results.length === 0) return null;

  const data = results.map(r => ({
    name: LABELS[r.method],
    cost: r.totalLifetimeCost,
    method: r.method,
  }));

  const minCost = Math.min(...results.map(r => r.totalLifetimeCost));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5 text-primary" />
          Total Cost Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis 
                type="number" 
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={70}
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 13 }}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Total Cost']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Bar dataKey="cost" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.method as keyof typeof COLORS]}
                    opacity={entry.cost === minCost ? 1 : 0.7}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
