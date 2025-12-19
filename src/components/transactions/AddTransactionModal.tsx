import { useState } from 'react';
import { X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Transaction,
  IncomeCategory,
  ExpenseCategory,
  BurnCategory
} from '@/types/cashflow';
import { expenseCategoryLabels, incomeCategoryLabels, currencySymbols } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  currency?: string;
}

export function AddTransactionModal({ isOpen, onClose, onAdd, currency = 'USD' }: AddTransactionModalProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<string>('');
  const [description, setDescription] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  // New fields
  const [burnCategory, setBurnCategory] = useState<BurnCategory | undefined>(undefined);
  const [isExperiment, setIsExperiment] = useState(false);
  const [experimentNotes, setExperimentNotes] = useState('');
  const [isFounderDraw, setIsFounderDraw] = useState(false);

  const categories = type === 'income' ? incomeCategoryLabels : expenseCategoryLabels;
  const currencySymbol = currencySymbols[currency] || '$';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !description) return;

    onAdd({
      type,
      amount: parseFloat(amount),
      date,
      category: category as IncomeCategory | ExpenseCategory,
      description,
      isRecurring,
      recurringFrequency: isRecurring ? 'monthly' : undefined,
      burnCategory: type === 'expense' ? burnCategory : undefined,
      isExperiment: type === 'expense' ? isExperiment : false,
      experimentNotes: type === 'expense' && isExperiment ? experimentNotes : undefined,
      isFounderDraw: type === 'expense' ? isFounderDraw : false,
    });

    // Reset form
    setAmount('');
    setCategory('');
    setDescription('');
    setIsRecurring(false);
    setBurnCategory(undefined);
    setIsExperiment(false);
    setExperimentNotes('');
    setIsFounderDraw(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md animate-scale-in rounded-2xl bg-card p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Add Transaction</h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type toggle */}
          <div className="flex gap-2 rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory('');
              }}
              className={cn(
                'flex-1 rounded-md py-2.5 text-sm font-medium transition-all',
                type === 'income'
                  ? 'bg-success text-success-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Cash In
            </button>
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategory('');
              }}
              className={cn(
                'flex-1 rounded-md py-2.5 text-sm font-medium transition-all',
                type === 'expense'
                  ? 'bg-danger text-danger-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Cash Out
            </button>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">
                {currencySymbol}
              </span>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 text-lg"
                required
              />
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categories).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="What's this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Expense Specific Fields */}
          {type === 'expense' && (
            <div className="space-y-4 pt-2 border-t border-border">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Burn Category</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Survival: Must-pay (Rent, Salaries)</p>
                        <p>Growth: Marketing, Hiring, Experiments</p>
                        <p>Waste: Unnecessary costs</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Select value={burnCategory} onValueChange={(v) => setBurnCategory(v as BurnCategory)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select burn type (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="survival">Survival (Must pay)</SelectItem>
                    <SelectItem value="growth">Growth (Investments)</SelectItem>
                    <SelectItem value="waste">Waste (Low value)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Founder Draw</Label>
                  <p className="text-xs text-muted-foreground">Is this a personal withdrawal?</p>
                </div>
                <Switch checked={isFounderDraw} onCheckedChange={setIsFounderDraw} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Experiment</Label>
                    <p className="text-xs text-muted-foreground">Is this a test or experiment?</p>
                  </div>
                  <Switch checked={isExperiment} onCheckedChange={setIsExperiment} />
                </div>
                {isExperiment && (
                  <Textarea
                    placeholder="Experiment notes/hypothesis..."
                    value={experimentNotes}
                    onChange={(e) => setExperimentNotes(e.target.value)}
                  />
                )}
              </div>
            </div>
          )}

          {/* Recurring toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-muted/20">
            <div>
              <p className="font-medium text-foreground">Recurring</p>
              <p className="text-xs text-muted-foreground">
                This happens every month
              </p>
            </div>
            <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            variant={type === 'income' ? 'success' : 'default'}
            onClick={handleSubmit}
          >
            Add {type === 'income' ? 'Income' : 'Expense'}
          </Button>
        </form>
      </div>
    </div>
  );
}
