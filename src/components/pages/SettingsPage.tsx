import { useState } from 'react';
import { Save, Building2, DollarSign, Palette, Bell, Shield } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { BusinessInfo, Currency } from '@/types/cashflow';
import { currencySymbols } from '@/lib/mockData';

interface SettingsPageProps {
  businessInfo: BusinessInfo;
  onUpdate: (info: BusinessInfo) => void;
}

export function SettingsPage({ businessInfo, onUpdate }: SettingsPageProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState(businessInfo);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [lowRunwayAlerts, setLowRunwayAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);

  const handleSave = () => {
    onUpdate(formData);
    toast({
      title: 'Settings saved',
      description: 'Your business settings have been updated successfully.',
    });
  };

  return (
    <div className="space-y-8">
      {/* Business Information */}
      <div className="card-elevated p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Business Information
            </h2>
            <p className="text-sm text-muted-foreground">
              Update your business details
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter business name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessType">Business Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: BusinessInfo['type']) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger id="businessType">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="saas">SaaS</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select
              value={formData.currency}
              onValueChange={(value: Currency) =>
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
            <Label htmlFor="startingBalance">Starting Balance</Label>
            <Input
              id="startingBalance"
              type="number"
              value={formData.startingBalance}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  startingBalance: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="Enter starting balance"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="fixedExpenses">Monthly Fixed Expenses</Label>
            <Input
              id="fixedExpenses"
              type="number"
              value={formData.monthlyFixedExpenses}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  monthlyFixedExpenses: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="Enter monthly fixed expenses"
            />
            <p className="text-xs text-muted-foreground">
              Include rent, salaries, subscriptions, and other recurring costs
            </p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card-elevated p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
            <Bell className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Notifications
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage your notification preferences
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Email Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Low Runway Alerts</p>
              <p className="text-sm text-muted-foreground">
                Get notified when runway drops below 3 months
              </p>
            </div>
            <Switch
              checked={lowRunwayAlerts}
              onCheckedChange={setLowRunwayAlerts}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Weekly Reports</p>
              <p className="text-sm text-muted-foreground">
                Receive a weekly cash flow summary
              </p>
            </div>
            <Switch
              checked={weeklyReports}
              onCheckedChange={setWeeklyReports}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="min-w-[120px]">
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
