import { cn } from '@/lib/utils';
import { AlertTriangle, Clock, Rocket, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/lib/calculations';

interface RunwayIndicatorProps {
  months: number;
  burnRate: number;
  currentBalance: number;
  currency?: string;
}

export function RunwayIndicator({
  months,
  burnRate,
  currentBalance,
  currency = 'USD',
}: RunwayIndicatorProps) {
  const getStatus = () => {
    if (months <= 3) return 'critical';
    if (months <= 6) return 'warning';
    if (months <= 12) return 'moderate';
    return 'healthy';
  };

  const status = getStatus();

  const statusConfig = {
    critical: {
      color: 'text-danger',
      bgColor: 'bg-danger/10',
      borderColor: 'border-danger/30',
      icon: AlertTriangle,
      label: 'Critical',
      message: 'Immediate action needed',
      progressColor: 'bg-danger',
    },
    warning: {
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/30',
      icon: TrendingDown,
      label: 'Low Runway',
      message: 'Start planning now',
      progressColor: 'bg-warning',
    },
    moderate: {
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/30',
      icon: Clock,
      label: 'Moderate',
      message: 'Monitor closely',
      progressColor: 'bg-primary',
    },
    healthy: {
      color: 'text-success',
      bgColor: 'bg-success/10',
      borderColor: 'border-success/30',
      icon: Rocket,
      label: 'Healthy',
      message: 'Looking good!',
      progressColor: 'bg-success',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;
  const progressPercentage = Math.min((months / 24) * 100, 100);

  return (
    <div
      className={cn(
        'card-elevated overflow-hidden border-l-4 p-6',
        config.borderColor,
        status === 'critical' && 'animate-pulse-soft'
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn('rounded-xl p-3', config.bgColor)}>
          <Icon className={cn('h-6 w-6', config.color)} />
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">Runway</h3>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-medium',
                  config.bgColor,
                  config.color
                )}
              >
                {config.label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{config.message}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-end justify-between">
              <span className={cn('number-display text-4xl', config.color)}>
                {months}
              </span>
              <span className="text-sm text-muted-foreground">months remaining</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn('h-full rounded-full transition-all duration-500', config.progressColor)}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-xs text-muted-foreground">Monthly Burn Rate</p>
              <p className="number-display text-lg font-semibold text-danger">
                {formatCurrency(burnRate, currency)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current Balance</p>
              <p className="number-display text-lg font-semibold">
                {formatCurrency(currentBalance, currency)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
