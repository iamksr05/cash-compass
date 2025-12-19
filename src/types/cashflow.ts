export type BusinessType = 'service' | 'product' | 'saas' | 'retail' | 'other';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD';

export interface BusinessInfo {
  name: string;
  type: BusinessType;
  currency: Currency;
  startingBalance: number;
  monthlyFixedExpenses: number;
}

export type IncomeCategory =
  | 'sales'
  | 'investment'
  | 'client_payment'
  | 'subscription'
  | 'grant'
  | 'other';

export type ExpenseCategory =
  | 'rent'
  | 'salary'
  | 'marketing'
  | 'software'
  | 'utilities'
  | 'equipment'
  | 'travel'
  | 'office'
  | 'legal'
  | 'founder_draw'
  | 'other';

export type BurnCategory = 'survival' | 'growth' | 'waste';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  category: IncomeCategory | ExpenseCategory;
  description: string;
  isRecurring: boolean;
  recurringFrequency?: 'weekly' | 'monthly' | 'yearly';
  burnCategory?: BurnCategory;
  isExperiment?: boolean;
  isFounderDraw?: boolean;
  experimentNotes?: string;
}

export interface CashFlowSummary {
  currentBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  burnRate: number;
  runwayMonths: number;
}

export interface Insight {
  id: string;
  type: 'info' | 'warning' | 'danger' | 'success';
  title: string;
  message: string;
  actionLabel?: string;
  plainEnglishTitle?: string;
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

// New types for founder-centric features
export interface CashHealthScore {
  score: number; // 0-100
  status: 'critical' | 'warning' | 'moderate' | 'healthy';
  explanation: string;
  actionHint: string;
  factors: {
    balanceFactor: number;
    burnRateFactor: number;
    runwayFactor: number;
    incomeTrendFactor: number;
    expenseGrowthFactor: number;
  };
}

export interface SafeToSpend {
  amount: number;
  percentage: number; // of current balance
  explanation: string;
  minRunwayProtected: number; // months
}

export interface BurnBreakdown {
  survivalBurn: number;
  growthBurn: number;
  wasteBurn: number;
  totalBurn: number;
  recommendations: string[];
}

export interface IncomeStability {
  isStable: boolean;
  volatilityScore: number; // 0-100, lower is more stable
  recurringPercentage: number;
  warning?: string;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface ExperimentSummary {
  totalSpend: number;
  experimentCount: number;
  experiments: {
    description: string;
    amount: number;
    date: string;
    notes?: string;
  }[];
  noReturnExperiments: string[];
}

export interface SilentExpenseKiller {
  id: string;
  description: string;
  category: string;
  monthlyAmount: number;
  growthRate: number; // percentage increase
  actionSuggestion: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ScheduledPayment {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  paymentType: 'subscription' | 'salary' | 'rent' | 'other';
  isRecurring: boolean;
  recurringFrequency?: 'weekly' | 'monthly' | 'yearly';
  reminderDays: number;
  notes?: string;
  isActive: boolean;
}

export interface WhatIfScenario {
  hireCount: number;
  avgSalary: number;
  marketingChange: number; // percentage change
  revenueChange: number; // percentage change
  expenseChange: number; // percentage change
}

export interface WhatIfResult {
  newBurnRate: number;
  newRunway: number;
  cashOutDate: Date | null;
  impactSummary: string;
  newNetCashFlow: number;
}

export interface PanicAlert {
  id: string;
  type: 'runway_critical' | 'expense_spike' | 'consecutive_loss' | 'payment_due';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  createdAt: string;
  isRead: boolean;
  isDismissed: boolean;
}

export interface CFOInsight {
  id: string;
  type: 'hiring' | 'expense' | 'revenue' | 'runway' | 'general';
  title: string;
  message: string;
  impact?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface WeeklyAction {
  id: string;
  action: string;
  category: 'review' | 'reduce' | 'increase' | 'delay';
  isCompleted: boolean;
  reason: string;
}

// Plain English terminology mapping
export const plainEnglishTerms: Record<string, { term: string; explanation: string; example: string }> = {
  burnRate: {
    term: 'Monthly Cash Loss',
    explanation: 'How much money your business spends each month beyond what it earns',
    example: 'If you spend $30K/month and earn $20K, your monthly cash loss is $10K',
  },
  runway: {
    term: 'How Long You Can Survive',
    explanation: 'The number of months your business can operate before running out of money',
    example: 'With $100K and $10K monthly loss, you can survive for 10 months',
  },
  netCashFlow: {
    term: 'Money Left After Expenses',
    explanation: 'The difference between what comes in and what goes out each month',
    example: 'Earned $25K, spent $20K = $5K left over',
  },
  cashFlowPositive: {
    term: 'Making More Than Spending',
    explanation: 'Your business earns more money than it spends each month',
    example: 'Monthly income of $30K with $25K expenses means you\'re adding $5K to savings',
  },
  cashFlowNegative: {
    term: 'Spending More Than Making',
    explanation: 'Your business spends more than it earns, using up savings',
    example: 'Monthly income of $20K with $30K expenses means you\'re losing $10K from savings',
  },
  survivalBurn: {
    term: 'Must-Pay Expenses',
    explanation: 'Essential costs you cannot avoid like rent, salaries, and utilities',
    example: 'Rent ($3K) + Salaries ($15K) + Utilities ($500) = $18.5K must-pay',
  },
  growthBurn: {
    term: 'Growth Investments',
    explanation: 'Spending on marketing, hiring, and experiments to grow the business',
    example: 'Marketing ads ($5K) + New hire ($8K) = $13K growth spending',
  },
  wasteBurn: {
    term: 'Unnecessary Costs',
    explanation: 'Expenses that can be reduced or eliminated without hurting the business',
    example: 'Unused subscriptions, duplicate tools, excessive travel',
  },
};
