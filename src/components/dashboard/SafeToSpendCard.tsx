import { SafeToSpend } from '@/types/cashflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, ShieldCheck, Info } from 'lucide-react';
import { formatCurrency } from '@/lib/calculations';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SafeToSpendCardProps {
  safeToSpend: SafeToSpend;
  currency: string;
  currentBalance: number;
}

export function SafeToSpendCard({ safeToSpend, currency, currentBalance }: SafeToSpendCardProps) {
  const { amount, percentage, explanation, minRunwayProtected } = safeToSpend;
  
  const isSafe = percentage > 10;
  const isWarning = percentage > 0 && percentage <= 10;
  const isDanger = percentage === 0;

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg font-semibold">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Safe to Spend
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-medium">What is Safe to Spend?</p>
                <p className="text-xs text-muted-foreground mt-1">
                  This is the amount you can safely spend this month while keeping at least {minRunwayProtected} months of survival runway protected.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className={cn(
            'text-3xl font-bold number-display',
            isDanger ? 'text-danger' : isWarning ? 'text-warning' : 'text-success'
          )}>
            {formatCurrency(amount, currency)}
          </span>
          <span className="text-sm text-muted-foreground">
            this month
          </span>
        </div>

        {/* Progress bar showing safe vs protected */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Safe to spend</span>
            <span className="font-medium">{percentage}% of balance</span>
          </div>
          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                isDanger ? 'bg-danger' : isWarning ? 'bg-warning' : 'bg-success'
              )}
              style={{ width: `${Math.min(100, percentage)}%` }}
            />
            <div
              className="absolute right-0 top-0 h-full bg-muted-foreground/20 rounded-r-full"
              style={{ width: `${100 - Math.min(100, percentage)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{formatCurrency(amount, currency)}</span>
            <span>
              {formatCurrency(currentBalance - amount, currency)} protected
            </span>
          </div>
        </div>

        {/* Explanation */}
        <div className={cn(
          'flex items-start gap-2 rounded-lg p-3',
          isDanger ? 'bg-danger/10' : isWarning ? 'bg-warning/10' : 'bg-success/10'
        )}>
          <ShieldCheck className={cn(
            'h-4 w-4 mt-0.5 flex-shrink-0',
            isDanger ? 'text-danger' : isWarning ? 'text-warning' : 'text-success'
          )} />
          <p className="text-sm text-muted-foreground">{explanation}</p>
        </div>
      </CardContent>
    </Card>
  );
}
