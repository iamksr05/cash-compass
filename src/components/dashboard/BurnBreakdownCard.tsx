import { BurnBreakdown } from '@/types/cashflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Shield, Rocket, Trash2, Lightbulb, Info } from 'lucide-react';
import { formatCurrency } from '@/lib/calculations';
import { plainEnglishTerms } from '@/types/cashflow';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface BurnBreakdownCardProps {
  breakdown: BurnBreakdown;
  currency: string;
}

export function BurnBreakdownCard({ breakdown, currency }: BurnBreakdownCardProps) {
  const { survivalBurn, growthBurn, wasteBurn, totalBurn, recommendations } = breakdown;

  const categories = [
    {
      key: 'survival',
      label: plainEnglishTerms.survivalBurn.term,
      amount: survivalBurn,
      icon: Shield,
      color: 'text-primary',
      bg: 'bg-primary/10',
      description: plainEnglishTerms.survivalBurn.explanation,
    },
    {
      key: 'growth',
      label: plainEnglishTerms.growthBurn.term,
      amount: growthBurn,
      icon: Rocket,
      color: 'text-success',
      bg: 'bg-success/10',
      description: plainEnglishTerms.growthBurn.explanation,
    },
    {
      key: 'waste',
      label: plainEnglishTerms.wasteBurn.term,
      amount: wasteBurn,
      icon: Trash2,
      color: 'text-danger',
      bg: 'bg-danger/10',
      description: plainEnglishTerms.wasteBurn.explanation,
    },
  ];

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg font-semibold">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-warning" />
            {plainEnglishTerms.burnRate.term}
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-medium">{plainEnglishTerms.burnRate.term}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {plainEnglishTerms.burnRate.explanation}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1 italic">
                  Example: {plainEnglishTerms.burnRate.example}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <p className="text-2xl font-bold number-display text-foreground">
          {formatCurrency(totalBurn, currency)}<span className="text-sm font-normal text-muted-foreground">/month</span>
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category breakdown */}
        <div className="space-y-3">
          <TooltipProvider>
            {categories.map((cat) => {
              const Icon = cat.icon;
              const percentage = totalBurn > 0 ? (cat.amount / totalBurn) * 100 : 0;
              
              return (
                <Tooltip key={cat.key}>
                  <TooltipTrigger asChild>
                    <div className="space-y-1 cursor-help">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn('rounded-lg p-1.5', cat.bg)}>
                            <Icon className={cn('h-4 w-4', cat.color)} />
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {cat.label}
                          </span>
                        </div>
                        <span className={cn('text-sm font-bold number-display', cat.color)}>
                          {formatCurrency(cat.amount, currency)}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all duration-500')}
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: `hsl(var(--${cat.key === 'survival' ? 'primary' : cat.key === 'growth' ? 'success' : 'danger'}))`,
                          }}
                        />
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-medium">{cat.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{cat.description}</p>
                    <p className="text-xs font-medium mt-1">{Math.round(percentage)}% of total spending</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <Lightbulb className="h-3 w-3" />
              Suggestions
            </div>
            {recommendations.map((rec, index) => (
              <p key={index} className="text-sm text-muted-foreground pl-4 border-l-2 border-warning/50">
                {rec}
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
