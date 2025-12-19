import {
  Transaction,
  CashFlowSummary,
  CashHealthScore,
  SafeToSpend,
  BurnBreakdown,
  IncomeStability,
  ExperimentSummary,
  SilentExpenseKiller,
  WhatIfScenario,
  WhatIfResult,
  CFOInsight,
  WeeklyAction,
  PanicAlert,
} from '@/types/cashflow';

// Calculate Cash Health Score (0-100)
export function calculateCashHealthScore(
  summary: CashFlowSummary,
  transactions: Transaction[],
  monthlyDataHistory: { income: number; expenses: number }[]
): CashHealthScore {
  const { currentBalance, burnRate, runwayMonths, totalIncome, totalExpenses } = summary;

  // Factor 1: Balance factor (0-25 points)
  // Higher balance relative to monthly burn = better
  const monthsOfCashCover = burnRate > 0 ? currentBalance / burnRate : 12;
  const balanceFactor = Math.min(25, (monthsOfCashCover / 12) * 25);

  // Factor 2: Burn rate factor (0-20 points)
  // Lower burn relative to income = better
  const burnToIncomeRatio = totalIncome > 0 ? totalExpenses / totalIncome : 2;
  const burnRateFactor = Math.max(0, 20 - (burnToIncomeRatio - 0.5) * 20);

  // Factor 3: Runway factor (0-25 points)
  // More months of runway = better
  const runwayFactor = Math.min(25, (runwayMonths / 18) * 25);

  // Factor 4: Income trend factor (0-15 points)
  // Growing income = better
  const incomeTrendFactor = calculateIncomeTrendFactor(monthlyDataHistory);

  // Factor 5: Expense growth factor (0-15 points)
  // Lower expense growth = better
  const expenseGrowthFactor = calculateExpenseGrowthFactor(monthlyDataHistory);

  const score = Math.round(
    balanceFactor + burnRateFactor + runwayFactor + incomeTrendFactor + expenseGrowthFactor
  );

  const status = getHealthStatus(score);
  const { explanation, actionHint } = getHealthExplanation(score, summary);

  return {
    score: Math.max(0, Math.min(100, score)),
    status,
    explanation,
    actionHint,
    factors: {
      balanceFactor: Math.round(balanceFactor),
      burnRateFactor: Math.round(burnRateFactor),
      runwayFactor: Math.round(runwayFactor),
      incomeTrendFactor: Math.round(incomeTrendFactor),
      expenseGrowthFactor: Math.round(expenseGrowthFactor),
    },
  };
}

function calculateIncomeTrendFactor(history: { income: number }[]): number {
  if (history.length < 2) return 7.5;

  const recent = history.slice(-3);
  if (recent.length < 2) return 7.5;

  const growth = recent.reduce((sum, _, i) => {
    if (i === 0) return 0;
    const prev = recent[i - 1].income;
    const curr = recent[i].income;
    return sum + (prev > 0 ? (curr - prev) / prev : 0);
  }, 0) / (recent.length - 1);

  // -50% growth = 0 points, 0% = 7.5 points, +50% = 15 points
  return Math.max(0, Math.min(15, 7.5 + growth * 15));
}

function calculateExpenseGrowthFactor(history: { expenses: number }[]): number {
  if (history.length < 2) return 7.5;

  const recent = history.slice(-3);
  if (recent.length < 2) return 7.5;

  const growth = recent.reduce((sum, _, i) => {
    if (i === 0) return 0;
    const prev = recent[i - 1].expenses;
    const curr = recent[i].expenses;
    return sum + (prev > 0 ? (curr - prev) / prev : 0);
  }, 0) / (recent.length - 1);

  // +50% growth = 0 points, 0% = 7.5 points, -50% = 15 points
  return Math.max(0, Math.min(15, 7.5 - growth * 15));
}

function getHealthStatus(score: number): CashHealthScore['status'] {
  if (score >= 70) return 'healthy';
  if (score >= 50) return 'moderate';
  if (score >= 30) return 'warning';
  return 'critical';
}

