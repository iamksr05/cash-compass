import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, DollarSign, Briefcase, ArrowRight, ArrowLeft, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { currencySymbols } from '@/lib/mockData';

const businessTypes = [
  { value: 'service', label: 'Service Business', description: 'Consulting, freelancing, agencies' },
  { value: 'product', label: 'Product Business', description: 'Physical or digital products' },
  { value: 'saas', label: 'SaaS / Software', description: 'Software as a service' },
  { value: 'retail', label: 'Retail', description: 'Stores, e-commerce' },
  { value: 'other', label: 'Other', description: 'Something else' },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: 'service',
    currency: 'USD',
    startingBalance: '',
    monthlyFixedExpenses: '',
  });
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleNext = () => {
    if (step === 1 && !formData.businessName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Business name required',
        description: 'Please enter your business name.',
      });
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleComplete = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('businesses').insert({
        user_id: user.id,
        name: formData.businessName.trim(),
        type: formData.businessType,
        currency: formData.currency,
        starting_balance: parseFloat(formData.startingBalance) || 0,
        monthly_fixed_expenses: parseFloat(formData.monthlyFixedExpenses) || 0,
      });

      if (error) throw error;

      // Add default categories
      const defaultCategories = [
        { name: 'Sales', type: 'income', is_default: true },
        { name: 'Investment', type: 'income', is_default: true },
        { name: 'Client Payment', type: 'income', is_default: true },
        { name: 'Rent', type: 'expense', is_default: true },
        { name: 'Salary', type: 'expense', is_default: true },
        { name: 'Marketing', type: 'expense', is_default: true },
        { name: 'Software', type: 'expense', is_default: true },
        { name: 'Utilities', type: 'expense', is_default: true },
        { name: 'Other', type: 'income', is_default: true },
        { name: 'Other', type: 'expense', is_default: true },
      ];

      await supabase.from('categories').insert(
        defaultCategories.map((cat) => ({
          user_id: user.id,
          ...cat,
        }))
      );

      toast({
        title: 'Setup complete!',
        description: 'Your business is ready. Start tracking your cash flow.',
      });
      navigate('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Setup failed',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 w-16 rounded-full transition-colors ${
                  s <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Step {step} of 3
          </p>
        </div>

        <div className="card-elevated p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mb-4">
                  <Building2 className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                  What's your business called?
                </h2>
                <p className="text-muted-foreground mt-2">
                  Don't worry, you can change this later
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) =>
                    setFormData({ ...formData, businessName: e.target.value })
                  }
                  placeholder="My Awesome Startup"
                  className="text-lg h-12"
                />
              </div>

              <Button onClick={handleNext} className="w-full">
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mb-4">
                  <Briefcase className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                  What type of business is it?
                </h2>
                <p className="text-muted-foreground mt-2">
                  This helps us customize your experience
                </p>
              </div>

              <div className="space-y-3">
                {businessTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() =>
                      setFormData({ ...formData, businessType: type.value })
                    }
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      formData.businessType === type.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{type.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {type.description}
                        </p>
                      </div>
                      {formData.businessType === type.value && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleNext} className="flex-1">
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mb-4">
                  <DollarSign className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                  Let's set up your finances
                </h2>
                <p className="text-muted-foreground mt-2">
                  Enter your current cash position
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) =>
                      setFormData({ ...formData, currency: value })
                    }
                  >
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(currencySymbols).map(([code, symbol]) => (
                        <SelectItem key={code} value={code}>
                          {symbol} {code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startingBalance">Current Cash Balance</Label>
                  <Input
                    id="startingBalance"
                    type="number"
                    value={formData.startingBalance}
                    onChange={(e) =>
                      setFormData({ ...formData, startingBalance: e.target.value })
                    }
                    placeholder="50000"
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground">
                    How much money do you have in the bank right now?
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthlyExpenses">Monthly Fixed Expenses</Label>
                  <Input
                    id="monthlyExpenses"
                    type="number"
                    value={formData.monthlyFixedExpenses}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        monthlyFixedExpenses: e.target.value,
                      })
                    }
                    placeholder="10000"
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground">
                    Rent, salaries, subscriptions - costs that don't change
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Complete Setup
                      <Check className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
