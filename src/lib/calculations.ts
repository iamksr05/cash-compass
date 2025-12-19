import { Transaction, CashFlowSummary, Insight, MonthlyData } from '@/types/cashflow';

export function calculateCashFlowSummary(
  transactions: Transaction[],
  startingBalance: number
): CashFlowSummary {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthTransactions = transactions.filter((t) => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const totalIncome = thisMonthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = thisMonthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netCashFlow = totalIncome - totalExpenses;

  // Calculate burn rate (average monthly expenses over last 3 months)
  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const recentExpenses = transactions
    .filter((t) => t.type === 'expense' && new Date(t.date) >= threeMonthsAgo)
    .reduce((sum, t) => sum + t.amount, 0);

  const burnRate = recentExpenses / 3;

  // Calculate current balance
  const allTimeIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const allTimeExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentBalance = startingBalance + allTimeIncome - allTimeExpenses;

  // Calculate runway
  const runwayMonths = burnRate > 0 ? currentBalance / burnRate : 999;

  return {
    currentBalance,
    totalIncome,
    totalExpenses,
    netCashFlow,
    burnRate,
    runwayMonths: Math.floor(runwayMonths),
  };
}

export function generateInsights(
  summary: CashFlowSummary,
  transactions: Transaction[]
): Insight[] {
  const insights: Insight[] = [];

  // Runway warning
  if (summary.runwayMonths <= 3) {
    insights.push({
      id: 'runway-critical',
      type: 'danger',
      title: 'Critical: Low Runway',
      message: `You have only ${summary.runwayMonths} month${summary.runwayMonths === 1 ? '' : 's'} of runway left. Consider reducing expenses or raising funds immediately.`,
      actionLabel: 'View Expenses',
    });
  } else if (summary.runwayMonths <= 6) {
    insights.push({
      id: 'runway-warning',
      type: 'warning',
      title: 'Runway Alert',
      message: `You have ${summary.runwayMonths} months of runway. Start planning for your next funding round or revenue growth.`,
    });
  }

  // Expense growth warning
  if (summary.totalExpenses > summary.totalIncome && summary.totalIncome > 0) {
    const ratio = ((summary.totalExpenses - summary.totalIncome) / summary.totalIncome * 100).toFixed(0);
    insights.push({
      id: 'expense-growth',
      type: 'warning',
      title: 'Spending More Than Earning',
      message: `Your expenses exceed income by ${ratio}% this month. Review your spending to extend runway.`,
      actionLabel: 'Review Spending',
    });
  }

  // Find biggest expense category
  const expensesByCategory: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
    });

  const biggestExpense = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1])[0];
  if (biggestExpense) {
    const percentage = ((biggestExpense[1] / summary.totalExpenses) * 100).toFixed(0);
    insights.push({
      id: 'biggest-expense',
      type: 'info',
      title: 'Top Spending Category',
      message: `${formatCategoryName(biggestExpense[0])} accounts for ${percentage}% of your expenses this month.`,
    });
  }

  // Positive cash flow
  if (summary.netCashFlow > 0) {
    insights.push({
      id: 'positive-cashflow',
      type: 'success',
      title: 'Positive Cash Flow',
      message: `Great news! You're making more than you're spending this month. Keep it up!`,
    });
  }

  return insights;
}

function formatCategoryName(category: string): string {
  return category
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function projectFutureCash(
  currentBalance: number,
  monthlyIncome: number,
  monthlyExpenses: number,
  months: number
): MonthlyData[] {
  const projections: MonthlyData[] = [];
  let balance = currentBalance;
  const now = new Date();

  for (let i = 1; i <= months; i++) {
    const futureDate = new Date(now);
    futureDate.setMonth(futureDate.getMonth() + i);
    const monthName = futureDate.toLocaleDateString('en-US', { month: 'short' });

    balance = balance + monthlyIncome - monthlyExpenses;

    projections.push({
      month: monthName,
      income: monthlyIncome,
      expenses: monthlyExpenses,
      balance: Math.max(0, balance),
    });
  }

  return projections;
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    CAD: 'C$',
    AUD: 'A$',
  };

  const symbol = symbols[currency] || '$';
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return amount < 0 ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
}

export function formatCompactCurrency(amount: number, currency: string = 'USD'): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    CAD: 'C$',
    AUD: 'A$',
  };

  const symbol = symbols[currency] || '$';

  if (Math.abs(amount) >= 1000000) {
    return `${symbol}${(amount / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(1)}K`;
  }
  return `${symbol}${amount.toFixed(0)}`;
}
