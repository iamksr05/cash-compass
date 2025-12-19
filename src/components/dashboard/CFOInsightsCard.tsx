import { CFOInsight, WeeklyAction } from '@/types/cashflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Lightbulb, CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CFOInsightsCardProps {
  insights: CFOInsight[];
  weeklyActions: WeeklyAction[];
  onToggleAction?: (actionId: string) => void;
}

export function CFOInsightsCard({ insights, weeklyActions, onToggleAction }: CFOInsightsCardProps) {
  const priorityColors = {
    high: 'border-l-danger bg-danger/5',
    medium: 'border-l-warning bg-warning/5',
    low: 'border-l-success bg-success/5',
  };

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Brain className="h-5 w-5 text-primary" />
          Your Virtual CFO
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Rule-based advice to help you make better financial decisions
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Top Insights */}
        <div className="space-y-2">
          {insights.slice(0, 3).map((insight) => (
            <div
              key={insight.id}
              className={cn(
                'rounded-lg border-l-4 p-3',
                priorityColors[insight.priority]
              )}
            >
              <p className="text-sm font-medium text-foreground">{insight.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{insight.message}</p>
              {insight.impact && (
                <p className="text-xs font-medium text-primary mt-1 flex items-center gap-1">
                  <ArrowRight className="h-3 w-3" />
                  {insight.impact}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Weekly Actions */}
        {weeklyActions.length > 0 && (
          <div className="pt-3 border-t border-border">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-warning" />
              <p className="text-sm font-medium text-foreground">This Week's Actions</p>
            </div>
            <div className="space-y-2">
              {weeklyActions.slice(0, 4).map((action) => (
                <button
                  key={action.id}
                  onClick={() => onToggleAction?.(action.id)}
                  className="w-full flex items-start gap-3 text-left p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {action.isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className={cn(
                      'text-sm',
                      action.isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'
                    )}>
                      {action.action}
                    </p>
                    <p className="text-xs text-muted-foreground">{action.reason}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
