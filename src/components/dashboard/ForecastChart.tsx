import { MonthlyData } from '@/types/cashflow';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { formatCompactCurrency, formatCurrency } from '@/lib/calculations';
import { AlertTriangle } from 'lucide-react';

interface ForecastChartProps {
  projections: MonthlyData[];
  currency?: string;
}

export function ForecastChart({ projections, currency = 'USD' }: ForecastChartProps) {
  const zeroBalanceMonth = projections.find((p) => p.balance <= 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const balance = payload[0].value;
      return (
        <div className="rounded-lg border border-border bg-card p-4 shadow-lg">
          <p className="mb-2 font-semibold text-foreground">{label}</p>
          <p className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Projected Balance:</span>
            <span className={`font-semibold ${balance <= 0 ? 'text-danger' : 'text-foreground'}`}>
              {formatCurrency(balance, currency)}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card-elevated p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">6-Month Forecast</h3>
          <p className="text-sm text-muted-foreground">
            Based on current income and spending patterns
          </p>
        </div>
        {zeroBalanceMonth && (
          <div className="flex items-center gap-2 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            <AlertTriangle className="h-4 w-4" />
            <span>Cash runs out in {zeroBalanceMonth.month}</span>
          </div>
        )}
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={projections} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(168, 65%, 38%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(168, 65%, 38%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 15%, 90%)" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(220, 10%, 50%)', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(220, 10%, 50%)', fontSize: 12 }}
              tickFormatter={(value) => formatCompactCurrency(value, currency)}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={0}
              stroke="hsl(0, 72%, 51%)"
              strokeDasharray="5 5"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="hsl(168, 65%, 38%)"
              strokeWidth={3}
              dot={{ fill: 'hsl(168, 65%, 38%)', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: 'hsl(168, 65%, 48%)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
