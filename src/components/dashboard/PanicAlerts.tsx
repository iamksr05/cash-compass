import { PanicAlert } from '@/types/cashflow';
import { AlertTriangle, X, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PanicAlertsProps {
  alerts: PanicAlert[];
  onDismiss: (alertId: string) => void;
}

export function PanicAlerts({ alerts, onDismiss }: PanicAlertsProps) {
  const activeAlerts = alerts.filter((a) => !a.isDismissed);
  
  if (activeAlerts.length === 0) return null;

  const severityConfig = {
    critical: {
      bg: 'bg-danger',
      border: 'border-danger',
      icon: AlertTriangle,
    },
    warning: {
      bg: 'bg-warning',
      border: 'border-warning',
      icon: Bell,
    },
    info: {
      bg: 'bg-primary',
      border: 'border-primary',
      icon: Bell,
    },
  };

  return (
    <div className="space-y-2">
      {activeAlerts.map((alert) => {
        const config = severityConfig[alert.severity];
        const Icon = config.icon;

        return (
          <div
            key={alert.id}
            className={cn(
              'flex items-start gap-3 rounded-lg border p-4 animate-pulse',
              alert.severity === 'critical' ? 'bg-danger/10 border-danger/30' : 
              alert.severity === 'warning' ? 'bg-warning/10 border-warning/30' : 'bg-primary/10 border-primary/30'
            )}
          >
            <div className={cn('rounded-full p-2', config.bg)}>
              <Icon className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                'font-semibold',
                alert.severity === 'critical' ? 'text-danger' : 
                alert.severity === 'warning' ? 'text-warning' : 'text-primary'
              )}>
                {alert.title}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onDismiss(alert.id)}
              className="flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
