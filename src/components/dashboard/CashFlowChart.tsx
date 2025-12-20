import { MonthlyData } from '@/types/cashflow';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCompactCurrency } from '@/lib/calculations';

interface CashFlowChartProps {
  data: MonthlyData[];
  currency?: string;
}

export function CashFlowChart({ data, currency = 'USD' }: CashFlowChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-border bg-card p-4 shadow-lg">
          <p className="mb-2 font-semibold text-foreground">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <p
                key={index}
                className="flex items-center gap-2 text-sm"
                style={{ color: entry.color }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-muted-foreground">{entry.name}:</span>
                <span className="font-semibold">
                  {formatCompactCurrency(entry.value, currency)}
                </span>
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card-elevated p-6">
      <h3 className="mb-6 text-lg font-semibold text-foreground">Cash Flow Overview</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(158, 60%, 42%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(158, 60%, 42%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 72%, 60%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(0, 72%, 60%)" stopOpacity={0} />
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
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => (
                <span className="text-sm text-muted-foreground">{value}</span>
              )}
            />
            <Area
              type="monotone"
              dataKey="income"
              name="Income"
              stroke="hsl(158, 60%, 42%)"
              strokeWidth={2}
              fill="url(#incomeGradient)"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              name="Expenses"
              stroke="hsl(0, 72%, 60%)"
              strokeWidth={2}
              fill="url(#expenseGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