function getHealthExplanation(
  score: number,
  summary: CashFlowSummary
): { explanation: string; actionHint: string } {
  if (score >= 70) {
    return {
      explanation: "Your finances are in great shape! You have healthy cash reserves and sustainable spending.",
      actionHint: "Consider investing in growth or building a larger safety buffer.",
    };
  }
  if (score >= 50) {
    return {
      explanation: "Your finances are stable but could use improvement. Watch your spending trends.",
      actionHint: summary.netCashFlow < 0
        ? "Focus on increasing revenue or reducing expenses to improve your score."
        : "Build up your cash reserves to extend your runway.",
    };
  }
  if (score >= 30) {
    return {
      explanation: "Warning: Your financial health needs attention. Cash reserves may be running low.",
      actionHint: "Prioritize cutting non-essential expenses and focus on revenue-generating activities.",
    };
  }
  return {
    explanation: "Critical: Your business is at financial risk. Immediate action is required.",
    actionHint: `You have ${summary.runwayMonths} months before running out of cash. Cut all non-essential spending immediately.`,
  };
}

// Calculate Safe-to-Spend amount
export function calculateSafeToSpend(
  summary: CashFlowSummary,
  minRunwayMonths: number = 6
): SafeToSpend {
  const { currentBalance, burnRate, totalIncome } = summary;

  // Protect minimum runway
  const reserveNeeded = burnRate * minRunwayMonths;
  const availableAfterReserve = Math.max(0, currentBalance - reserveNeeded);

  // Safe to spend is the lesser of: available after reserve, or excess income this month
  const excessIncome = Math.max(0, totalIncome - burnRate);
  const safeAmount = Math.min(availableAfterReserve, excessIncome + availableAfterReserve * 0.1);

  const percentage = currentBalance > 0 ? (safeAmount / currentBalance) * 100 : 0;

  let explanation: string;
  if (safeAmount <= 0) {
    explanation = `Your cash reserves are needed to maintain at least ${minRunwayMonths} months of runway. Avoid additional spending.`;
  } else if (percentage < 10) {
    explanation = `You can safely spend a small amount while keeping ${minRunwayMonths} months of survival runway.`;
  } else {
    explanation = `Based on your current income and expenses, you can safely spend this amount without risking your ${minRunwayMonths}-month safety buffer.`;
  }

  return {
    amount: Math.max(0, Math.round(safeAmount)),
    percentage: Math.round(percentage),
    explanation,
    minRunwayProtected: minRunwayMonths,
  };
}

// Calculate Burn Rate Breakdown
export function calculateBurnBreakdown(transactions: Transaction[]): BurnBreakdown {
  const now = new Date();
  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const recentExpenses = transactions.filter(
    (t) => t.type === 'expense' && new Date(t.date) >= threeMonthsAgo
  );

  let survivalBurn = 0;
  let growthBurn = 0;
  let wasteBurn = 0;

  recentExpenses.forEach((t) => {
    const monthlyAmount = t.amount / 3; // Average over 3 months

    if (t.burnCategory) {
      switch (t.burnCategory) {
        case 'survival':
          survivalBurn += monthlyAmount;
          break;
        case 'growth':
          growthBurn += monthlyAmount;
          break;
        case 'waste':
          wasteBurn += monthlyAmount;
          break;
      }
    } else {
      // Auto-categorize based on category
      const survivalCategories = ['rent', 'salary', 'utilities', 'legal'];
      const growthCategories = ['marketing', 'software', 'equipment'];

      if (survivalCategories.includes(t.category)) {
        survivalBurn += monthlyAmount;
      } else if (growthCategories.includes(t.category)) {
        growthBurn += monthlyAmount;
      } else if (t.isFounderDraw) {
        // Founder draws are tracked separately
        survivalBurn += monthlyAmount;
      } else {
        // Unknown defaults to growth
        growthBurn += monthlyAmount;
      }
    }
  });

  const recommendations: string[] = [];
  const totalBurn = survivalBurn + growthBurn + wasteBurn;

  if (wasteBurn > 0) {
    recommendations.push(`Eliminating waste expenses could save you $${Math.round(wasteBurn).toLocaleString()}/month`);
  }
  if (growthBurn > totalBurn * 0.4) {
    recommendations.push("Consider scaling back growth spending if runway is a concern");
  }
  if (survivalBurn > totalBurn * 0.7) {
    recommendations.push("High fixed costs - look for ways to reduce overhead");
  }

  return {
    survivalBurn: Math.round(survivalBurn),
    growthBurn: Math.round(growthBurn),
    wasteBurn: Math.round(wasteBurn),
    totalBurn: Math.round(totalBurn),
    recommendations,
  };
}

