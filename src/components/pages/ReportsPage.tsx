import { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Transaction, CashFlowSummary } from '@/types/cashflow';
import { formatCurrency } from '@/lib/calculations';
import { expenseCategoryLabels, incomeCategoryLabels } from '@/lib/mockData';

interface ReportsPageProps {
  transactions: Transaction[];
  summary: CashFlowSummary;
  currency: string;
  startingBalance: number;
}

export function ReportsPage({
  transactions,
  summary,
  currency,
  startingBalance,
}: ReportsPageProps) {
  const { toast } = useToast();
  const [period, setPeriod] = useState('this-month');

  const incomeByCategory = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const expensesByCategory = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const handleExport = (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
      const rows = transactions.map((t) => [
        t.date,
        t.type,
        t.type === 'income'
          ? incomeCategoryLabels[t.category] || t.category
          : expenseCategoryLabels[t.category] || t.category,
        `"${t.description}"`,
        t.type === 'income' ? t.amount : -t.amount,
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cashflow-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'Export successful',
        description: 'Your CSV report has been downloaded.',
      });
    } else {
      // Generate PDF content
      const reportDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const pdfContent = `
CASH FLOW REPORT
Generated: ${reportDate}

=====================================
SUMMARY
=====================================
Opening Balance:  ${formatCurrency(startingBalance, currency)}
Total Income:     +${formatCurrency(summary.totalIncome, currency)}
Total Expenses:   -${formatCurrency(summary.totalExpenses, currency)}
Closing Balance:  ${formatCurrency(summary.currentBalance, currency)}
Net Cash Flow:    ${formatCurrency(summary.netCashFlow, currency)}

=====================================
INCOME BY CATEGORY
=====================================
${Object.entries(incomeByCategory)
  .sort(([, a], [, b]) => b - a)
  .map(([cat, amt]) => `${incomeCategoryLabels[cat] || cat}: +${formatCurrency(amt, currency)}`)
  .join('\n') || 'No income recorded'}

=====================================
EXPENSES BY CATEGORY
=====================================
${Object.entries(expensesByCategory)
  .sort(([, a], [, b]) => b - a)
  .map(([cat, amt]) => `${expenseCategoryLabels[cat] || cat}: -${formatCurrency(amt, currency)}`)
  .join('\n') || 'No expenses recorded'}

=====================================
TRANSACTIONS
=====================================
${transactions
  .slice(0, 50)
  .map((t) => {
    const date = new Date(t.date).toLocaleDateString();
    const category = t.type === 'income' 
      ? incomeCategoryLabels[t.category] 
      : expenseCategoryLabels[t.category];
    const amount = t.type === 'income' 
      ? `+${formatCurrency(t.amount, currency)}` 
      : `-${formatCurrency(t.amount, currency)}`;
    return `${date} | ${category} | ${t.description} | ${amount}`;
  })
  .join('\n')}
`;

      const blob = new Blob([pdfContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cashflow-report-${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'Export successful',
        description: 'Your report has been downloaded as a text file.',
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Financial Reports
          </h2>
          <p className="text-muted-foreground">
            View and export your financial data
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="last-3-months">Last 3 Months</SelectItem>
              <SelectItem value="last-6-months">Last 6 Months</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Card */}
      <div className="card-elevated p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Monthly Summary
          </h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('csv')}
            >
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('pdf')}
            >
              <Download className="mr-2 h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-xl bg-muted p-4">
            <p className="text-sm text-muted-foreground">Opening Balance</p>
            <p className="number-display mt-1 text-2xl font-bold text-foreground">
              {formatCurrency(startingBalance, currency)}
            </p>
          </div>
          <div className="rounded-xl bg-success/10 p-4">
            <p className="text-sm text-success">Total Income</p>
            <p className="number-display mt-1 text-2xl font-bold text-success">
              +{formatCurrency(summary.totalIncome, currency)}
            </p>
          </div>
          <div className="rounded-xl bg-danger/10 p-4">
            <p className="text-sm text-danger">Total Expenses</p>
            <p className="number-display mt-1 text-2xl font-bold text-danger">
              -{formatCurrency(summary.totalExpenses, currency)}
            </p>
          </div>
          <div className="rounded-xl bg-primary/10 p-4">
            <p className="text-sm text-primary">Closing Balance</p>
            <p className="number-display mt-1 text-2xl font-bold text-primary">
              {formatCurrency(summary.currentBalance, currency)}
            </p>
          </div>
        </div>

        {/* Flow visualization */}
        <div className="mt-6 flex items-center justify-center gap-4 rounded-xl bg-muted/50 p-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Opening</p>
            <p className="number-display font-semibold text-foreground">
              {formatCurrency(startingBalance, currency)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-success" />
            <span className="text-sm text-success">
              +{formatCurrency(summary.totalIncome, currency)}
            </span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-danger" />
            <span className="text-sm text-danger">
              -{formatCurrency(summary.totalExpenses, currency)}
            </span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Closing</p>
            <p className="number-display font-semibold text-foreground">
              {formatCurrency(summary.currentBalance, currency)}
            </p>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Income by Category */}
        <div className="card-elevated p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            Income by Category
          </h3>
          <div className="space-y-3">
            {Object.entries(incomeByCategory).length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No income recorded
              </p>
            ) : (
              Object.entries(incomeByCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => (
                  <div
                    key={category}
                    className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                  >
                    <span className="text-sm text-foreground">
                      {incomeCategoryLabels[category] || category}
                    </span>
                    <span className="number-display font-medium text-success">
                      +{formatCurrency(amount, currency)}
                    </span>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Expenses by Category */}
        <div className="card-elevated p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            Expenses by Category
          </h3>
          <div className="space-y-3">
            {Object.entries(expensesByCategory).length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No expenses recorded
              </p>
            ) : (
              Object.entries(expensesByCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => (
                  <div
                    key={category}
                    className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                  >
                    <span className="text-sm text-foreground">
                      {expenseCategoryLabels[category] || category}
                    </span>
                    <span className="number-display font-medium text-danger">
                      -{formatCurrency(amount, currency)}
                    </span>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card-elevated p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">
          All Transactions
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                  Date
                </th>
                <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                  Description
                </th>
                <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                  Category
                </th>
                <th className="pb-3 text-right text-sm font-medium text-muted-foreground">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transactions.slice(0, 20).map((transaction) => (
                <tr key={transaction.id}>
                  <td className="py-3 text-sm text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-sm text-foreground">
                    {transaction.description}
                  </td>
                  <td className="py-3 text-sm text-muted-foreground">
                    {transaction.type === 'income'
                      ? incomeCategoryLabels[transaction.category]
                      : expenseCategoryLabels[transaction.category]}
                  </td>
                  <td
                    className={`number-display py-3 text-right text-sm font-medium ${
                      transaction.type === 'income'
                        ? 'text-success'
                        : 'text-danger'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
