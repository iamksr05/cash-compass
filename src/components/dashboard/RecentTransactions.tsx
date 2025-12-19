import { Transaction } from '@/types/cashflow';
import { formatCurrency } from '@/lib/calculations';
import { expenseCategoryLabels, incomeCategoryLabels } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { ArrowDownLeft, ArrowUpRight, Repeat } from 'lucide-react';

interface RecentTransactionsProps {
  transactions: Transaction[];
  currency?: string;
  limit?: number;
}

export function RecentTransactions({
  transactions,
  currency = 'USD',
  limit = 5,
}: RecentTransactionsProps) {
  const sortedTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);

  const getCategoryLabel = (transaction: Transaction) => {
    if (transaction.type === 'income') {
      return incomeCategoryLabels[transaction.category] || transaction.category;
    }
    return expenseCategoryLabels[transaction.category] || transaction.category;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="card-elevated p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
          View all
        </button>
      </div>
      <div className="space-y-4">
        {sortedTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-muted/50"
          >
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg',
                transaction.type === 'income'
                  ? 'bg-success/10 text-success'
                  : 'bg-danger/10 text-danger'
              )}
            >
              {transaction.type === 'income' ? (
                <ArrowDownLeft className="h-5 w-5" />
              ) : (
                <ArrowUpRight className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium text-foreground">
                  {transaction.description}
                </p>
                {transaction.isRecurring && (
                  <Repeat className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {getCategoryLabel(transaction)} • {formatDate(transaction.date)}
              </p>
            </div>
            <p
              className={cn(
                'number-display text-base font-semibold',
                transaction.type === 'income' ? 'text-success' : 'text-danger'
              )}
            >
              {transaction.type === 'income' ? '+' : '-'}
              {formatCurrency(transaction.amount, currency)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