// Calculate Income Stability
export function calculateIncomeStability(
  transactions: Transaction[],
  monthlyDataHistory: { income: number }[]
): IncomeStability {
  const incomeTransactions = transactions.filter((t) => t.type === 'income');
  const recurringIncome = incomeTransactions.filter((t) => t.isRecurring);

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const recurringTotal = recurringIncome.reduce((sum, t) => sum + t.amount, 0);
  const recurringPercentage = totalIncome > 0 ? (recurringTotal / totalIncome) * 100 : 0;

  // Calculate volatility from history
  let volatilityScore = 50;
  if (monthlyDataHistory.length >= 3) {
    const incomes = monthlyDataHistory.map((m) => m.income);
    const avg = incomes.reduce((a, b) => a + b, 0) / incomes.length;
    const variance = incomes.reduce((sum, i) => sum + Math.pow(i - avg, 2), 0) / incomes.length;
    const stdDev = Math.sqrt(variance);
    const cv = avg > 0 ? (stdDev / avg) * 100 : 100; // Coefficient of variation
    volatilityScore = Math.min(100, cv);
  }

  // Determine trend
  let trend: IncomeStability['trend'] = 'stable';
  if (monthlyDataHistory.length >= 2) {
    const recent = monthlyDataHistory.slice(-3);
    const first = recent[0]?.income || 0;
    const last = recent[recent.length - 1]?.income || 0;
    if (last > first * 1.1) trend = 'increasing';
    else if (last < first * 0.9) trend = 'decreasing';
  }

  const isStable = volatilityScore < 30 && recurringPercentage > 50;

  let warning: string | undefined;
  if (volatilityScore > 50) {
    warning = "Your income varies significantly month-to-month. This makes planning harder.";
  } else if (recurringPercentage < 30) {
    warning = "Most of your income is one-time. Consider building recurring revenue streams.";
  }

  return {
    isStable,
    volatilityScore: Math.round(volatilityScore),
    recurringPercentage: Math.round(recurringPercentage),
    warning,
    trend,
  };
}

// Get Experiment Summary
export function getExperimentSummary(transactions: Transaction[]): ExperimentSummary {
  const experiments = transactions.filter(
    (t) => t.type === 'expense' && t.isExperiment
  );

  const totalSpend = experiments.reduce((sum, t) => sum + t.amount, 0);

  return {
    totalSpend,
    experimentCount: experiments.length,
    experiments: experiments.map((e) => ({
      description: e.description,
      amount: e.amount,
      date: e.date,
      notes: e.experimentNotes,
    })),
    noReturnExperiments: experiments
      .filter((e) => !e.experimentNotes?.toLowerCase().includes('success'))
      .map((e) => e.description),
  };
}

