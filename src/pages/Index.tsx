
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { Header } from '@/components/layout/Header';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { RunwayIndicator } from '@/components/dashboard/RunwayIndicator';
import { InsightCard } from '@/components/dashboard/InsightCard';
import { CashFlowChart } from '@/components/dashboard/CashFlowChart';
import { ExpenseBreakdown } from '@/components/dashboard/ExpenseBreakdown';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { ForecastChart } from '@/components/dashboard/ForecastChart';
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal';
import { SettingsPage } from '@/components/pages/SettingsPage';
import { HelpPage } from '@/components/pages/HelpPage';
import { ReportsPage } from '@/components/pages/ReportsPage';
import { ProfilePage } from '@/components/pages/ProfilePage';
import { BillingPage } from '@/components/pages/BillingPage';
import { CashHealthScoreCard } from '@/components/dashboard/CashHealthScore';
import { SafeToSpendCard } from '@/components/dashboard/SafeToSpendCard';
import { BurnBreakdownCard } from '@/components/dashboard/BurnBreakdownCard';
import { IncomeStabilityCard } from '@/components/dashboard/IncomeStabilityCard';
import { WhatIfSimulator } from '@/components/dashboard/WhatIfSimulator';
import { CFOInsightsCard } from '@/components/dashboard/CFOInsightsCard';
import { PanicAlerts } from '@/components/dashboard/PanicAlerts';
import { Button } from '@/components/ui/button';
import { Loader2, Wallet, ArrowDownLeft, ArrowUpRight, TrendingUp } from 'lucide-react';
import { useCashflowData } from '@/hooks/useCashflowData';

import {
  calculateCashFlowSummary,
  generateInsights,
  projectFutureCash,
  formatCurrency,
} from '@/lib/calculations';
import {
  calculateCashHealthScore,
  calculateSafeToSpend,
  calculateBurnBreakdown,
  calculateIncomeStability,
  generateCFOInsights,
  detectSilentExpenseKillers,
  checkPanicAlerts,
  generateWeeklyActions
} from '@/lib/founderCalculations';
import { Transaction, MonthlyData } from '@/types/cashflow';

