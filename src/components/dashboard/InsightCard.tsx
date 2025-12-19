import { cn } from '@/lib/utils';
import { Insight } from '@/types/cashflow';
import { AlertTriangle, Info, AlertCircle, CheckCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InsightCardProps {
  insight: Insight;
  onAction?: () => void;
}

export function InsightCard({ insight, onAction }: InsightCardProps) {
  const typeConfig = {
    info: {
      icon: Info,
      bgColor: 'bg-primary/5',
      borderColor: 'border-l-primary',
      iconColor: 'text-primary',
      iconBg: 'bg-primary/10',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-warning/5',
      borderColor: 'border-l-warning',
      iconColor: 'text-warning',
      iconBg: 'bg-warning/10',
    },
    danger: {
      icon: AlertCircle,
      bgColor: 'bg-danger/5',
      borderColor: 'border-l-danger',
      iconColor: 'text-danger',
      iconBg: 'bg-danger/10',
    },
    success: {
      icon: CheckCircle,
      bgColor: 'bg-success/5',
      borderColor: 'border-l-success',
      iconColor: 'text-success',
      iconBg: 'bg-success/10',
    },
  };

  const config = typeConfig[insight.type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex items-start gap-4 rounded-lg border-l-4 p-4 transition-all duration-200 hover:shadow-md',
        config.bgColor,
        config.borderColor
      )}
    >
      <div className={cn('rounded-lg p-2', config.iconBg)}>
        <Icon className={cn('h-5 w-5', config.iconColor)} />
      </div>
      <div className="flex-1 space-y-1">
        <h4 className="font-semibold text-foreground">{insight.title}</h4>
        <p className="text-sm text-muted-foreground">{insight.message}</p>
        {insight.actionLabel && (
          <Button
            variant="ghost"
            size="sm"
            className={cn('mt-2 h-auto p-0', config.iconColor)}
            onClick={onAction}
          >
            {insight.actionLabel}
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