// Detect Silent Expense Killers
export function detectSilentExpenseKillers(
  transactions: Transaction[],
  monthlyDataHistory: { expenses: number }[]
): SilentExpenseKiller[] {
  const killers: SilentExpenseKiller[] = [];
  const now = new Date();

  // Group expenses by category over past 3 months
  const expensesByCategory: Record<string, { month: number; total: number }[]> = {};

  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const date = new Date(t.date);
      const monthsAgo = (now.getFullYear() - date.getFullYear()) * 12 + now.getMonth() - date.getMonth();

      if (monthsAgo <= 3) {
        if (!expensesByCategory[t.category]) {
          expensesByCategory[t.category] = [];
        }
        expensesByCategory[t.category].push({ month: monthsAgo, total: t.amount });
      }
    });

  // Find categories with increasing spend
  Object.entries(expensesByCategory).forEach(([category, expenses]) => {
    if (expenses.length < 2) return;

    const byMonth: Record<number, number> = {};
    expenses.forEach((e) => {
      byMonth[e.month] = (byMonth[e.month] || 0) + e.total;
    });

    const months = Object.keys(byMonth).map(Number).sort((a, b) => b - a);
    if (months.length >= 2) {
      const recent = byMonth[months[0]] || 0;
      const previous = byMonth[months[1]] || 0;

      if (previous > 0 && recent > previous) {
        const growthRate = ((recent - previous) / previous) * 100;

        if (growthRate > 10) {
          const severity: SilentExpenseKiller['severity'] =
            growthRate > 50 ? 'high' : growthRate > 25 ? 'medium' : 'low';

          killers.push({
            id: category,
            description: `${category} expenses increased`,
            category,
            monthlyAmount: recent,
            growthRate,
            actionSuggestion: `Review your ${category} spending - it grew ${Math.round(growthRate)}% last month`,
            severity,
          });
        }
      }
    }
  });

  // Check for recurring expenses that might be underused
  const subscriptionLike = transactions.filter(
    (t) => t.type === 'expense' && t.isRecurring && t.category === 'software'
  );

  subscriptionLike.forEach((sub) => {
    if (sub.amount > 200) {
      killers.push({
        id: sub.id,
        description: `High recurring cost: ${sub.description}`,
        category: sub.category,
        monthlyAmount: sub.amount,
        growthRate: 0,
        actionSuggestion: "Review if this subscription is still needed or can be downgraded",
        severity: sub.amount > 500 ? 'high' : 'medium',
      });
    }
  });

  return killers.sort((a, b) => b.monthlyAmount - a.monthlyAmount);
}

// What-If Scenario Calculator
export function calculateWhatIfScenario(
  summary: CashFlowSummary,
  scenario: WhatIfScenario
): WhatIfResult {
  const { currentBalance, burnRate, totalIncome, totalExpenses } = summary;

  // Calculate new expenses
  const hiringCost = scenario.hireCount * scenario.avgSalary;
  const marketingChange = totalExpenses * (scenario.marketingChange / 100);
  const generalExpenseChange = totalExpenses * (scenario.expenseChange / 100);
  const revenueChange = totalIncome * (scenario.revenueChange / 100);

  const newIncome = totalIncome + revenueChange;
  const newExpenses = totalExpenses + hiringCost + marketingChange + generalExpenseChange;

  const newNetCashFlow = newIncome - newExpenses;
  const newBurnRate = Math.max(0, -newNetCashFlow); // Burn rate is negative cashflow
  const newRunway = newBurnRate > 0 ? Math.floor(currentBalance / newBurnRate) : 999;

  const cashOutDate = newBurnRate > 0
    ? new Date(Date.now() + newRunway * 30 * 24 * 60 * 60 * 1000)
    : null;

  // Generate summary
  let impactSummary = '';
  if (newNetCashFlow > summary.netCashFlow) {
    if (newNetCashFlow > 0 && summary.netCashFlow <= 0) {
      impactSummary = `This scenario makes you profitable with $${newNetCashFlow.toLocaleString()} positive flow!`;
    } else {
      impactSummary = `This scenario improves your monthly cash flow by $${(newNetCashFlow - summary.netCashFlow).toLocaleString()}!`;
    }
  } else if (newBurnRate > burnRate) {
    // If we are burning more
    if (summary.runwayMonths > newRunway && summary.runwayMonths < 999) {
      impactSummary = `This scenario reduces your runway by ${summary.runwayMonths - newRunway} months.`;
    } else {
      impactSummary = `This scenario increases your monthly burn by $${(newBurnRate - burnRate).toLocaleString()}.`;
    }
  } else if (newBurnRate < burnRate) {
    // Burning less
    impactSummary = `This scenario extends your runway or saves you $${(burnRate - newBurnRate).toLocaleString()} monthly!`;
  } else {
    impactSummary = "This scenario maintains your current financial trajectory.";
  }

  return {
    newBurnRate: Math.round(newBurnRate),
    newRunway: Math.min(999, newRunway),
    cashOutDate,
    impactSummary,
    newNetCashFlow: Math.round(newNetCashFlow),
  };
}

