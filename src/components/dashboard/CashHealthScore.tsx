import { CashHealthScore as CashHealthScoreType } from '@/types/cashflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CashHealthScoreProps {
  healthScore: CashHealthScoreType;
}

export function CashHealthScoreCard({ healthScore }: CashHealthScoreProps) {
  const { score, status, explanation, actionHint, factors } = healthScore;

  const statusConfig = {
    critical: {
      color: 'text-danger',
      bg: 'bg-danger/10',
      border: 'border-danger/20',
      icon: AlertTriangle,
      label: 'Critical',
    },
    warning: {
      color: 'text-warning',
      bg: 'bg-warning/10',
      border: 'border-warning/20',
      icon: TrendingDown,
      label: 'Needs Attention',
    },
    moderate: {
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/20',
      icon: TrendingUp,
      label: 'Moderate',
    },
    healthy: {
      color: 'text-success',
      bg: 'bg-success/10',
      border: 'border-success/20',
      icon: CheckCircle2,
      label: 'Healthy',
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const factorLabels = {
    balanceFactor: { label: 'Cash Reserves', max: 25 },
    burnRateFactor: { label: 'Spending Efficiency', max: 20 },
    runwayFactor: { label: 'Survival Time', max: 25 },
    incomeTrendFactor: { label: 'Income Growth', max: 15 },
    expenseGrowthFactor: { label: 'Expense Control', max: 15 },
  };

  return (
    <Card className={cn('card-elevated overflow-hidden', config.border)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Heart className={cn('h-5 w-5', config.color)} />
            Cash Health Score
          </CardTitle>
          <div className={cn('rounded-full px-3 py-1 text-xs font-medium', config.bg, config.color)}>
            {config.label}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Display */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <svg className="h-24 w-24 -rotate-90 transform">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * score) / 100}
                className={config.color}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={cn('text-2xl font-bold', config.color)}>{score}</span>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-sm text-muted-foreground">{explanation}</p>
            <div className={cn('flex items-start gap-2 rounded-lg p-3', config.bg)}>
              <StatusIcon className={cn('h-4 w-4 mt-0.5 flex-shrink-0', config.color)} />
              <p className={cn('text-sm font-medium', config.color)}>{actionHint}</p>
            </div>
          </div>
        </div>

        {/* Factor Breakdown */}
        <TooltipProvider>
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Score Breakdown
            </p>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(factors).map(([key, value]) => {
                const factorInfo = factorLabels[key as keyof typeof factorLabels];
                const percentage = (value / factorInfo.max) * 100;
                
                return (
                  <Tooltip key={key}>
                    <TooltipTrigger asChild>
                      <div className="space-y-1 cursor-help">
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn('h-full rounded-full transition-all', config.bg, config.color)}
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: `hsl(var(--${status === 'healthy' ? 'success' : status === 'moderate' ? 'primary' : status === 'warning' ? 'warning' : 'danger'}))`,
                            }}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {factorInfo.label.split(' ')[0]}
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium">{factorInfo.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {value} / {factorInfo.max} points
                      </p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
