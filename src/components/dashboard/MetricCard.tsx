import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'primary';
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: MetricCardProps) {
  const variantStyles = {
    default: {
      container: 'bg-card',
      icon: 'bg-secondary text-secondary-foreground',
      iconColor: 'text-muted-foreground',
    },
    success: {
      container: 'bg-card',
      icon: 'bg-success/10 text-success',
      iconColor: 'text-success',
    },
    warning: {
      container: 'bg-card',
      icon: 'bg-warning/10 text-warning',
      iconColor: 'text-warning',
    },
    danger: {
      container: 'bg-card',
      icon: 'bg-danger/10 text-danger',
      iconColor: 'text-danger',
    },
    primary: {
      container: 'bg-primary text-primary-foreground',
      icon: 'bg-primary-foreground/20 text-primary-foreground',
      iconColor: 'text-primary-foreground',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        'card-elevated card-glow p-6 transition-all duration-300 hover:shadow-lg',
        styles.container,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p
            className={cn(
              'text-sm font-medium',
              variant === 'primary' ? 'text-primary-foreground/80' : 'text-muted-foreground'
            )}
          >
            {title}
          </p>
          <p className="number-display text-3xl lg:text-4xl">{value}</p>
          {subtitle && (
            <p
              className={cn(
                'text-sm',
                variant === 'primary' ? 'text-primary-foreground/70' : 'text-muted-foreground'
              )}
            >
              {subtitle}
            </p>
          )}
          {trend && (
            <div
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
                trend.isPositive
                  ? 'bg-success/10 text-success'
                  : 'bg-danger/10 text-danger'
              )}
            >
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
        <div className={cn('rounded-xl p-3', styles.icon)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
