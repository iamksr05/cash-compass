import { Transaction, BusinessInfo, MonthlyData } from '@/types/cashflow';

// Static constants for labels and references

export const expenseCategoryLabels: Record<string, string> = {
  rent: 'Rent & Lease',
  salary: 'Salaries & Wages',
  marketing: 'Marketing & Ads',
  software: 'Software & Tools',
  utilities: 'Utilities',
  equipment: 'Equipment',
  travel: 'Travel',
  office: 'Office Supplies',
  legal: 'Legal & Accounting',
  founder_draw: 'Founder Draw',
  other: 'Other',
};

export const incomeCategoryLabels: Record<string, string> = {
  sales: 'Sales Revenue',
  investment: 'Investment',
  client_payment: 'Client Payment',
  subscription: 'Subscriptions',
  grant: 'Grants',
  other: 'Other Income',
};

export const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  CAD: 'C$',
  AUD: 'A$',
};

// --- MOCK DATA FOR DEMO MODE ---

const getCurrentMonthDate = (day: number) => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), day).toISOString().split('T')[0];
};

export const mockBusinessInfo: BusinessInfo & { id: string } = {
  id: 'demo-business-id',
  name: 'Demo Startup Inc.',
  type: 'saas',
  currency: 'USD',
  startingBalance: 125000,
  monthlyFixedExpenses: 28500,
};

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'income',
    amount: 15000,
    date: getCurrentMonthDate(15),
    category: 'subscription',
    description: 'Monthly SaaS subscriptions',
    isRecurring: true,
    recurringFrequency: 'monthly',
    burnCategory: undefined,
    isExperiment: false,
    isFounderDraw: false,
  },
  {
    id: '2',
    type: 'income',
    amount: 8500,
    date: getCurrentMonthDate(10),
    category: 'client_payment',
    description: 'Enterprise client - Q1 payment',
    isRecurring: false,
    burnCategory: undefined,
    isExperiment: false,
    isFounderDraw: false,
  },
  {
    id: '3',
    type: 'income',
    amount: 50000,
    date: getCurrentMonthDate(5),
    category: 'investment',
    description: 'Angel investor seed funding',
    isRecurring: false,
    burnCategory: undefined,
    isExperiment: false,
    isFounderDraw: false,
  },
  {
    id: '4',
    type: 'expense',
    amount: 12000,
    date: getCurrentMonthDate(1),
    category: 'salary',
    description: 'Team salaries',
    isRecurring: true,
    recurringFrequency: 'monthly',
    burnCategory: 'survival',
    isExperiment: false,
    isFounderDraw: false,
  },
  {
    id: '5',
    type: 'expense',
    amount: 3500,
    date: getCurrentMonthDate(1),
    category: 'rent',
    description: 'Office space rent',
    isRecurring: true,
    recurringFrequency: 'monthly',
    burnCategory: 'survival',
    isExperiment: false,
    isFounderDraw: false,
  },
  {
    id: '6',
    type: 'expense',
    amount: 2800,
    date: getCurrentMonthDate(8),
    category: 'software',
    description: 'AWS, tools, and subscriptions',
    isRecurring: true,
    recurringFrequency: 'monthly',
    burnCategory: 'survival',
    isExperiment: false,
    isFounderDraw: false,
  },
  {
    id: '7',
    type: 'expense',
    amount: 5000,
    date: getCurrentMonthDate(12),
    category: 'marketing',
    description: 'Digital marketing campaign',
    isRecurring: false,
    burnCategory: 'growth',
    isExperiment: true,
    experimentNotes: 'Testing new Instagram ads channel',
    isFounderDraw: false,
  },
  {
    id: '8',
    type: 'expense',
    amount: 1200,
    date: getCurrentMonthDate(18),
    category: 'utilities',
    description: 'Internet and phone',
    isRecurring: true,
    recurringFrequency: 'monthly',
    burnCategory: 'survival',
    isExperiment: false,
    isFounderDraw: false,
  },
  {
    id: '9',
    type: 'expense',
    amount: 400,
    date: getCurrentMonthDate(20),
    category: 'software',
    description: 'Unused analytics tool',
    isRecurring: true,
    recurringFrequency: 'monthly',
    burnCategory: 'waste',
    isExperiment: false,
    isFounderDraw: false,
  },
  {
    id: '10',
    type: 'expense',
    amount: 5000,
    date: getCurrentMonthDate(25),
    category: 'founder_draw',
    description: 'Founder Monthly Draw',
    isRecurring: true,
    recurringFrequency: 'monthly',
    burnCategory: 'survival',
    isExperiment: false,
    isFounderDraw: true,
  }
];
