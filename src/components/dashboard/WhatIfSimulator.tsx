
import { useState, useMemo } from 'react';
import { WhatIfScenario, WhatIfResult, CashFlowSummary } from '@/types/cashflow';
import { calculateWhatIfScenario } from '@/lib/founderCalculations';
import { formatCurrency } from '@/lib/calculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Calculator, UserPlus, Megaphone, TrendingUp, TrendingDown, RotateCcw, AlertTriangle, Calendar, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { plainEnglishTerms } from '@/types/cashflow';

interface WhatIfSimulatorProps {
  summary: CashFlowSummary;
  currency: string;
}

export function WhatIfSimulator({ summary, currency }: WhatIfSimulatorProps) {
  const [scenario, setScenario] = useState<WhatIfScenario>({
    hireCount: 0,
    avgSalary: 5000,
    marketingChange: 0,
    revenueChange: 0,
    expenseChange: 0,
  });

  const result = useMemo(() => {
    return calculateWhatIfScenario(summary, scenario);
  }, [summary, scenario]);

  const hasChanges = scenario.hireCount !== 0 ||
    scenario.marketingChange !== 0 ||
    scenario.revenueChange !== 0 ||
    scenario.expenseChange !== 0;

  const resetScenario = () => {
    setScenario({
      hireCount: 0,
      avgSalary: 5000,
      marketingChange: 0,
      revenueChange: 0,
      expenseChange: 0,
    });
  };

  const runwayChange = result.newRunway - result.baselineRunway;
  const burnChange = result.newBurnRate - result.baselineBurn;
  const netFlowChange = result.newNetCashFlow - result.baselineNetCashFlow;

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Calculator className="h-5 w-5 text-primary" />
            What-If Simulator
          </CardTitle>
          {hasChanges && (
            <Button variant="ghost" size="sm" onClick={resetScenario}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Adjust the sliders to see how changes affect your finances
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sliders */}
        <div className="space-y-5">
          {/* Hiring */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">New Hires</span>
              </div>
              <span className="text-sm font-bold text-foreground">
                {scenario.hireCount} {scenario.hireCount === 1 ? 'person' : 'people'}
              </span>
            </div>
            <Slider
              value={[scenario.hireCount]}
              onValueChange={([value]) => setScenario({ ...scenario, hireCount: value })}
              min={0}
              max={5}
              step={1}
              className="py-2"
            />
            <p className="text-xs text-muted-foreground">
              At {formatCurrency(scenario.avgSalary, currency)}/month each
            </p>
          </div>

          {/* Marketing */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Marketing Spend</span>
              </div>
              <span className={cn(
                'text-sm font-bold',
                scenario.marketingChange > 0 ? 'text-danger' : scenario.marketingChange < 0 ? 'text-success' : 'text-foreground'
              )}>
                {scenario.marketingChange > 0 ? '+' : ''}{scenario.marketingChange}%
              </span>
            </div>
            <Slider
              value={[scenario.marketingChange]}
              onValueChange={([value]) => setScenario({ ...scenario, marketingChange: value })}
              min={-50}
              max={100}
              step={10}
              className="py-2"
            />
          </div>

          {/* Revenue */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Revenue Change</span>
              </div>
              <span className={cn(
                'text-sm font-bold',
                scenario.revenueChange > 0 ? 'text-success' : scenario.revenueChange < 0 ? 'text-danger' : 'text-foreground'
              )}>
                {scenario.revenueChange > 0 ? '+' : ''}{scenario.revenueChange}%
              </span>
            </div>
            <Slider
              value={[scenario.revenueChange]}
              onValueChange={([value]) => setScenario({ ...scenario, revenueChange: value })}
              min={-50}
              max={100}
              step={10}
              className="py-2"
            />
          </div>

          {/* General Expenses */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Other Expenses</span>
              </div>
              <span className={cn(
                'text-sm font-bold',
                scenario.expenseChange > 0 ? 'text-danger' : scenario.expenseChange < 0 ? 'text-success' : 'text-foreground'
              )}>
                {scenario.expenseChange > 0 ? '+' : ''}{scenario.expenseChange}%
              </span>
            </div>
            <Slider
              value={[scenario.expenseChange]}
              onValueChange={([value]) => setScenario({ ...scenario, expenseChange: value })}
              min={-50}
              max={50}
              step={5}
              className="py-2"
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3 pt-4 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Projected Impact
          </p>

          <div className="grid grid-cols-2 gap-4">

            {/* New Net Cash Flow Tile */}
            <div className={cn(
              'rounded-lg p-3 col-span-2 sm:col-span-1',
              result.newNetCashFlow > 0 ? 'bg-success/10' : 'bg-danger/10'
            )}>
              <p className="text-xs text-muted-foreground">Net Cash Flow</p>
              <p className={cn(
                'text-lg font-bold number-display',
                result.newNetCashFlow > 0 ? 'text-success' : 'text-danger'
              )}>
                {formatCurrency(result.newNetCashFlow, currency)}
              </p>
              {netFlowChange !== 0 && (
                <p className={cn(
                  'text-xs font-medium',
                  netFlowChange > 0 ? 'text-success' : 'text-danger'
                )}>
                  {netFlowChange > 0 ? '+' : ''}{formatCurrency(netFlowChange, currency)}
                </p>
              )}
            </div>

            <div className={cn(
              'rounded-lg p-3 col-span-2 sm:col-span-1',
              runwayChange < 0 ? 'bg-danger/10' : runwayChange > 0 ? 'bg-success/10' : 'bg-muted'
            )}>
              <p className="text-xs text-muted-foreground">{plainEnglishTerms.runway.term}</p>
              <p className={cn(
                'text-lg font-bold number-display',
                runwayChange < 0 ? 'text-danger' : runwayChange > 0 ? 'text-success' : 'text-foreground'
              )}>
                {result.newRunway > 100 ? '∞' : `${result.newRunway} months`}
              </p>
              {runwayChange !== 0 && result.newRunway <= 100 && result.baselineRunway <= 100 && (
                <p className={cn(
                  'text-xs font-medium',
                  runwayChange < 0 ? 'text-danger' : 'text-success'
                )}>
                  {runwayChange > 0 ? '+' : ''}{runwayChange} months
                </p>
              )}
            </div>
          </div>

          {/* Cash out date */}
          {result.cashOutDate && result.newRunway < 24 && (
            <div className="flex items-center gap-2 rounded-lg bg-warning/10 p-3">
              <Calendar className="h-4 w-4 text-warning flex-shrink-0" />
              <p className="text-sm text-warning">
                Cash runs out around <strong>{result.cashOutDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</strong>
              </p>
            </div>
          )}

          {/* Impact Summary */}
          {hasChanges && (
            <div className={cn(
              'flex items-start gap-2 rounded-lg p-3',
              (result.newNetCashFlow > summary.netCashFlow) ? 'bg-success/10' : 'bg-muted'
            )}>
              {(result.newNetCashFlow > summary.netCashFlow) ? (
                <TrendingUp className="h-4 w-4 mt-0.5 flex-shrink-0 text-success" />
              ) : (
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
              )}
              <p className="text-sm">
                {result.impactSummary}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