// Generate CFO Insights
export function generateCFOInsights(
  summary: CashFlowSummary,
  transactions: Transaction[],
  burnBreakdown: BurnBreakdown,
  incomeStability: IncomeStability
): CFOInsight[] {
  const insights: CFOInsight[] = [];
  const { runwayMonths, burnRate, totalIncome, totalExpenses, netCashFlow } = summary;

  // Hiring insight
  if (runwayMonths < 12) {
    insights.push({
      id: 'hiring-warning',
      type: 'hiring',
      title: 'Hiring is Risky Right Now',
      message: `With ${runwayMonths} months of runway, adding a new hire would significantly reduce your survival time. Consider waiting until you have 12+ months of runway.`,
      impact: 'Each $5K salary reduces runway by ~1 month',
      priority: 'high',
    });
  }

  // Expense vs Income growth
  if (totalExpenses > totalIncome && totalIncome > 0) {
    const ratio = ((totalExpenses - totalIncome) / totalIncome * 100).toFixed(0);
    insights.push({
      id: 'expense-growth',
      type: 'expense',
      title: "You're Spending More Than You Earn",
      message: `Your expenses are ${ratio}% higher than income. This rate will drain your savings.`,
      impact: `$${Math.abs(netCashFlow).toLocaleString()} leaves your account every month`,
      priority: 'high',
    });
  }

  // Waste burn insight
  if (burnBreakdown.wasteBurn > 0) {
    const runwayGain = burnBreakdown.wasteBurn / burnRate;
    insights.push({
      id: 'waste-elimination',
      type: 'expense',
      title: 'Cut Waste to Extend Runway',
      message: `You have $${burnBreakdown.wasteBurn.toLocaleString()}/month in waste expenses that can be eliminated.`,
      impact: `Cutting this adds ~${Math.round(runwayGain)} month(s) of runway`,
      priority: 'medium',
    });
  }

  // Income stability warning
  if (!incomeStability.isStable) {
    insights.push({
      id: 'income-volatility',
      type: 'revenue',
      title: 'Unstable Income Pattern',
      message: incomeStability.warning || "Your income fluctuates significantly, making it harder to plan.",
      priority: incomeStability.volatilityScore > 50 ? 'high' : 'medium',
    });
  }

  // Positive insight
  if (netCashFlow > 0) {
    insights.push({
      id: 'positive-flow',
      type: 'general',
      title: 'Growing Your Safety Net',
      message: `You're adding $${netCashFlow.toLocaleString()} to your savings each month. Keep it up!`,
      priority: 'low',
    });
  }

  // Runway milestone insights
  if (runwayMonths >= 12 && runwayMonths < 18) {
    insights.push({
      id: 'runway-good',
      type: 'runway',
      title: 'Healthy Runway',
      message: 'You have a solid runway. Now might be a good time to invest in growth.',
      priority: 'low',
    });
  }

  return insights.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

// Generate Weekly Actions
export function generateWeeklyActions(
  summary: CashFlowSummary,
  burnBreakdown: BurnBreakdown,
  silentKillers: SilentExpenseKiller[]
): WeeklyAction[] {
  const actions: WeeklyAction[] = [];
  const { runwayMonths, burnRate, netCashFlow } = summary;

  // Always include subscription review
  actions.push({
    id: 'review-subs',
    action: 'Review all subscriptions and cancel unused ones',
    category: 'review',
    isCompleted: false,
    reason: 'Regular review prevents waste and saves money',
  });

  // Based on runway
  if (runwayMonths < 6) {
    actions.push({
      id: 'cut-non-essential',
      action: 'Cut all non-essential expenses immediately',
      category: 'reduce',
      isCompleted: false,
      reason: `With only ${runwayMonths} months of runway, every dollar matters`,
    });

    actions.push({
      id: 'delay-hiring',
      action: 'Delay any new hires until runway improves',
      category: 'delay',
      isCompleted: false,
      reason: 'Adding salaries will accelerate cash burnout',
    });
  }

  // Based on net cash flow
  if (netCashFlow < 0) {
    actions.push({
      id: 'increase-prices',
      action: 'Consider increasing prices by 10-20%',
      category: 'increase',
      isCompleted: false,
      reason: 'Most startups underprice. A small increase can significantly impact runway.',
    });
  }

  // Based on burn breakdown
  if (burnBreakdown.wasteBurn > 500) {
    actions.push({
      id: 'eliminate-waste',
      action: `Eliminate waste expenses ($${burnBreakdown.wasteBurn.toLocaleString()}/month identified)`,
      category: 'reduce',
      isCompleted: false,
      reason: 'Waste expenses offer no business value',
    });
  }

  // Based on silent killers
  if (silentKillers.length > 0) {
    const topKiller = silentKillers[0];
    actions.push({
      id: 'address-killer',
      action: topKiller.actionSuggestion,
      category: 'review',
      isCompleted: false,
      reason: `This expense is growing faster than expected`,
    });
  }

  return actions.slice(0, 5); // Max 5 actions per week
}

// Check for Panic Alerts
export function checkPanicAlerts(
  summary: CashFlowSummary,
  monthlyDataHistory: { income: number; expenses: number }[]
): PanicAlert[] {
  const alerts: PanicAlert[] = [];
  const now = new Date().toISOString();

  // Critical runway alert
  if (summary.runwayMonths <= 3) {
    alerts.push({
      id: 'runway-critical',
      type: 'runway_critical',
      title: 'Critical: Running Out of Money',
      message: `You only have ${summary.runwayMonths} month${summary.runwayMonths === 1 ? '' : 's'} of cash left. Take immediate action.`,
      severity: 'critical',
      createdAt: now,
      isRead: false,
      isDismissed: false,
    });
  }

  // Consecutive losses
  if (monthlyDataHistory.length >= 2) {
    const lastTwo = monthlyDataHistory.slice(-2);
    const consecutiveLoss = lastTwo.every((m) => m.expenses > m.income);
    if (consecutiveLoss) {
      alerts.push({
        id: 'consecutive-loss',
        type: 'consecutive_loss',
        title: 'Two Months of Losses',
        message: 'Your expenses have exceeded income for two consecutive months. Review spending patterns.',
        severity: 'warning',
        createdAt: now,
        isRead: false,
        isDismissed: false,
      });
    }
  }

  // Burn rate spike
  if (monthlyDataHistory.length >= 2) {
    const recent = monthlyDataHistory.slice(-2);
    const previousExpenses = recent[0]?.expenses || 0;
    const currentExpenses = recent[1]?.expenses || 0;

    if (previousExpenses > 0 && currentExpenses > previousExpenses * 1.3) {
      const increase = Math.round(((currentExpenses - previousExpenses) / previousExpenses) * 100);
      alerts.push({
        id: 'expense-spike',
        type: 'expense_spike',
        title: 'Spending Spike Detected',
        message: `Your expenses increased by ${increase}% this month. Make sure this was intentional.`,
        severity: 'warning',
        createdAt: now,
        isRead: false,
        isDismissed: false,
      });
    }
  }

  return alerts;
}

// Get Founder Draw Impact
export function getFounderDrawImpact(
  transactions: Transaction[],
  summary: CashFlowSummary
): { totalDraws: number; runwayImpact: number; warning?: string } {
  const founderDraws = transactions.filter(
    (t) => t.type === 'expense' && (t.isFounderDraw || t.category === 'founder_draw')
  );

  const now = new Date();
  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const recentDraws = founderDraws.filter((t) => new Date(t.date) >= threeMonthsAgo);
  const monthlyDrawAverage = recentDraws.reduce((sum, t) => sum + t.amount, 0) / 3;

  const totalDraws = founderDraws.reduce((sum, t) => sum + t.amount, 0);
  const runwayImpact = summary.burnRate > 0
    ? Math.round(monthlyDrawAverage / summary.burnRate * summary.runwayMonths * 0.5)
    : 0;

  let warning: string | undefined;
  if (monthlyDrawAverage > summary.burnRate * 0.3) {
    warning = "Founder draws are significantly reducing your runway. Consider reducing personal withdrawals.";
  }

  return {
    totalDraws,
    runwayImpact,
    warning,
  };
}