// Helper to aggregate transactions into monthly data for charts
const getMonthlyDataFromTransactions = (transactions: Transaction[], startingBalance: number) => {
  const months: Record<string, { income: number; expenses: number }> = {};
  const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Initialize with last 6 months
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7); // YYYY-MM
    months[key] = { income: 0, expenses: 0 };
  }

  sorted.forEach(t => {
    const key = t.date.slice(0, 7);
    if (!months[key]) months[key] = { income: 0, expenses: 0 };
    if (t.type === 'income') months[key].income += t.amount;
    else months[key].expenses += t.amount;
  });

  const monthKeys = Object.keys(months).sort();
  const monthlyData: MonthlyData[] = [];

  let currentEstimatedBalance = startingBalance;
  // This simplistic balance calculation isn't perfect without full history, 
  // but we assume startingBalance is valid NOW.
  // Actually, let's just make the balance curve roughly correct relative to flow. 
  // We'll walk forward from an assumed past.
  // Assuming 'startingBalance' is CURRENT, we need to walk BACKWARDS to get past balances.

  // Backward walk:
  // Balance[i-1] = Balance[i] - Income[i] + Expenses[i]

  const historyMap: Record<string, number> = {};
  // Current month key
  const currentKey = today.toISOString().slice(0, 7);
  historyMap[currentKey] = startingBalance;

  for (let i = monthKeys.length - 1; i >= 0; i--) {
    const key = monthKeys[i];
    const prevKey = i > 0 ? monthKeys[i - 1] : null;
    if (prevKey) {
      historyMap[prevKey] = historyMap[key] - months[key].income + months[key].expenses;
    }
  }

  monthKeys.forEach(key => {
    monthlyData.push({
      month: new Date(key + '-02').toLocaleDateString('en-US', { month: 'short' }),
      income: months[key].income,
      expenses: months[key].expenses,
      balance: historyMap[key] || 0
    });
  });

  return monthlyData.slice(-6); // Last 6 months
};

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  // Use real data hook
  const { transactions, businessInfo, isLoading, addTransaction, updateBusinessInfo, isDemo } = useCashflowData();

  const monthlyData = useMemo(() => {
    if (!transactions || !businessInfo) return [];
    return getMonthlyDataFromTransactions(transactions, businessInfo.startingBalance);
  }, [transactions, businessInfo]);

  const summary = useMemo(
    () => businessInfo ? calculateCashFlowSummary(transactions, businessInfo.startingBalance) : null,
    [transactions, businessInfo]
  );

  const insights = useMemo(
    () => summary ? generateInsights(summary, transactions) : [],
    [summary, transactions]
  );

  const cfoInsights = useMemo(() => {
    if (!summary || !transactions) return [];
    const burnBreakdown = calculateBurnBreakdown(transactions);
    const incomeStability = calculateIncomeStability(transactions, monthlyData);
    return generateCFOInsights(summary, transactions, burnBreakdown, incomeStability);
  }, [summary, transactions, monthlyData]);

  const founderCalculations = useMemo(() => {
    if (!summary || !transactions) return null;
    const burnBreakdown = calculateBurnBreakdown(transactions);
    const incomeStability = calculateIncomeStability(transactions, monthlyData);
    const safeToSpend = calculateSafeToSpend(summary);
    const cashHealth = calculateCashHealthScore(summary, transactions, monthlyData);
    const panicAlerts = checkPanicAlerts(summary, monthlyData);
    const silentKillers = detectSilentExpenseKillers(transactions, monthlyData);
    const weeklyActions = generateWeeklyActions(summary, burnBreakdown, silentKillers);

    return {
      burnBreakdown,
      incomeStability,
      safeToSpend,
      cashHealth,
      panicAlerts,
      silentKillers,
      weeklyActions
    };
  }, [summary, transactions, monthlyData]);

  const projections = useMemo(
    () => summary ? projectFutureCash(summary.currentBalance, summary.totalIncome, summary.burnRate, 6) : [],
    [summary]
  );

  const handleAddTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    addTransaction(transaction);
    setShowAddModal(false);
  };

  const handleDismissAlert = (id: string) => {
    setDismissedAlerts(prev => [...prev, id]);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading your financials...</p>
        </div>
      </div>
    );
  }

  if (!businessInfo || !summary || !founderCalculations) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <h2 className="text-2xl font-bold">Welcome directly to Cash Compass</h2>
        <p className="mt-2 text-muted-foreground">We couldn't find your business data.</p>
        <Button asChild className="mt-4">
          <Link to="/onboarding">Complete Setup</Link>
        </Button>
      </div>
    );
  }

  const pageTitle = currentPage.charAt(0).toUpperCase() + currentPage.slice(1);
  const activeAlerts = founderCalculations.panicAlerts.filter(a => !dismissedAlerts.includes(a.id));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:ml-72 pb-24 lg:pb-0">
        <Header
          title={pageTitle}
          subtitle={businessInfo.name}
          onMenuClick={() => setSidebarOpen(true)}
          onAddTransaction={() => setShowAddModal(true)}
          onNavigate={setCurrentPage}
        />

        <main className="p-4 lg:p-8 space-y-8 animate-in fade-in duration-500">

          {isDemo && (
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-primary">Demo Mode Active</h3>
                <p className="text-sm text-foreground/80">You are viewing sample data. Changes will not be saved.</p>
              </div>
              <Button asChild size="sm" variant="default">
                <Link to="/auth">Sign Up</Link>
              </Button>
            </div>
          )}

          {/* Panic Alerts Section */}
          <div className="space-y-4">
            <PanicAlerts alerts={activeAlerts} onDismiss={handleDismissAlert} />
          </div>

          {currentPage === 'dashboard' && (
            <div className="space-y-8">

              {/* Top Row: Key Metrics */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                <MetricCard
                  title="Current Balance"
                  value={formatCurrency(summary.currentBalance, businessInfo.currency)}
                  subtitle="Available cash"
                  icon={Wallet}
                  variant="primary"
                />
                <MetricCard
                  title="Income This Month"
                  value={formatCurrency(summary.totalIncome, businessInfo.currency)}
                  icon={ArrowDownLeft}
                  trend={{ value: 0, isPositive: true }} // TODO: Calc trend
                  variant="success"
                />
                <MetricCard
                  title="Expenses This Month"
                  value={formatCurrency(summary.totalExpenses, businessInfo.currency)}
                  icon={ArrowUpRight}
                  trend={{ value: 0, isPositive: false }} // TODO: Calc trend
                  variant="default"
                />
                <MetricCard
                  title="Net Cash Flow"
                  value={formatCurrency(summary.netCashFlow, businessInfo.currency)}
                  subtitle={summary.netCashFlow >= 0 ? 'Positive' : 'Negative'}
                  icon={TrendingUp}
                  variant={summary.netCashFlow >= 0 ? 'success' : 'danger'}
                />
              </div>

              {/* Founder Health & Safety Row */}
              <div className="grid gap-6 lg:grid-cols-2">
                <CashHealthScoreCard healthScore={founderCalculations.cashHealth} />
                <SafeToSpendCard
                  safeToSpend={founderCalculations.safeToSpend}
                  currency={businessInfo.currency}
                  currentBalance={summary.currentBalance}
                />
              </div>

              {/* Runway & CFO Insights */}
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <RunwayIndicator
                    months={summary.runwayMonths}
                    burnRate={summary.burnRate}
                    currentBalance={summary.currentBalance}
                    currency={businessInfo.currency}
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">CFO Insights</h3>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    <CFOInsightsCard
                      insights={cfoInsights}
                      weeklyActions={founderCalculations.weeklyActions}
                    />
                  </div>
                </div>
              </div>

              {/* Charts & Breakdown */}
              <div className="grid gap-6 lg:grid-cols-2">
                <CashFlowChart
                  data={monthlyData}
                  currency={businessInfo.currency}
                />
                <div className="space-y-6">
                  <BurnBreakdownCard
                    breakdown={founderCalculations.burnBreakdown}
                    currency={businessInfo.currency}
                  />
                  <ExpenseBreakdown
                    transactions={transactions}
                    currency={businessInfo.currency}
                  />
                </div>
              </div>

              {/* Forecast & Simulator */}
              <div className="grid gap-6 lg:grid-cols-2">
                <ForecastChart
                  projections={projections}
                  currency={businessInfo.currency}
                />
                <WhatIfSimulator
                  summary={summary}
                  currency={businessInfo.currency}
                />
              </div>

              {/* Recent Transactions */}
              <RecentTransactions
                transactions={transactions}
                currency={businessInfo.currency}
              />
            </div>
          )}

          {currentPage === 'income' && (
            <div className="space-y-6">
              <div className="card-elevated p-8 text-center bg-card">
                <ArrowDownLeft className="mx-auto h-12 w-12 text-success" />
                <h2 className="mt-4 text-xl font-semibold">Track Your Income</h2>
                <Button onClick={() => setShowAddModal(true)} className="mt-4" variant="outline">
                  Add Income
                </Button>
              </div>
              <IncomeStabilityCard stability={founderCalculations.incomeStability} />
              <RecentTransactions
                transactions={transactions.filter((t) => t.type === 'income')}
                currency={businessInfo.currency}
                limit={20}
              />
            </div>
          )}

          {currentPage === 'expenses' && (
            <div className="space-y-6">
              <div className="card-elevated p-8 text-center bg-card">
                <ArrowUpRight className="mx-auto h-12 w-12 text-danger" />
                <h2 className="mt-4 text-xl font-semibold">Track Your Expenses</h2>
                <Button onClick={() => setShowAddModal(true)} className="mt-4" variant="outline">
                  Add Expense
                </Button>
              </div>
              <BurnBreakdownCard breakdown={founderCalculations.burnBreakdown} currency={businessInfo.currency} />
              <ExpenseBreakdown
                transactions={transactions}
                currency={businessInfo.currency}
              />
              <RecentTransactions
                transactions={transactions.filter((t) => t.type === 'expense')}
                currency={businessInfo.currency}
                limit={20}
              />
            </div>
          )}

          {currentPage === 'forecast' && (
            <div className="space-y-6">
              <ForecastChart projections={projections} currency={businessInfo.currency} />
              <WhatIfSimulator summary={summary} currency={businessInfo.currency} />
            </div>
          )}

          {currentPage === 'reports' && (
            <ReportsPage
              transactions={transactions}
              summary={summary}
              currency={businessInfo.currency}
              startingBalance={businessInfo.startingBalance}
            />
          )}

          {currentPage === 'settings' && (
            <SettingsPage
              businessInfo={businessInfo}
              onUpdate={updateBusinessInfo}
            />
          )}

          {currentPage === 'help' && <HelpPage />}

          {currentPage === 'profile' && <ProfilePage businessName={businessInfo.name} />}

          {currentPage === 'billing' && <BillingPage />}
        </main>
      </div>

      <AddTransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddTransaction}
        currency={businessInfo.currency}
      />

      <MobileNav
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onMenuClick={() => setSidebarOpen(true)}
      />
    </div>
  );
};

export default Index;
