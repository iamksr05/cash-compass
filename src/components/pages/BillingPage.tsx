import { useState } from 'react';
import { CreditCard, Download, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const invoices = [
  { id: '1', date: '2024-12-01', amount: 29.99, status: 'paid' },
  { id: '2', date: '2024-11-01', amount: 29.99, status: 'paid' },
  { id: '3', date: '2024-10-01', amount: 29.99, status: 'paid' },
];

const plans = [
  {
    name: 'Free',
    price: 0,
    features: ['Basic cash tracking', 'Up to 50 transactions/month', 'Email support'],
    current: false,
  },
  {
    name: 'Pro',
    price: 29.99,
    features: ['Unlimited transactions', 'Forecasting & insights', 'CSV & PDF exports', 'Priority support'],
    current: true,
  },
  {
    name: 'Business',
    price: 79.99,
    features: ['Everything in Pro', 'Multiple businesses', 'Team access', 'API access', 'Dedicated support'],
    current: false,
  },
];

export function BillingPage() {
  const { toast } = useToast();
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvc: '' });

  const handleUpgrade = (planName: string) => {
    setSelectedPlan(planName);
    setUpgradeDialogOpen(true);
  };

  const confirmUpgrade = () => {
    toast({
      title: 'Upgrade initiated',
      description: `Your upgrade to ${selectedPlan} plan is being processed. You'll receive a confirmation email shortly.`,
    });
    setUpgradeDialogOpen(false);
  };

  const handleUpdatePayment = () => {
    if (!cardData.number || !cardData.expiry || !cardData.cvc) {
      toast({ variant: 'destructive', title: 'Please fill in all card details' });
      return;
    }
    toast({
      title: 'Payment method updated',
      description: 'Your card has been updated successfully.',
    });
    setPaymentDialogOpen(false);
    setCardData({ number: '', expiry: '', cvc: '' });
  };

  const handleDownloadInvoice = (invoice: typeof invoices[0]) => {
    const invoiceContent = `
INVOICE
=======

CashFlow Pro Subscription
Date: ${new Date(invoice.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Amount: $${invoice.amount}
Status: ${invoice.status.toUpperCase()}

Invoice ID: INV-${invoice.id.padStart(6, '0')}

Thank you for your business!
    `.trim();

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoice.date}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Invoice downloaded',
      description: 'Your invoice has been downloaded.',
    });
  };

  return (
    <div className="space-y-8">
      {/* Current Plan */}
      <div className="card-elevated p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Current Plan</h2>
            <p className="text-sm text-muted-foreground">Manage your subscription</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border-2 p-6 transition-all ${plan.current
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground/30'
                }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                {plan.current && (
                  <Badge variant="default" className="bg-primary">
                    Current
                  </Badge>
                )}
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold text-foreground">${plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="mb-6 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-success" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.current ? 'outline' : 'default'}
                className="w-full"
                disabled={plan.current}
                onClick={() => !plan.current && handleUpgrade(plan.name)}
              >
                {plan.current ? 'Current Plan' : 'Upgrade'}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div className="card-elevated p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <CreditCard className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Payment Method</h2>
              <p className="text-sm text-muted-foreground">Manage your payment details</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => setPaymentDialogOpen(true)}>
            Update
          </Button>
        </div>

        <div className="flex items-center gap-4 rounded-lg bg-muted p-4">
          <div className="flex h-12 w-16 items-center justify-center rounded bg-background">
            <span className="text-sm font-bold text-foreground">VISA</span>
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">•••• •••• •••• 4242</p>
            <p className="text-sm text-muted-foreground">Expires 12/2025</p>
          </div>
          <CheckCircle className="h-5 w-5 text-success" />
        </div>
      </div>

      {/* Billing History */}
      <div className="card-elevated p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <Download className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Billing History</h2>
            <p className="text-sm text-muted-foreground">Download past invoices</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Amount</th>
                <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="py-4 text-sm text-foreground">
                    {new Date(invoice.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="py-4 text-sm font-medium text-foreground">${invoice.amount}</td>
                  <td className="py-4">
                    <Badge variant="outline" className="text-success border-success/30 bg-success/10">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Paid
                    </Badge>
                  </td>
                  <td className="py-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadInvoice(invoice)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upgrade Dialog */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade to {selectedPlan}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-muted-foreground">
              You're about to upgrade to the {selectedPlan} plan. Your card will be charged
              immediately and your new features will be available right away.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setUpgradeDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={confirmUpgrade} className="flex-1">
                Confirm Upgrade
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Method Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Payment Method</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                value={cardData.number}
                onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                placeholder="1234 5678 9012 3456"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry</Label>
                <Input
                  id="expiry"
                  value={cardData.expiry}
                  onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                  placeholder="MM/YY"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  value={cardData.cvc}
                  onChange={(e) => setCardData({ ...cardData, cvc: e.target.value })}
                  placeholder="123"
                />
              </div>
            </div>
            <Button onClick={handleUpdatePayment} className="w-full">
              Update Card
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
