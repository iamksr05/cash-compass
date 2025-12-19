import { Transaction } from '@/types/cashflow';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency, formatCompactCurrency } from '@/lib/calculations';
import { expenseCategoryLabels } from '@/lib/mockData';

interface ExpenseBreakdownProps {
  transactions: Transaction[];
  currency?: string;
}

const COLORS = [
  'hsl(168, 65%, 38%)',
  'hsl(12, 85%, 62%)',
  'hsl(38, 92%, 50%)',
  'hsl(262, 60%, 58%)',
  'hsl(200, 70%, 50%)',
  'hsl(340, 65%, 55%)',
  'hsl(80, 60%, 45%)',
  'hsl(280, 50%, 50%)',
];

export function ExpenseBreakdown({ transactions, currency = 'USD' }: ExpenseBreakdownProps) {
  const expenses = transactions.filter((t) => t.type === 'expense');

  const expensesByCategory: Record<string, number> = {};
  expenses.forEach((t) => {
    const label = expenseCategoryLabels[t.category] || t.category;
    expensesByCategory[label] = (expensesByCategory[label] || 0) + t.amount;
  });

  const data = Object.entries(expensesByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const totalExpenses = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0].payload;
      const percentage = ((value / totalExpenses) * 100).toFixed(1);
      return (
        <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
          <p className="font-semibold text-foreground">{name}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(value, currency)} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => (
    <div className="mt-4 grid grid-cols-2 gap-2">
      {payload.map((entry: any, index: number) => {
        const percentage = ((entry.payload.value / totalExpenses) * 100).toFixed(0);
        return (
          <div key={index} className="flex items-center gap-2 text-sm">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="truncate text-muted-foreground">{entry.value}</span>
            <span className="font-medium text-foreground">{percentage}%</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="card-elevated p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Where Your Money Goes</h3>
        <span className="text-sm text-muted-foreground">
          Total: {formatCurrency(totalExpenses, currency)}
        </span>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
