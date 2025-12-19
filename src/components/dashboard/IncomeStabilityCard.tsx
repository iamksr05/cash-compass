import { IncomeStability } from '@/types/cashflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2, RefreshCw, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface IncomeStabilityCardProps {
  stability: IncomeStability;
}

export function IncomeStabilityCard({ stability }: IncomeStabilityCardProps) {
  const { isStable, volatilityScore, recurringPercentage, warning, trend } = stability;

  const TrendIcon = trend === 'increasing' ? TrendingUp : trend === 'decreasing' ? TrendingDown : Minus;
  const trendColor = trend === 'increasing' ? 'text-success' : trend === 'decreasing' ? 'text-danger' : 'text-muted-foreground';

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg font-semibold">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            Income Stability
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-medium">Understanding Income Stability</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Stable income means predictable cash flow. Higher recurring revenue percentage and lower volatility = better stability.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <div className={cn(
            'flex items-center gap-2 rounded-full px-3 py-1',
            isStable ? 'bg-success/10' : 'bg-warning/10'
          )}>
            {isStable ? (
              <CheckCircle2 className="h-4 w-4 text-success" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-warning" />
            )}
            <span className={cn('text-sm font-medium', isStable ? 'text-success' : 'text-warning')}>
              {isStable ? 'Stable Income' : 'Unstable Income'}
            </span>
          </div>
          <div className={cn('flex items-center gap-1', trendColor)}>
            <TrendIcon className="h-4 w-4" />
            <span className="text-sm font-medium capitalize">{trend}</span>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Recurring Revenue</p>
            <div className="flex items-baseline gap-1">
              <span className={cn(
                'text-2xl font-bold number-display',
                recurringPercentage >= 50 ? 'text-success' : 'text-warning'
              )}>
                {recurringPercentage}%
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  recurringPercentage >= 50 ? 'bg-success' : 'bg-warning'
                )}
                style={{ width: `${Math.min(100, recurringPercentage)}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Volatility Score</p>
            <div className="flex items-baseline gap-1">
              <span className={cn(
                'text-2xl font-bold number-display',
                volatilityScore <= 30 ? 'text-success' : volatilityScore <= 50 ? 'text-warning' : 'text-danger'
              )}>
                {volatilityScore}
              </span>
              <span className="text-xs text-muted-foreground">/100</span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {volatilityScore <= 30 ? 'Low (good)' : volatilityScore <= 50 ? 'Moderate' : 'High (risky)'}
            </p>
          </div>
        </div>

        {/* Warning */}
        {warning && (
          <div className="flex items-start gap-2 rounded-lg bg-warning/10 p-3">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0 text-warning" />
            <p className="text-sm text-warning">{warning}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
